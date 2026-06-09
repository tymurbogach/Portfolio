export const prerender = false;

import type { APIRoute } from "astro";
import {
  OLLAMA_CONFIG,
  OLLAMA_URL,
  MAX_HISTORY_MESSAGES,
  SYSTEM_PROMPT,
  type Message,
} from "../../lib/chatConfig";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_SESSIONS       = 200;
const SESSION_TTL_MS     = 60 * 60 * 1000; // 1 hour

type Session = { history: Message[]; lastAccess: number };
const sessions = new Map<string, Session>();

function cleanSessions(): void {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastAccess > SESSION_TTL_MS) sessions.delete(id);
  }
  if (sessions.size > MAX_SESSIONS) {
    const oldest = [...sessions.entries()].sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    for (let i = 0; i < sessions.size - MAX_SESSIONS; i++) sessions.delete(oldest[i][0]);
  }
}

function getHistory(sessionId: string): Message[] {
  cleanSessions();
  const existing = sessions.get(sessionId);
  if (existing) { existing.lastAccess = Date.now(); return existing.history; }
  const session: Session = { history: [], lastAccess: Date.now() };
  sessions.set(sessionId, session);
  return session.history;
}

function trimHistory(history: Message[]): void {
  while (history.length > MAX_HISTORY_MESSAGES) history.splice(0, 2);
}

function sseError(msg: string): Response {
  return new Response(
    `data: ${JSON.stringify({ error: msg })}\ndata: [DONE]\n\n`,
    { headers: { "Content-Type": "text/event-stream" } },
  );
}

export const POST: APIRoute = async ({ request }) => {
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

  const history = getHistory(sessionId);
  history.push({ role: "user", content: message.trim() });
  trimHistory(history);

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
    });
  } catch {
    history.pop(); // remove user message — Ollama unreachable, don't corrupt history
    return sseError("Cannot reach Ollama service");
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    history.pop();
    return sseError(`Ollama returned ${ollamaRes.status}`);
  }

  const encoder = new TextEncoder();
  let assistantReply = "";
  let replySaved     = false;

  const stream = new ReadableStream({
    async start(controller) {
      const reader  = ollamaRes.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

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
      } finally {
        // Stream ended without done:true — save whatever we got, or roll back
        if (!replySaved) {
          if (assistantReply) {
            history.push({ role: "assistant", content: assistantReply });
          } else {
            history.pop(); // remove orphaned user message
          }
        }
        controller.close();
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
