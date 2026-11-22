import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../src/pages/api/chat";

type Ctx = Parameters<typeof POST>[0];

type UpstreamMessage = { role: string; content: string };

const upstreamBodies: { messages: UpstreamMessage[] }[] = [];

function ollamaStream(chunks: Record<string, unknown>[]): Response {
  const payload =
    chunks.map((chunk) => JSON.stringify(chunk)).join("\n") + "\n";
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(payload));
      controller.close();
    },
  });
  return new Response(body, { status: 200 });
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): Ctx {
  const request = new Request("http://test.local/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { request } as Ctx;
}

function stubOllama(
  respond: () => Response | Promise<Response> = () =>
    ollamaStream([{ message: { content: "ok" }, done: true }]),
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const parsed = JSON.parse(String(init?.body)) as {
        messages: UpstreamMessage[];
      };
      upstreamBodies.push({ messages: parsed.messages });
      return respond();
    }),
  );
}

beforeEach(() => {
  upstreamBodies.length = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/chat validation", () => {
  it("rejects a body without message or sessionId", async () => {
    const res = await POST(makeRequest({}, { "x-forwarded-for": "1.1.1.1" }));
    expect(res.status).toBe(400);
  });

  it("rejects a message over the length limit", async () => {
    const res = await POST(
      makeRequest(
        { message: "a".repeat(1001), sessionId: "test-session-0001" },
        { "x-forwarded-for": "1.1.1.2" },
      ),
    );
    expect(res.status).toBe(400);
  });

  it("rejects a session id outside the allowed shape", async () => {
    const res = await POST(
      makeRequest(
        { message: "hi", sessionId: "bad id with spaces!" },
        { "x-forwarded-for": "1.1.1.3" },
      ),
    );
    expect(res.status).toBe(400);
  });

  it("rejects an oversized payload before parsing it", async () => {
    const res = await POST(
      makeRequest(
        { message: "hi", sessionId: "test-session-0002" },
        { "x-forwarded-for": "1.1.1.4", "content-length": "99999" },
      ),
    );
    expect(res.status).toBe(413);
  });
});

describe("POST /api/chat streaming", () => {
  it("streams tokens and keeps the conversation context", async () => {
    stubOllama(() =>
      ollamaStream([
        { message: { content: "Hello" }, done: false },
        { message: { content: " there" }, done: false },
        { message: { content: "" }, done: true },
      ]),
    );

    const first = await POST(
      makeRequest(
        { message: "hi", sessionId: "test-stream-0001" },
        { "x-forwarded-for": "2.2.2.1" },
      ),
    );
    expect(first.headers.get("Content-Type")).toContain("text/event-stream");
    const text = await first.text();
    expect(text).toContain(`data: ${JSON.stringify({ token: "Hello" })}`);
    expect(text).toContain(`data: ${JSON.stringify({ token: " there" })}`);
    expect(text).toContain("data: [DONE]");

    await POST(
      makeRequest(
        { message: "again", sessionId: "test-stream-0001" },
        { "x-forwarded-for": "2.2.2.1" },
      ),
    );
    const roles = upstreamBodies.at(-1)!.messages.map((m) => m.role);
    expect(roles[0]).toBe("system");
    expect(roles).toEqual(["system", "user", "assistant", "user"]);
  });

  it("reports an upstream failure as an SSE error and rolls back", async () => {
    stubOllama(() => new Response("boom", { status: 500 }));

    const res = await POST(
      makeRequest(
        { message: "hi", sessionId: "test-rollback-0001" },
        { "x-forwarded-for": "2.2.2.2" },
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Ollama returned 500");

    await POST(
      makeRequest(
        { message: "hi", sessionId: "test-rollback-0001" },
        { "x-forwarded-for": "2.2.2.2" },
      ),
    );
    const roles = upstreamBodies.at(-1)!.messages.map((m) => m.role);
    expect(roles).toEqual(["system", "user"]);
  });

  it("returns 504 when Ollama times out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("signal timed out", "TimeoutError");
      }),
    );
    const res = await POST(
      makeRequest(
        { message: "hi", sessionId: "test-timeout-0001" },
        { "x-forwarded-for": "2.2.2.3" },
      ),
    );
    expect(res.status).toBe(504);
  });

  it("streams a friendly error when Ollama is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const res = await POST(
      makeRequest(
        { message: "hi", sessionId: "test-down-0001" },
        { "x-forwarded-for": "2.2.2.4" },
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Cannot reach Ollama service");
  });

  it("stops quietly when the client is already gone", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("aborted", "AbortError");
      }),
    );
    const controller = new AbortController();
    controller.abort();
    const request = {
      signal: controller.signal,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ message: "hi", sessionId: "test-gone-0001" }),
    };
    const res = await POST({
      request: request as unknown as Request,
    } as Ctx);
    expect(res.status).toBe(499);
  });
});

describe("POST /api/chat rate limit", () => {
  it("blocks a noisy client after the window budget", async () => {
    stubOllama();
    const headers = { "x-forwarded-for": "5.5.5.5" };

    for (let i = 0; i < 20; i++) {
      const res = await POST(
        makeRequest(
          { message: `m${i}`, sessionId: `test-limit-${i}` },
          headers,
        ),
      );
      expect(res.status).toBe(200);
    }

    const blocked = await POST(
      makeRequest(
        { message: "again", sessionId: "test-limit-overflow" },
        headers,
      ),
    );
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("60");
  });
});
