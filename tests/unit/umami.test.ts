import { afterEach, describe, expect, it, vi } from "vitest";

const UMAMI_KEYS = [
  "UMAMI_URL",
  "UMAMI_USERNAME",
  "UMAMI_PASSWORD",
  "UMAMI_WEBSITE_ID",
] as const;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Fresh module instance with the given env, as the server would see it. */
async function importUmami(env: Record<string, string>) {
  vi.resetModules();
  for (const key of UMAMI_KEYS) delete process.env[key];
  Object.assign(process.env, env);
  return await import("../../src/lib/umami");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  for (const key of UMAMI_KEYS) delete process.env[key];
});

describe("getVisitorStats", () => {
  it("returns null without touching the network when env is incomplete", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getVisitorStats } = await importUmami({});
    expect(await getVisitorStats()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the stats on a happy path", async () => {
    const fetchMock = vi.fn(async (url: unknown) => {
      if (String(url).includes("/api/auth/login")) {
        return jsonResponse(200, { token: "tok-1" });
      }
      return jsonResponse(200, { pageviews: 11, visitors: 7 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getVisitorStats } = await importUmami({
      UMAMI_URL: "https://umami.example",
      UMAMI_USERNAME: "user",
      UMAMI_PASSWORD: "pass",
      UMAMI_WEBSITE_ID: "site",
    });
    expect(await getVisitorStats()).toEqual({ pageviews: 11, visitors: 7 });
  });

  it("drops the cached token on 401 and logs in again", async () => {
    let logins = 0;
    let statsCalls = 0;
    const fetchMock = vi.fn(async (url: unknown) => {
      if (String(url).includes("/api/auth/login")) {
        logins += 1;
        return jsonResponse(200, { token: `tok-${logins}` });
      }
      statsCalls += 1;
      return statsCalls === 1
        ? jsonResponse(401, { error: "unauthorized" })
        : jsonResponse(200, { pageviews: 3, visitors: 2 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getVisitorStats } = await importUmami({
      UMAMI_URL: "https://umami.example",
      UMAMI_USERNAME: "user",
      UMAMI_PASSWORD: "pass",
      UMAMI_WEBSITE_ID: "site",
    });

    // First call: cached token rejected → 503 data (null), token dropped.
    expect(await getVisitorStats()).toBeNull();
    // Second call: logs in again instead of reusing the rejected token.
    expect(await getVisitorStats()).toEqual({ pageviews: 3, visitors: 2 });
    expect(logins).toBe(2);
  });

  it("returns null when the login itself fails", async () => {
    const fetchMock = vi.fn(async (url: unknown) => {
      if (String(url).includes("/api/auth/login")) {
        return jsonResponse(401, { error: "bad credentials" });
      }
      throw new Error("stats should not be reached");
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getVisitorStats } = await importUmami({
      UMAMI_URL: "https://umami.example",
      UMAMI_USERNAME: "user",
      UMAMI_PASSWORD: "wrong",
      UMAMI_WEBSITE_ID: "site",
    });
    expect(await getVisitorStats()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
