# nastymur.com — Portfolio

Personal portfolio of **Tymur Bogach**, software engineer. Live at [nastymur.com](https://nastymur.com).

## Stack

| Layer         | Technology                                                                           |
| ------------- | ------------------------------------------------------------------------------------ |
| Framework     | [Astro 7](https://astro.build) — prerendered pages + Node SSR adapter for API routes |
| Styling       | Tailwind CSS v4 (`@tailwindcss/vite`, config lives in CSS — no `tailwind.config.js`) |
| Interactivity | Vanilla TS scripts + a few React islands (`motion`)                                  |
| Content       | Astro Content Collections (JSON + Markdown, Zod-validated)                           |
| AI chat       | `/api/chat` → self-hosted [Ollama](https://ollama.com) (`llama3.2:3b`)               |
| Analytics     | Self-hosted [Umami](https://umami.is); `/api/stats` exposes the visitor counter      |
| Deploy        | Docker on a Raspberry Pi (`compose.yml`, Node standalone server on port 4321)        |

## Architecture

The site is a **fake SPA**: every route (`/`, `/about`, `/resume`, `/projects`, `/contact`) renders the same single page containing all sections. Client-side, `src/scripts/sectionNav.ts` keeps the URL and the scrolled section in sync (scroll spy + smooth scroll + `history` API). Each route still gets its own `<title>`, meta description and canonical URL for SEO.

Fixed chrome (name card, nav, social links, chat toggle) lives outside the scroll container in `src/layouts/Layout.astro`; the actual scrolling happens inside `#content-scroll` (`DualMain.astro`).

### Directory map

```
src/
├── assets/            # Images optimized by astro:assets at build time
├── components/
│   ├── layout/        # Chrome: NavBar, NameCard, Header, Footer, ChatWidget
│   ├── sections/      # Page sections that read content collections
│   └── ui/            # Reusable presentational components (props only)
├── content/           # Content collections (JSON singletons + projects/*.md)
├── layouts/           # Layout.astro (HTML shell) + DualMain.astro (2-column)
├── lib/               # Shared contracts (themes, content, chat, security)
├── pages/             # One .astro per route + api/{chat,stats,health}.ts (SSR)
├── scripts/           # All client-side logic (imported by components)
└── styles/global.css  # Tailwind import, themes, tokens, utilities
```

### Theme system

7 themes defined in `src/lib/themes.ts` (single source of truth): `bladerunner` (default), `void`, `cyberpunk`, `matrix`, `bubblegum`, `doom`, `claude` — each with dark/light modes. CSS lives in `global.css` keyed by `[data-theme]`; `cyberpunk` owns bare `:root` and inverts the `.dark` convention (its `.dark` is light mode). An inline anti-flash script in `Layout.astro` applies the persisted theme before first paint, receiving its constants via `define:vars`.

## Development

```bash
npm install
cp .env.example .env   # OLLAMA_URL (chat) + UMAMI_* (visitor counter)
npm run dev            # dev server on :4321
npm run test           # unit tests (Vitest): themes, chat API, Umami
npm run test:visual    # Playwright snapshots + layout geometry
npm run themes:check   # contrast audit for all theme variants
npm run check          # astro check (types)
npm run format         # prettier
npm run build          # prerender + SSR bundle → dist/
node dist/server/entry.mjs  # run the production server locally
```

### Environment

| Variable           | Used by      | Notes                                              |
| ------------------ | ------------ | -------------------------------------------------- |
| `OLLAMA_URL`       | `/api/chat`  | LLM backend endpoint                               |
| `UMAMI_URL`        | `/api/stats` | Umami instance; without it the counter answers 503 |
| `UMAMI_USERNAME`   | `/api/stats` | Umami login                                        |
| `UMAMI_PASSWORD`   | `/api/stats` | Umami login                                        |
| `UMAMI_WEBSITE_ID` | `/api/stats` | Website to query                                   |

### Security

`/api/chat` validates its input, caps reply size and rate limits per IP
(20 req/min, `429` + `Retry-After`). Header IPs are spoofable without a
trusted proxy, so treat the server limit as a fallback: the authoritative
rule belongs at the edge (Cloudflare).

`GET /api/health` reports liveness (used by the Dockerfile `HEALTHCHECK`).

Fonts are self-hosted (`src/styles/fonts.css` + `public/fonts/`, OFL
families): no third-party font CDN, and snapshot tests no longer depend on
Google's rasterization of the day.

CSP and the basic security headers come from two channels
(`src/lib/security.ts`): the middleware header for SSR routes, and a
`<meta http-equiv>` for prerendered pages, which the node adapter serves as
static files. `frame-ancestors` and HSTS are header-only by spec: set them at
the reverse proxy for the static pages.

### CV PDFs

The PDFs are not in this repo. [cv-maker](https://github.com/tymurbogach/cv-maker)
is the single source of the CV and publishes the PDFs to the public repo
[tymurbogach/cv](https://github.com/tymurbogach/cv). The routes
`/TymurBogach_CV_{EN,ES}.pdf` fetch them from there at request time
(`src/lib/cvPdf.ts`), with an ETag revalidation every 5 minutes and a stale
copy if GitHub is down. A new CV goes live in about 10 minutes, with no build
and no deploy. Set `CV_PDF_BASE_URL` to read from another location.

## Deploy

```bash
ssh pi@192.168.18.18 '/home/pi/docker/scripts/deploy portfolio'
```

`compose.yml` maps `127.0.0.1:80:4321` (loopback only; the Cloudflare
tunnel targets `localhost:80` on the Pi) and passes `OLLAMA_URL` plus the
`UMAMI_*` variables through from the host environment. The container runs
as the unprivileged `node` user and self-checks via `/api/health`.
