# Visit Counter — Design Spec

## Context

Portfolio has Umami analytics running on Pi (localhost:3002). Want to display total pageviews + unique visitors in the Hero section as a live counter fetched server-side on each request.

## Architecture

SSR fetch on every request:
1. `POST http://localhost:3002/api/auth/login` → JWT token (cached in memory, valid 24h)
2. `GET http://localhost:3002/api/websites/{id}/stats?startAt=0&endAt={now}&unit=day&timezone=UTC` → pageviews + visitors
3. Render numbers in Hero between CTAs and matrix typewriter

Token cached at module level — avoids login on every page load.

## Files

| Action | Path |
|--------|------|
| Create | `src/lib/umami.ts` |
| Modify | `src/components/sections/Hero.astro` |
| Modify | `src/content/home/data.json` (no change — counter is separate) |

## umami.ts API

```ts
getVisitorStats(): Promise<{ pageviews: number; visitors: number } | null>
```

Returns `null` on any error (Umami down, wrong creds, timeout) — Hero hides counter gracefully.

## Display

Two inline chips in Hero, below CTA buttons, above matrix typewriter:
- `{pageviews}` + label "views"
- `{visitors}` + label "visitors"

Style: accent-color number, small uppercase label, border — consistent with ProfilePanel stats chips. Hidden if stats is `null`.

## Env vars (already in .env)

- `UMAMI_URL=http://localhost:3002`
- `UMAMI_USERNAME=timur`
- `UMAMI_PASSWORD=...`
- `UMAMI_WEBSITE_ID=2e2eb1bc-fab1-4307-95c4-042ff442884c`

## Error handling

- Auth fail → return null → counter hidden
- Stats fetch fail → return null → counter hidden
- Timeout (>2s) → return null → counter hidden
- No FOUC — counter is SSR, either present or absent on first paint
