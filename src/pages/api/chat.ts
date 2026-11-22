export const prerender = false;

import type { APIRoute } from "astro";
import {
  OLLAMA_CONFIG,
  OLLAMA_URL,
  MAX_HISTORY_MESSAGES,
  type Message,
} from "../../lib/chatConfig";
import { composeSystemPrompt } from "../../lib/chatPrompt";
import {
  getAboutData,
  getContactData,
  getProjects,
  getResumeData,
} from "../../lib/content";

// Composed once per process: content is immutable for a running build.
let cachedSystemPrompt: Promise<string> | null = null;
function getSystemPrompt(): Promise<string> {
  cachedSystemPrompt ??= (async () =>
    composeSystemPrompt({
      contact: await getContactData(),
      resume: await getResumeData(),
      about: await getAboutData(),
      projects: await getProjects(),
    }))();
  return cachedSystemPrompt;
}

const MAX_MESSAGE_LENGTH = 1000;
const MAX_BODY_BYTES = 8_192; // JSON body guard; the real text limit is above
const MAX_REPLY_CHARS = 4_000; // defense against a runaway upstream
const MAX_SESSIONS = 200;
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

// llama3.2:3b on the Pi rarely needs more than 60 s for num_predict=120;
// past that the client only sees a stuck typing indicator.
const OLLAMA_TIMEOUT_MS = 60_000;

/*
 * Rate limit per client IP (fixed window). Header-based IPs are spoofable
 * without a trusted proxy, so treat this as a fallback: the authoritative
 * rule must live at the edge (Cloudflare) in front of the Pi.
 */
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_RATE_BUCKETS = 1_000;

type Session = { history: Message[]; lastAccess: number };
const sessions = new Map<string, Session>();

const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function cleanSessions(): void {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastAccess > SESSION_TTL_MS) sessions.delete(id);
  }
  if (sessions.size > MAX_SESSIONS) {
    const oldest = [...sessions.entries()].sort(
      (a, b) => a[1].lastAccess - b[1].lastAccess,
    );
    for (let i = 0; i < sessions.size - MAX_SESSIONS; i++)
      sessions.delete(oldest[i][0]);
  }
}

function getHistory(sessionId: string): Message[] {
  cleanSessions();
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.lastAccess = Date.now();
    return existing.history;
  }
  const session: Session = { history: [], lastAccess: Date.now() };
  sessions.set(sessionId, session);
  return session.history;
}

function trimHistory(history: Message[]): void {
  while (history.length > MAX_HISTORY_MESSAGES) history.splice(0, 2);
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    request.headers.get("cf-connecting-ip") ??
    (forwarded ? forwarded.split(",")[0]!.trim() : null) ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (rateBuckets.size > MAX_RATE_BUCKETS) {
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS)
        rateBuckets.delete(key);
    }
    while (rateBuckets.size > MAX_RATE_BUCKETS) {
      const oldest = rateBuckets.keys().next().value;
      if (oldest === undefined) break;
      rateBuckets.delete(oldest); // insertion order = oldest window first
    }
  }

  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function sseError(msg: string): Response {
  return new Response(
    `data: ${JSON.stringify({ error: msg })}\ndata: [DONE]\n\n`,
    { headers: { "Content-Type": "text/event-stream" } },
  );
}

export const POST: APIRoute = async ({ request }) => {
  if (isRateLimited(clientIp(request))) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }

  let body: { message?: string; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { message, sessionId } = body;
  if (!message?.trim() || !sessionId) {
    return new Response("Missing message or sessionId", { status: 400 });
  }
  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return new Response("Message too long", { status: 400 });
  }
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return new Response("Invalid session id", { status: 400 });
  }

  const history = getHistory(sessionId);
  history.push({ role: "user", content: message.trim() });
  trimHistory(history);

  const SYSTEM_PROMPT = await getSystemPrompt();

  // Cancel Ollama when the client disconnects and give up after the budget.
  const upstreamSignal = AbortSignal.any([
    request.signal,
    AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  ]);

  let ollamaRes: Response;
  try {
    ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_CONFIG.model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        options: OLLAMA_CONFIG.options,
        stream: true,
      }),
      signal: upstreamSignal,
    });
  } catch (err) {
    history.pop(); // remove user message — Ollama unreachable, don't corrupt history
    if (request.signal.aborted) return new Response(null, { status: 499 });
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    if (timedOut)
      return new Response("Ollama gateway timeout", { status: 504 });
    return sseError("Cannot reach Ollama service");
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    history.pop();
    return sseError(`Ollama returned ${ollamaRes.status}`);
  }

  const encoder = new TextEncoder();
  let assistantReply = "";
  let replySaved = false;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const chunk = JSON.parse(line);
              const token: string = chunk.message?.content ?? "";
              if (token) {
                assistantReply += token;

                // Runaway upstream: cap the reply, save the trimmed version
                // and stop reading instead of streaming without end.
                if (assistantReply.length > MAX_REPLY_CHARS) {
                  history.push({
                    role: "assistant",
                    content: assistantReply.slice(0, MAX_REPLY_CHARS),
                  });
                  replySaved = true;
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  await reader.cancel();
                  return;
                }

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
                );
              }
              if (chunk.done) {
                history.push({ role: "assistant", content: assistantReply });
                replySaved = true;
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
            } catch {
              /* partial JSON line — skip */
            }
          }
        }
      } catch {
        // Client disconnected mid-stream: keep whatever arrived so the
        // session context stays coherent for the next message.
      } finally {
        // Stream ended without done:true — save whatever we got, or roll back
        if (!replySaved) {
          if (assistantReply) {
            history.push({ role: "assistant", content: assistantReply });
          } else {
            history.pop(); // remove orphaned user message
          }
        }
        try {
          controller.close();
        } catch {
          /* controller already closed after cancel/abort */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
};
