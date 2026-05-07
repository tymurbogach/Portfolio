# Portfolio Visual Redesign — Design Spec
**Date:** 2026-05-07  
**Status:** Approved

---

## Problem

- All sections look identical (monotony)
- Too many boxes/borders cluttering the view
- 4K screens feel empty, small screens feel cramped
- Everything feels too narrow
- Hero titles stack awkwardly on vertical-constrained screens
- Project card images (landscape/16:9) display poorly in current narrow column layout
- Tech strip is static text, not animated
- Content missing: selfhosting, NAS AI chatbot, AI integrations

---

## Goals

1. Each section fits in one viewport (100dvh) — no vertical scroll within a section
2. Scroll snaps to section boundaries (like clicking nav)
3. Dual layout (ProfilePanel sidebar + right panel) maintained
4. Remove box/border visual pattern — replace with spacing, accent lines, color zones
5. Fluid typography via `clamp()` — no awkward stacking at any viewport size
6. Landscape project images render correctly
7. Infinite animated tech strip with expanded content
8. Hero CTAs ("Let's Talk", "My Work") use same scroll function as nav
9. Location + quote moved from About → Hero bottom strip
10. Code clean, readable, separation of concerns maintained

---

## Architecture

### Scroll Snap (global)

`#content-scroll` (existing scroll container in `Layout.astro`) receives:
```css
scroll-snap-type: y mandatory;
```

Each section root element receives:
```css
scroll-snap-align: start;
height: 100dvh;
overflow: hidden;
```

`sectionNav.ts` already handles URL sync and popstate. Small extension: add `[data-scroll-target]` selector alongside `.nav-link[href]` intercept (~3 lines). Hero CTAs use `data-scroll-target="projects"` / `data-scroll-target="contact"` attributes. No private function export needed.

Remove home-specific `minHeight` dynamic logic from `sectionNav.ts` (lines 50–55) — redundant once all sections use `height: 100dvh`.

### Typography Scale (global)

Replace fixed `text-*` classes with `clamp()` custom properties per section:
- Hero h1: `clamp(2.2rem, 4vw + 1rem, 5.5rem)`
- Hero h2: `clamp(1.2rem, 2vw + 0.5rem, 2.2rem)`
- Section headings: `clamp(1.5rem, 2.5vw, 3rem)`
- Body: `clamp(0.75rem, 1vw, 1rem)`

### Visual Language (replaces box pattern)

| Old | New |
|-----|-----|
| `border border-[--border-color]` | `border-l-2 border-[--accent-color]` (left accent line) |
| Card with bg + border | Color zone: `bg-[--component-background]` no border, spaced |
| Box per item | Grouped rows with 1px gradient separator line |
| Explicit padding boxes | Whitespace as separator |

---

## Section Designs

### Hero

