interface UmamiStats {
  pageviews: number;
  visitors: number;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;
let warnedMissingConfig = false;

// Short server-side cache: a burst of visitors is one Umami query, not N.
const STATS_CACHE_MS = 60_000;
let statsCache: { stats: UmamiStats; expiry: number } | null = null;

const UMAMI_URL = import.meta.env.UMAMI_URL ?? process.env.UMAMI_URL;
const UMAMI_USERNAME =
  import.meta.env.UMAMI_USERNAME ?? process.env.UMAMI_USERNAME;
const UMAMI_PASSWORD =
  import.meta.env.UMAMI_PASSWORD ?? process.env.UMAMI_PASSWORD;
const UMAMI_WEBSITE =
  import.meta.env.UMAMI_WEBSITE_ID ?? process.env.UMAMI_WEBSITE_ID;

function hasUmamiConfig(): boolean {
  return Boolean(
    UMAMI_URL && UMAMI_USERNAME && UMAMI_PASSWORD && UMAMI_WEBSITE,
  );
}

function dropCachedToken(): void {
  cachedToken = null;
  tokenExpiry = 0;
}

async function getToken(): Promise<string | null> {
  if (!hasUmamiConfig()) return null;
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  try {
    const res = await fetch(`${UMAMI_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: UMAMI_USERNAME,
        password: UMAMI_PASSWORD,
      }),
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = data.token ?? null;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    return cachedToken;
  } catch {
    return null;
  }
}

export async function getVisitorStats(): Promise<UmamiStats | null> {
  if (!hasUmamiConfig()) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn(
        "[umami] missing UMAMI_URL/UMAMI_USERNAME/UMAMI_PASSWORD/UMAMI_WEBSITE_ID — /api/stats stays 503",
      );
    }
    return null;
  }

  const cached = statsCache;
  if (cached && Date.now() < cached.expiry) return cached.stats;

  const token = await getToken();
  if (!token) return null;

  try {
    const params = new URLSearchParams({
      startAt: "0",
      endAt: String(Date.now()),
      unit: "day",
      timezone: "UTC",
    });
    const res = await fetch(
      `${UMAMI_URL}/api/websites/${UMAMI_WEBSITE}/stats?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(2000),
      },
    );
    if (!res.ok) {
      // Umami rejected the cached token (revoked server-side): drop it so the
      // next request logs in again instead of answering 503 until expiry.
      dropCachedToken();
      return null;
    }
    const data = await res.json();
    const stats: UmamiStats = {
      pageviews: data.pageviews ?? 0,
      visitors: data.visitors ?? 0,
    };
    statsCache = { stats, expiry: Date.now() + STATS_CACHE_MS };
    return stats;
  } catch {
    dropCachedToken();
    return null;
  }
}
