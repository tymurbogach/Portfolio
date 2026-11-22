import { describe, expect, it } from "vitest";
import { GET } from "../../src/pages/api/health";

describe("GET /api/health", () => {
  it("answers ok with no-store", async () => {
    const res = await GET({} as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