**Layout:** Asymmetric 2-col. Left (60%): content stack. Right (40%): decorative ghost letters (user's name, opacity 0.03, font-display, no interaction).

**Content stack (top → bottom):**
1. Small role label (`FRONTEND DEVELOPER · SYSTEMS ENTHUSIAST`)
2. H1 main title — `clamp(2.2rem, 4vw + 1rem, 5.5rem)`
3. H2 subtitle — `clamp(1.2rem, 2vw + 0.5rem, 2.2rem)`, opacity 0.6
4. CTA row: "My Work" (primary) + "Let's Talk" (ghost) — both call `scrollToSection`
5. **Marquee strip** (full width, spans both cols): infinite CSS animation, no JS
6. **Bottom strip** (absolute bottom): location icon + text · quote with `neon-left-border`

**Marquee content:**
```
TypeScript · Laravel · Angular · Astro · Docker · Linux · Raspberry Pi · 
Self-hosting · Ollama · NAS · Nginx · Tailwind · Cloudflare · PHP · Python · 
SCSS · Git · Claude API · n8n · AI Integration ·
```
CSS implementation: duplicate track for seamless loop, `animation: marquee 30s linear infinite`.

**Location + quote source:** Hero reads `location` and `quote` from `getAboutData()` (existing `about/data.json`). No data migration needed.

---

### About (condensed)

**Goal:** Fit in 100dvh. Remove quote + location (now in Hero). Remove hobbies row (replaced by tiny icon strip).

**Layout:** 2 columns.  
- Left (55%): Journey timeline — vertical line (1px accent) with dot markers. Sort journey by year descending, `slice(0, 4)` → shows: Now → 2025 → 2023 → 2022. No JSON change. Each entry: year (accent color, small caps) + event (bold) + detail (opacity 0.5, 1 line max).  
- Right (45%): Education (2 items, stacked, no box — accent left border + title + sub + years) + Hobbies (inline icon row, 4–6 icons, opacity 0.4, small label on hover).

**Removed:** `quote`, `location` (moved to Hero).  
**Data change:** `about/data.json` — show only 4 journey entries max (keep existing data, add `featured: true` flag to top 4, or slice first 4 in component).

---

### Resume

**Goal:** Fit in 100dvh. No individual chip borders.

**Layout:** 2 columns.  
- Left: Frontend skills + Backend skills  
- Right: Homelab skills + Languages

**Skill display:** Per category — small category label (tracking-widest, opacity 0.4) + horizontal row of skills. Each skill: icon (16px) + label text, separated by `·`. No individual border per chip. Category separated from next by 1px gradient line.

**Languages:** Bottom of right column. Flag emoji + language name + level shown as short accent bar (width proportional to level).

**No SectionHeading component needed** — category labels styled inline.

---

### Projects

**Goal:** Landscape images display correctly. Fit ~4 projects in viewport.

**Card redesign (vertical):**
- Image: top of card, `aspect-ratio: 16/9`, `object-fit: cover`, full card width. No distortion.
- Badge (live/src): absolute overlay, top-left of image area
- Content below image: title + 1-line description (truncated) + tags row
- No border on card → `background: var(--component-background)` + hover: `box-shadow: 0 0 20px var(--glow-primary)` + `transform: translateY(-2px)`
- Index number: bottom-right ghost, opacity 0.04 (keep existing pattern)

**Grid — all 5 projects visible, no section scroll:**
- `mobile`: horizontal scroll row (`overflow-x: auto; scroll-snap-type: x mandatory`), cards ~280px wide. Section stays 100dvh.
- `tablet`: 2 cols, 3 rows. Cards compact (image aspect-ratio 2/1 at this breakpoint). Fits ~768px height.
- `laptop`: 3 cols, 2 rows (3+2). `grid-template-columns: repeat(3, 1fr)`.
- `fhd+`: 5 cols, 1 row. All cards in single line.

Cards ordered by `order` field. Gap `0.75rem`.

**ProjectCard.astro:** Full rewrite — image moves from left column to top of card.

---

### Contact

**Goal:** Fit in 100dvh. No info boxes.

**Layout:** 55/45 split.  
- Left (55%): Form (`FormField` components, existing). Submit button full width.  
- Right (45%): 
  - Info items: icon + label + value, each with 2px left accent border, no surrounding box. Items: email, location, status.
  - Social links row at bottom (existing `SocialLinks` component).

**SectionHeading** at top spans full width.

---

### ProfilePanel (sidebar)

**Changes only:**
- Stats: change from 2×2 grid → single horizontal row (4 stats inline, flex).
- Bio: `line-height: 1.7` (more breathing room), font-size slightly smaller at small viewports.
- Photo: `aspect-ratio: 1 / 1` maintained, no change needed.
- CV button: no change.

---

## Content Updates

### Tech strip additions
Already listed above in Marquee content.

### About data (`src/content/about/data.json`)
- Remove `quote` and `location` — these move to `src/content/hero/data.json` (or keep in about but read from Hero component).
- Add `featured` boolean to journey entries to control which 4 show.

### Hero data
No new data source. Hero component imports `getAboutData()` and reads `location` and `quote` from existing `about/data.json`.

### Resume data (`src/content/resume/data.json`)
Add missing skills:
- Homelab: add `Proxmox`, `Cloudflare`, `n8n`, `Ollama`
- Backend: add `Python`, `AI Integration`

### Projects (`src/content/projects/`)
- Verify all images have landscape ratio source files
- Adjust `order` if needed (LazyTrip = 1 already)

---

## Files Changed

| File | Change |
|------|--------|
| `src/layouts/Layout.astro` | Add `scroll-snap-type: y mandatory` to `#content-scroll` |
| `src/styles/global.css` | Add `@keyframes marquee`, snap utilities, clamp tokens |
| `src/components/sections/Hero.astro` | Full redesign: asymmetric layout, ghost letters, marquee, location+quote bottom strip, CTA scroll |
| `src/components/sections/About.astro` | Condense: 2-col, 4 entries max, remove quote/location |
| `src/components/sections/Resume.astro` | Rewrite: 2-col, inline skill rows, no chip borders |
| `src/components/sections/Projects.astro` | Grid layout change |
| `src/components/ui/ProjectCard.astro` | Full rewrite: vertical card, image top 16:9 |
| `src/components/sections/Contact.astro` | 55/45 split, no info boxes |
| `src/components/sections/ProfilePanel.astro` | Stats → horizontal row |
| `src/components/ui/Chip.astro` | Keep for backward compat, may be unused after Resume change |
| `src/content/home/data.json` | Add `location`, `quote` fields |
| `src/content/about/data.json` | Add `featured` to journey entries, mark top 4 |
| `src/content/resume/data.json` | Add missing skills |
| `src/scripts/sectionNav.ts` | Add `[data-scroll-target]` intercept; remove redundant `minHeight` home logic |

---

## Out of Scope

- Theme changes (all 4 themes still work via CSS variables)
- Navigation component changes
- Contact form backend (Web3Forms)
- New pages/routes
- Animations beyond marquee and hover effects (no GSAP, no scroll-triggered animations)
