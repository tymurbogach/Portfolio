import { describe, expect, it } from "vitest";
import { MAX_HISTORY_MESSAGES, OLLAMA_CONFIG } from "../../src/lib/chatConfig";

describe("chatConfig", () => {
  it("caps the reply budget", () => {
    expect(OLLAMA_CONFIG.options.num_predict).toBeGreaterThan(0);
    expect(OLLAMA_CONFIG.options.num_predict).toBeLessThanOrEqual(200);
  });

  it("keeps the history bounded", () => {
    expect(MAX_HISTORY_MESSAGES).toBeGreaterThan(0);
    expect(MAX_HISTORY_MESSAGES).toBeLessThanOrEqual(20);
  });
});
