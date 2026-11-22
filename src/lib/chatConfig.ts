// ──────────────────────────────────────────────────────────────────────────────
// Chat bot configuration — behavior only. Editorial data (greeting, starters,
// journey, skills, projects) lives in src/content and is composed into the
// system prompt by src/lib/chatPrompt.ts at request time.
// ──────────────────────────────────────────────────────────────────────────────

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// ── Ollama model settings ──────────────────────────────────────────────────────
export const OLLAMA_CONFIG = {
  model: "llama3.2:3b",
  options: {
    temperature: 0.75,
    num_ctx: 4096,
    num_predict: 120,
  },
} as const;

// ── Runtime config (set via env vars in Docker) ────────────────────────────────
export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

// Messages to retain per session (pairs: user + assistant). Keeps context without
// blowing num_ctx on long conversations.
export const MAX_HISTORY_MESSAGES = 20;
