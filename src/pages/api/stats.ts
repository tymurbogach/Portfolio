export const prerender = false;

import type { APIRoute } from "astro";
import { getVisitorStats } from "../../lib/umami";

export const GET: APIRoute = async () => {
  const stats = await getVisitorStats();
  if (!stats) {
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(stats), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
};
