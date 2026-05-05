export const prerender = false;

import type { APIRoute } from "astro";
import {
  OLLAMA_CONFIG,
  OLLAMA_URL,
  MAX_HISTORY_MESSAGES,
  SYSTEM_PROMPT,
  type Message,
} from "../../lib/chatConfig";

// In-memory session store: sessionId → conversation history
// (resets on server restart — intentional for a portfolio bot)
const sessions = new Map<string, Message[]>();

function getHistory(sessionId: string): Message[] {
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  return sessions.get(sessionId)!;
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
    return sseError("Cannot reach Ollama service");
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    return sseError(`Ollama returned ${ollamaRes.status}`);
  }

  const encoder = new TextEncoder();
  let assistantReply = "";

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
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
                );
              }
              if (chunk.done) {
                history.push({ role: "assistant", content: assistantReply });
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
            } catch {
              /* partial JSON line — skip */
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no", // disables Nginx buffering for SSE
    },
  });
};
