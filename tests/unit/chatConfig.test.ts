import { describe, expect, it } from "vitest";
import {
  CHAT_STARTERS,
  MAX_HISTORY_MESSAGES,
  OLLAMA_CONFIG,
  SYSTEM_PROMPT,
} from "../../src/lib/chatConfig";

describe("chatConfig", () => {
  it("caps the reply budget", () => {
    expect(OLLAMA_CONFIG.options.num_predict).toBeGreaterThan(0);
    expect(OLLAMA_CONFIG.options.num_predict).toBeLessThanOrEqual(200);
  });

  it("keeps the history bounded", () => {
    expect(MAX_HISTORY_MESSAGES).toBeGreaterThan(0);
    expect(MAX_HISTORY_MESSAGES).toBeLessThanOrEqual(20);
  });

  it("gives every starter a question and a label", () => {
    expect(CHAT_STARTERS.length).toBeGreaterThan(0);
    for (const starter of CHAT_STARTERS) {
      expect(starter.q.trim().length).toBeGreaterThan(0);
      expect(starter.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("locks the bot identity in the system prompt", () => {
    expect(SYSTEM_PROMPT).toContain("TymurBot");
    expect(SYSTEM_PROMPT).toContain("IDENTITY LOCK");
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(200);
  });
});
