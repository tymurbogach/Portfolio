# CV Maker Integration — Design Spec

**Date:** 2026-05-25  
**Status:** Approved

## Context

Portfolio has two CV download buttons ("CV · EN" and "CV · ES") in `ProfilePanel.astro` pointing to `/cv.pdf` and `/cv-es.pdf`. Neither file exists — buttons are broken. The cv-maker repo (kyryl-bogach/cv-maker) provides a proven Node.js pipeline: JSON config → HTML template → Chromium headless → PDF, with a 1-page overflow guard. Goal: adopt that pipeline to generate and commit both PDFs.

## Decisions

| Question | Decision |
|----------|----------|
| Languages | Two independent configs: EN + ES |
| Data source | Standalone CV configs (not synced from Astro content collections) |
| Rendering | Local Chromium (`/usr/bin/chromium`) on CachyOS dev machine |
| PDF lifecycle | Committed to repo — regenerate manually with `npm run cv:pdf` when content changes |
| Dockerfile | No changes — Pi receives PDFs via git, builds with Astro as-is |
| Build hook | None — `prebuild` would break `node:22-alpine` Docker build on Pi |

## File Structure

```
cv/
├── cv.config.en.json        # CV content + theme — English
└── cv.config.es.json        # CV content + theme — Spanish

scripts/cv/
├── build-cv-html.mjs        # JSON → HTML (copied verbatim from cv-maker)
├── export-cv-pdf.mjs        # HTML → PDF via Chromium headless (copied verbatim)
└── generate-all.mjs         # Wrapper: runs export for EN then ES

public/
├── cv.pdf                   # Generated artifact — committed
└── cv-es.pdf                # Generated artifact — committed
```

## npm scripts (package.json additions)

```json
"cv:pdf":    "node scripts/cv/generate-all.mjs",
"cv:pdf:en": "CHROME_BIN=/usr/bin/chromium node scripts/cv/export-cv-pdf.mjs cv/cv.config.en.json public/cv.pdf",
"cv:pdf:es": "CHROME_BIN=/usr/bin/chromium node scripts/cv/export-cv-pdf.mjs cv/cv.config.es.json public/cv-es.pdf"
```

## generate-all.mjs

Thin wrapper (~15 lines). Sets `CHROME_BIN=/usr/bin/chromium` if not already in env, then calls `export-cv-pdf.mjs` sequentially for EN and ES configs. Exits with non-zero if either fails.

## CV Config Schema

Both configs follow the cv-maker schema exactly:

```json
{
  "profile": { "fullName", "headline", "email", "linkedin", "github", "website", "location", "phone", "photoUrl" },
  "summary": "string",
  "experience": [{ "company", "role", "location", "period", "bullets": [] }],
  "education":  [{ "institution", "degree", "period", "highlights": [] }],
  "theme": { "primary", "accent", "headingFont", "bodyFont" },
  "layout": { "page": { "size", "marginMm" }, "density": { "baseFontPx", "headingFontPx", "sectionGapPx", "itemGapPx" }, "constraints": { "maxPages": 1 } }
}
```

**Pre-filled from portfolio data:**
- `profile.fullName`: "TYMUR BOGACH"
- `profile.email`: "timurnator@gmail.com"
- `profile.location`: "Orihuela, Alicante"
- `profile.headline`: role from `src/content/profile/profile.json`
- `theme.accent`: `#4ecca3` (teal — `theme-void` accent)
- `theme.primary`: `#0d1117` (dark — `theme-void` page bg)

**Placeholder sections** (user completes): `experience`, `education`, `summary`, `profile.linkedin/github/website/photoUrl`.

**ES config** differs in: `profile.headline` in Spanish, `summary` in Spanish, `experience` bullet text in Spanish.

## Overflow Guard

`export-cv-pdf.mjs` refuses to generate the PDF if content overflows 1 page. Fix: shorten bullet points or reduce `layout.density.baseFontPx`.

## Update Workflow

```bash
# 1. Edit content
nvim cv/cv.config.en.json   # or es.json

# 2. Regenerate
npm run cv:pdf               # generates public/cv.pdf + public/cv-es.pdf

# 3. Commit + deploy
git add cv/ public/cv.pdf public/cv-es.pdf
git commit -m "update cv"
git push
ssh pi "cd ~/docker/stacks/web && docker compose up -d --build"
```

## UI — No Changes

`ProfilePanel.astro:81-111` already has both buttons wired to `/cv.pdf` and `/cv-es.pdf`. They work once the files exist in `public/`.

## Verification

1. `npm run cv:pdf` — both PDFs generated with no overflow error
2. `npm run dev` → open portfolio → click "CV · EN" → PDF opens in new tab
3. Click "CV · ES" → Spanish PDF opens
4. `npm run build` — Astro build succeeds (PDFs copied into `dist/` automatically)
5. Check `dist/cv.pdf` and `dist/cv-es.pdf` exist after build
