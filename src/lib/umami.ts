interface UmamiStats {
  pageviews: number;
  visitors: number;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  try {
    const res = await fetch(`${import.meta.env.UMAMI_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: import.meta.env.UMAMI_USERNAME,
        password: import.meta.env.UMAMI_PASSWORD,
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
      `${import.meta.env.UMAMI_URL}/api/websites/${import.meta.env.UMAMI_WEBSITE_ID}/stats?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(2000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      pageviews: data.pageviews ?? 0,
      visitors: data.visitors ?? 0,
    };
  } catch {
    cachedToken = null;
    return null;
  }
}
