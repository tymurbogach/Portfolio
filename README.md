# nastymur.com — Portfolio

Personal portfolio of **Tymur Bogach**, full stack developer. Live at [nastymur.com](https://nastymur.com).

## Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 6](https://astro.build) — prerendered pages + Node SSR adapter for API routes |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, config lives in CSS — no `tailwind.config.js`) |
| Interactivity | Vanilla TS scripts + a few React islands (`motion`) |
| Content | Astro Content Collections (JSON + Markdown, Zod-validated) |
| AI chat | `/api/chat` → self-hosted [Ollama](https://ollama.com) (`llama3.2:3b`) |
| Analytics | Self-hosted [Umami](https://umami.is); `/api/stats` exposes the visitor counter |
| Deploy | Docker on a Raspberry Pi (`compose.yml`, Node standalone server on port 4321) |

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
├── lib/               # Shared constants & helpers (themes, content, chatConfig, umami)
├── pages/             # One .astro per route + api/{chat,stats}.ts (SSR)
├── scripts/           # All client-side logic (imported by components)
└── styles/global.css  # Tailwind import, themes, tokens, utilities
```

### Theme system

7 themes defined in `src/lib/themes.ts` (single source of truth): `bladerunner` (default), `void`, `cyberpunk`, `matrix`, `bubblegum`, `doom`, `claude` — each with dark/light modes. CSS lives in `global.css` keyed by `[data-theme]`; `cyberpunk` owns bare `:root` and inverts the `.dark` convention (its `.dark` is light mode). An inline anti-flash script in `Layout.astro` applies the persisted theme before first paint, receiving its constants via `define:vars`.

## Development

```bash
npm install
cp .env.example .env   # fill in OLLAMA_URL (chat backend)
npm run dev            # dev server on :4321
npm run check          # astro check (types)
npm run format         # prettier
npm run build          # prerender + SSR bundle → dist/
node dist/server/entry.mjs  # run the production server locally
```

### CV PDFs

`public/TymurBogach_CV_{EN,ES}.pdf` are generated from `cv/cv.config.*.json` with `@react-pdf/renderer`:

```bash
npm run cv:pdf        # both languages
```

## Deploy

```bash
ssh pi@192.168.18.18 "cd ~/docker/stacks/web && docker compose up -d --build"
```

`compose.yml` maps `80:4321` and injects `OLLAMA_URL` for the chat backend.
