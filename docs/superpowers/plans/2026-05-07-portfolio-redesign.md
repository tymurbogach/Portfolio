# Portfolio Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all portfolio sections to fill 100dvh per section with scroll-snap navigation, remove box/border monotony, add animated marquee to Hero, and fix project card image display.

**Architecture:** `#content-scroll` in `DualMain.astro` becomes the scroll-snap container (no padding, no max-width). Each `<section>` in `PageContent.astro` becomes `h-[100dvh] overflow-hidden [scroll-snap-align:start]`. Every section component manages its own heading, padding, and layout filling `h-full`. Hero CTA buttons use `data-scroll-target` attribute intercepted by `sectionNav.ts`.

**Tech Stack:** Astro 6, Tailwind v4 (`@tailwindcss/vite`), TypeScript strict, simple-icons npm package.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/styles/global.css` | Modify | Add `@keyframes marquee`, `.marquee-track`, `.projects-grid` responsive CSS |
| `src/content/resume/data.json` | Modify | Add Proxmox, n8n, Python to homelab/backend |
| `src/layouts/DualMain.astro` | Modify | Remove `max-w-[72ch]` inner div, remove padding on `#content-scroll`, add `[scroll-snap-type:y_mandatory]` |
| `src/scripts/sectionNav.ts` | Modify | Add `[data-scroll-target]` intercept; remove redundant home `minHeight` logic |
| `src/components/sections/PageContent.astro` | Modify | Sections become `h-[100dvh]` snap targets; remove outer headings/padding wrappers |
| `src/components/sections/ProfilePanel.astro` | Modify | Stats from `flex-col` → `flex-row` |
| `src/components/ui/ProjectCard.astro` | Rewrite | Vertical card: image top `aspect-ratio:16/9`, content below |
| `src/components/sections/Hero.astro` | Rewrite | Asymmetric layout + marquee + location/quote bottom strip + CTA scroll buttons |
| `src/components/sections/About.astro` | Rewrite | 2-col condensed: timeline left (4 recent), education+hobbies right |
| `src/components/sections/Resume.astro` | Rewrite | 2-col: inline skill rows (no chip borders), language bars |
| `src/components/sections/Projects.astro` | Rewrite | Responsive grid: mobile row-scroll → tablet 2col → laptop 3col → fhd 5col |
| `src/components/sections/Contact.astro` | Rewrite | 55/45 split: form left, info+social right; no info boxes |

---

## Task 1: Global CSS — Marquee + Projects Grid

**Files:**
- Modify: `src/styles/global.css` (append after last `@utility` block, line 316)

- [ ] **Step 1: Append CSS to global.css**

Add at the end of `src/styles/global.css`:

```css

/* ═══════════════════════════════════════════════════════
   MARQUEE — infinite horizontal scroll strip
   ═══════════════════════════════════════════════════════ */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 40s linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused;
}

/* ═══════════════════════════════════════════════════════
   PROJECTS GRID — responsive grid (avoids overflow-hidden conflict)
   mobile: 2-col · laptop: 3-col · fhd: 5-col
   ═══════════════════════════════════════════════════════ */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  align-content: start;
}

@media (min-width: 80rem) {
  .projects-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 120rem) {
  .projects-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors. Output ends with `dist/` summary.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add marquee animation and responsive projects-grid CSS"
```

---

## Task 2: Resume Content Data — Add Missing Skills

**Files:**
- Modify: `src/content/resume/data.json`

- [ ] **Step 1: Add skills to resume data**

In `src/content/resume/data.json`, add to `backend` array (after Android):
```json
{ "slug": "python", "color": "#3776ab", "label": "Python" }
```

Add to `homelab` array (after Uptime Kuma):
```json
{ "slug": "proxmox", "color": "#e57000", "label": "Proxmox" },
{ "slug": "n8n",     "color": "#ea4b71", "label": "n8n" }
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/resume/data.json
git commit -m "content: add Python, Proxmox, n8n to resume skills"
```

---

## Task 3: DualMain — Remove Width Constraint + Add Scroll Snap

**Files:**
- Modify: `src/layouts/DualMain.astro` (lines 56–63 of current file)

- [ ] **Step 1: Replace the scrollable content block**

In `src/layouts/DualMain.astro`, find the scrollable branch (lines 56–63):
```astro
      <div
        id="content-scroll"
        class="flex-1 overflow-y-auto overflow-x-hidden
               px-[1.25rem] mobile:px-[1.75rem] tablet:px-[2.5rem] laptop:px-[4.5rem]
               pb-[4rem] laptop:pb-[5rem]"
      >
        <div class="w-full laptop:max-w-[72ch] laptop:mx-auto">
          <slot />
        </div>
      </div>
```

Replace with:
```astro
      <div
        id="content-scroll"
        class="flex-1 overflow-y-auto overflow-x-hidden [scroll-snap-type:y_mandatory]"
      >
        <slot />
      </div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors. (Site will look broken visually until PageContent is updated — that's expected.)

- [ ] **Step 3: Commit**

```bash
git add src/layouts/DualMain.astro
git commit -m "layout: remove max-width constraint and add scroll-snap to content-scroll"
```

---

## Task 4: sectionNav.ts — data-scroll-target + Remove minHeight

**Files:**
- Modify: `src/scripts/sectionNav.ts`

- [ ] **Step 1: Remove home minHeight logic (lines 50–55)**

In `src/scripts/sectionNav.ts`, find and delete these 6 lines inside `initSectionNav()`:
```typescript
  const homeSection = document.getElementById("home");
  const setHomeHeight = () => {
    if (homeSection) homeSection.style.minHeight = `${scrollEl.clientHeight}px`;
  };
  setHomeHeight();
  window.addEventListener("resize", setHomeHeight, { signal: ac.signal });
```

- [ ] **Step 2: Add data-scroll-target handler**

After the `.nav-link[href]` forEach block (after line 104), add:
```typescript
  // ── data-scroll-target: Hero CTAs and any element that should trigger section scroll ──
  document.querySelectorAll<HTMLElement>("[data-scroll-target]").forEach((el) => {
    el.addEventListener(
      "click",
      () => {
        const targetId = el.getAttribute("data-scroll-target") ?? "";
        if (!targetId || !document.getElementById(targetId)) return;
        const href = targetId === "home" ? "/" : `/${targetId}`;
        currentSection = targetId;
        history.pushState(null, "", href);
        scrollToSection(scrollEl, targetId, "smooth");
        setActiveNav(targetId);
      },
      { signal: ac.signal }
    );
  });
```

- [ ] **Step 3: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/sectionNav.ts
git commit -m "feat: add data-scroll-target intercept and remove redundant home minHeight"
```

---

## Task 5: PageContent — Sections as 100dvh Snap Containers

**Files:**
- Modify: `src/components/sections/PageContent.astro`

- [ ] **Step 1: Rewrite PageContent.astro**

Replace the entire file with:

```astro
---
import Hero     from "./Hero.astro";
import About    from "./About.astro";
import Resume   from "./Resume.astro";
import Projects from "./Projects.astro";
import Contact  from "./Contact.astro";
import {
  getSite,
  getHeroData,
  getAboutData,
  getResumeData,
  getProjects,
  getContactData,
  getSocialLinks,
  getLabeledSections,
} from "../../lib/content";
import type { LabeledSection } from "../../lib/content";

const site        = await getSite();
const heroData    = await getHeroData();
const aboutData   = await getAboutData();
const resumeData  = await getResumeData();
const projects    = await getProjects();
const contactData = await getContactData();
const socialLinks = await getSocialLinks();

const sections: LabeledSection[] = getLabeledSections(site);
---

<div class="flex flex-col w-full">

  <section
    id="home"
    class="h-[100dvh] overflow-hidden [scroll-snap-align:start] flex-shrink-0"
    aria-label="Home"
  >
    <Hero hero={heroData} />
  </section>

  {sections.map((section: LabeledSection) => (
    <section
      id={section.sectionId}
      class="h-[100dvh] overflow-hidden [scroll-snap-align:start] flex-shrink-0"
      aria-labelledby={`heading-${section.sectionId}`}
    >
      {section.sectionId === "about"    && <About    about={aboutData} />}
      {section.sectionId === "resume"   && <Resume   resume={resumeData} />}
      {section.sectionId === "projects" && <Projects projects={projects} />}
      {section.sectionId === "contact"  && <Contact  contact={contactData} socialLinks={socialLinks} />}
    </section>
  ))}

</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors. (Each section component still renders its old content but now inside a 100dvh container.)

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/PageContent.astro
git commit -m "feat: sections as 100dvh scroll-snap targets, remove outer heading wrappers"
```

---

## Task 6: ProfilePanel — Stats Horizontal Row

**Files:**
- Modify: `src/components/sections/ProfilePanel.astro` (lines 52–70)

- [ ] **Step 1: Change stats container from column to row**

Find the stats block (lines 52–70):
```astro
      <div class="flex flex-col gap-1.5 w-full">
        {stats.map(({ n, label }: { n: string; label: string }) => (
          <div
            class="flex items-baseline gap-3 px-3 py-2"
            style="border-left: 2px solid var(--accent-color); background: var(--surface-glow);"
          >
            <span
              class="font-display text-xl fhd:text-2xl leading-none"
              style="color: var(--accent-color);"
            >
              {n}
            </span>
            <span
              class="text-[0.45rem] fhd:text-[0.5rem] tracking-[0.25em] uppercase"
              style="opacity: 0.4;"
            >
              {label}
            </span>
          </div>
        ))}
      </div>
```

Replace with:
```astro
      <div class="flex flex-row gap-2 w-full">
        {stats.map(({ n, label }: { n: string; label: string }) => (
          <div
            class="flex flex-col items-center flex-1 px-2 py-2"
            style="border-left: 2px solid var(--accent-color); background: var(--surface-glow);"
          >
            <span
              class="font-display text-lg fhd:text-xl leading-none"
              style="color: var(--accent-color);"
            >
              {n}
            </span>
            <span
              class="text-[0.4rem] fhd:text-[0.45rem] tracking-[0.2em] uppercase mt-0.5 text-center"
              style="opacity: 0.4;"
            >
              {label}
            </span>
          </div>
        ))}
      </div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ProfilePanel.astro
git commit -m "refactor: ProfilePanel stats from column to horizontal row"
```

---

## Task 7: ProjectCard — Vertical Card with 16:9 Image

**Files:**
- Rewrite: `src/components/ui/ProjectCard.astro`

- [ ] **Step 1: Rewrite ProjectCard.astro**

Replace entire file with:

```astro
---
interface Props {
  title:       string;
  description: string;
  link?:       string;
  image?:      string;
  type?:       "source" | "demo";
  tags?:       string[];
  index?:      number;
}

const {
  title,
  description,
  link,
  image,
  type = "source",
  tags = [],
  index = 0,
} = Astro.props;

const isDemo   = type === "demo";
const indexStr = String(index).padStart(2, "0");
---

<a
  href={link}
  target="_blank"
  rel="noopener noreferrer"
  class="group flex flex-col overflow-hidden
         transition-all duration-300
         hover:-translate-y-0.5"
  style="background: var(--component-background);
         box-shadow: 0 0 0 transparent;
         --hover-shadow: 0 0 16px var(--glow-primary);"
  onmouseenter="this.style.boxShadow='0 0 16px var(--glow-primary)'"
  onmouseleave="this.style.boxShadow='0 0 0 transparent'"
>
  <!-- Image — 16:9 aspect ratio, full card width -->
  <div class="relative w-full overflow-hidden" style="aspect-ratio: 16/9; flex-shrink: 0;">

    <!-- Live/src badge -->
    <span
      class="absolute top-2 left-2 z-20
             text-[0.4rem] tracking-[0.2em] px-1.5 py-0.5 font-bold uppercase"
      style="border: 1px solid var(--border-subtle);
             background: var(--page-background);
             color: var(--letter-color);
             opacity: 0.85;"
    >
      {isDemo ? "● live" : "⌥ src"}
    </span>

    <!-- Ghost index number overlay -->
    <span
      class="absolute bottom-1 right-2 font-display pointer-events-none select-none"
      style="font-size: 2.5rem; line-height: 1; color: var(--letter-color); opacity: 0.05; z-index: 1;"
      aria-hidden="true"
    >{indexStr}</span>

    {image ? (
      <img
        src={image}
        alt={title}
        loading="lazy"
        class="w-full h-full object-cover opacity-65
               group-hover:opacity-90 group-hover:scale-105
               transition-all duration-500"
      />
    ) : (
      <div
        class="w-full h-full flex items-center justify-center"
        style="background: var(--page-background);"
      >
        <span class="font-display text-5xl opacity-08" style="color: var(--accent-color); opacity: 0.08;">{indexStr}</span>
      </div>
    )}
  </div>

  <!-- Content -->
  <div class="flex flex-col gap-1 p-2.5 flex-1">
    <h3 class="font-display leading-tight m-0 tracking-wide"
        style="font-size: clamp(0.8rem, 1.2vw, 1rem);">{title}</h3>
    <p class="m-0 line-clamp-1 leading-snug"
       style="font-size: 0.6rem; opacity: 0.4;">{description}</p>
    <div class="flex items-center justify-between mt-auto pt-1 gap-1">
      <div class="flex flex-wrap gap-1">
        {tags.slice(0, 2).map((tag: string) => (
          <span
            class="text-[0.38rem] tracking-[0.1em] px-1 py-0.5 uppercase font-bold"
            style="border: 1px solid var(--border-color); opacity: 0.4;"
          >{tag}</span>
        ))}
      </div>
      <span
        class="text-[0.45rem] tracking-[0.2em] uppercase font-bold shrink-0
               transition-transform duration-300 group-hover:translate-x-1"
        style="color: var(--accent-color); opacity: 0.5;"
      >→</span>
    </div>
  </div>
</a>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProjectCard.astro
git commit -m "refactor: ProjectCard rewrite — vertical card with 16:9 image header"
```

---

## Task 8: Hero — Full Redesign

**Files:**
- Rewrite: `src/components/sections/Hero.astro`

- [ ] **Step 1: Rewrite Hero.astro**

Replace entire file with:

```astro
---
import { getAboutData } from "../../lib/content";
import type { HeroData } from "../../lib/content";

interface Props {
  hero: HeroData;
}

const { hero: { title1, title2, subtitle1, subtitle2, cta } } = Astro.props;
const { location, quote } = await getAboutData();

const MARQUEE = "TypeScript · Laravel · Angular · Astro · Docker · Linux · Raspberry Pi · Self-hosting · Ollama · NAS · Nginx · Tailwind · Cloudflare · PHP · Python · SCSS · Git · Claude API · n8n · AI Integration · ";
---

<div class="relative h-full flex flex-col overflow-hidden hero-gradient">

  <!-- Dot grid background -->
  <div
    class="absolute inset-0 -z-10 pointer-events-none"
    style="background-image: radial-gradient(circle, var(--border-color) 1px, transparent 1px);
           background-size: 32px 32px; opacity: 0.10;"
    aria-hidden="true"
  />

  <!-- Main content row — fills available height -->
  <div class="flex-1 flex items-center gap-8 px-6 laptop:px-10 min-h-0">

    <!-- Left: content (flex-[3]) -->
    <div class="flex-[3] flex flex-col gap-5 min-w-0" id="theme-toggle">

      <!-- Role label -->
      <span
        class="text-[0.58rem] tracking-[0.35em] uppercase"
        style="color: var(--accent-color); opacity: 0.65;"
      >&gt; FRONTEND DEVELOPER · SYSTEMS ENTHUSIAST</span>

      <!-- Titles -->
      <div class="flex flex-col gap-1">
        <h1
          class="font-display m-0 leading-[0.95]"
          style="font-size: clamp(2.4rem, 4.5vw + 0.5rem, 5.5rem);"
        >{title1}</h1>
        <h1
          class="font-display m-0 leading-[0.95]"
          style="font-size: clamp(2.4rem, 4.5vw + 0.5rem, 5.5rem); opacity: 0.22;"
        >{title2}</h1>
      </div>

      <!-- Subtitle -->
      <p
        class="m-0 leading-relaxed"
        style="font-size: clamp(0.72rem, 1.1vw, 0.95rem); opacity: 0.5; max-width: 44ch;"
      >
        {subtitle1}<br />{subtitle2}
      </p>

      <!-- CTA buttons — use data-scroll-target (intercepted by sectionNav.ts) -->
      <div class="flex flex-wrap gap-3 pt-1">
        <button
          data-scroll-target="projects"
          class="px-5 py-2.5 text-[0.58rem] tracking-[0.3em] uppercase font-bold cursor-pointer
                 transition-opacity duration-200 hover:opacity-80"
          style="background: var(--accent-color); color: var(--accent-text); border: 1px solid var(--accent-color);"
        >
          {cta.primary}
        </button>
        <button
          data-scroll-target="contact"
          class="px-5 py-2.5 text-[0.58rem] tracking-[0.3em] uppercase font-bold cursor-pointer
                 transition-all duration-200 hover:opacity-80"
          style="background: transparent; border: 1px solid var(--border-color); color: var(--letter-color);"
        >
          {cta.secondary}
        </button>
      </div>
    </div>

    <!-- Right: ghost name decoration (desktop only) -->
    <div
      class="flex-[2] relative hidden laptop:flex items-center justify-end
             select-none pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <span
        class="font-display leading-none"
        style="font-size: clamp(8rem, 14vw, 15rem);
               color: var(--letter-color);
               opacity: 0.025;
               white-space: nowrap;"
      >TIMUR</span>
    </div>
  </div>

  <!-- Marquee strip -->
  <div
    class="w-full overflow-hidden shrink-0 py-3"
    style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);"
    aria-hidden="true"
  >
    <div
      class="marquee-track"
      style="font-size: 0.48rem; letter-spacing: 0.3em; text-transform: uppercase; font-weight: bold;
             opacity: 0.28; font-family: 'JetBrains Mono', monospace; color: var(--letter-color);"
    >
      <span>{MARQUEE}</span>
      <span>{MARQUEE}</span>
    </div>
  </div>

  <!-- Bottom strip: location + quote -->
  <div
    class="flex items-center gap-6 px-6 laptop:px-10 py-4 shrink-0 overflow-hidden"
    style="border-top: 1px solid var(--border-subtle);"
  >
    {location && (
      <span
        class="text-[0.52rem] tracking-[0.25em] uppercase flex items-center gap-2 shrink-0"
        style="opacity: 0.38;"
      >
        <span>📍</span><span>{location.label}</span>
      </span>
    )}
    {quote && (
      <div
        class="border-l-2 pl-4 flex-1 min-w-0 overflow-hidden"
        style="border-color: var(--accent-color); opacity: 0.45;"
      >
        <p class="text-[0.55rem] italic leading-snug m-0 truncate">
          "{quote.text}" — {quote.author}
        </p>
      </div>
    )}
  </div>

</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Visual check**

```bash
cd /home/cyberdyne/dev/portfolio && npm run dev
```
Open `http://localhost:4321`. Verify:
- Hero fills viewport, no vertical scroll
- Titles scale with viewport width using clamp
- Ghost "TIMUR" visible on laptop+ screens
- Marquee animates continuously
- Location + quote visible in bottom strip
- CTA buttons present (scroll behavior tested after sectionNav wired)

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.astro
git commit -m "feat: Hero redesign — asymmetric layout, marquee strip, location/quote bottom"
```

---

## Task 9: About — Condensed 2-Column

**Files:**
- Rewrite: `src/components/sections/About.astro`

- [ ] **Step 1: Rewrite About.astro**

Replace entire file with:

```astro
---
import SectionHeading from "../../components/ui/SectionHeading.astro";
import type { AboutData } from "../../lib/content";

interface Props {
  about: AboutData;
}

const { about: { journey, education, hobbies } } = Astro.props;

// 4 most recent entries: take last 4 from array, reverse to show newest first
const recentJourney = [...journey].slice(-4).reverse();
---

<div class="h-full flex flex-col gap-5 px-6 laptop:px-10 py-6 overflow-hidden">

  <SectionHeading label="About" />

  <div class="flex-1 flex gap-8 min-h-0 overflow-hidden">

    <!-- Left: Timeline (55%) -->
    <div class="flex-[11] relative flex flex-col overflow-hidden">

      <!-- Vertical accent line -->
      <div
        class="absolute left-0 top-0 bottom-0 w-px"
        style="background: var(--accent-color); opacity: 0.2;"
      />

      {recentJourney.map((entry: { year: string; event: string; detail: string; active: boolean }, i: number) => (
        <div
          class="relative pl-5 flex flex-col gap-0.5"
          style={i < recentJourney.length - 1 ? "padding-bottom: 1.5rem;" : ""}
        >
          <!-- Dot -->
          <div
            class="absolute rounded-full"
            style={`left: -3.5px; top: 6px; width: 7px; height: 7px;
                    background: var(--accent-color);
                    ${entry.active ? "box-shadow: 0 0 6px var(--glow-primary);" : "opacity: 0.5;"}`}
          />
          <span
            class="text-[0.5rem] tracking-[0.25em] uppercase font-bold"
            style="color: var(--accent-color);"
          >{entry.year}</span>
          <p
            class="font-display leading-tight m-0"
            style="font-size: clamp(0.85rem, 1.4vw, 1.05rem);"
          >{entry.event}</p>
          <p
            class="text-[0.65rem] leading-snug m-0 line-clamp-2"
            style="opacity: 0.42;"
          >{entry.detail}</p>
        </div>
      ))}
    </div>

    <!-- Right: Education + Hobbies (45%) -->
    <div class="flex-[9] flex flex-col gap-6 overflow-hidden">

      <!-- Education -->
      <div class="flex flex-col gap-3">
        <span class="text-[0.5rem] tracking-[0.35em] uppercase font-bold" style="opacity: 0.32;">Education</span>
        {education.map(({ years, title, sub }: { years: string; title: string; sub: string }) => (
          <div
            class="border-l-2 pl-3 flex flex-col gap-0.5"
            style="border-color: var(--accent-color);"
          >
            <span class="text-[0.48rem] tracking-[0.15em] uppercase" style="opacity: 0.32;">{years}</span>
            <p
              class="font-display leading-tight m-0"
              style="font-size: clamp(0.8rem, 1.2vw, 0.95rem);"
            >{title}</p>
            <p class="text-[0.58rem] uppercase tracking-wide m-0" style="opacity: 0.42;">{sub}</p>
          </div>
        ))}
      </div>

      <!-- Hobbies -->
      <div class="flex flex-col gap-2">
        <span class="text-[0.5rem] tracking-[0.35em] uppercase font-bold" style="opacity: 0.32;">When not coding</span>
        <div class="flex gap-5">
          {hobbies.map(({ icon, label }: { icon: string; label: string }) => (
            <span
              class="text-xl transition-opacity duration-200 cursor-default hover:opacity-80"
              style="opacity: 0.32;"
              title={label}
            >{icon}</span>
          ))}
        </div>
      </div>

    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/About.astro
git commit -m "refactor: About condensed to 2-col — 4 recent timeline entries, no boxes"
```

---

## Task 10: Resume — 2-Column Inline Skills

**Files:**
- Rewrite: `src/components/sections/Resume.astro`

- [ ] **Step 1: Rewrite Resume.astro**

Replace entire file with:

```astro
---
import SectionHeading from "../../components/ui/SectionHeading.astro";
import Icon           from "../../components/ui/Icon.astro";
import type { ResumeData } from "../../lib/content";

interface Props {
  resume: ResumeData;
}

const { resume: { frontend, backend, homelab, languages } } = Astro.props;

function levelWidth(level: string): number {
  const map: Record<string, number> = { native: 100, fluent: 85, intermediate: 60, basic: 35 };
  return map[level] ?? 50;
}
---

<div class="h-full flex flex-col gap-5 px-6 laptop:px-10 py-6 overflow-hidden">

  <SectionHeading label="Resume" />

  <div class="flex-1 flex gap-8 min-h-0 overflow-hidden">

    <!-- Left: Frontend + Backend -->
    <div class="flex-1 flex flex-col gap-5 overflow-hidden min-w-0">

      <!-- Frontend -->
      <div class="flex flex-col gap-2">
        <span class="text-[0.48rem] tracking-[0.35em] uppercase font-bold" style="opacity: 0.32;">Frontend</span>
        <div class="flex flex-wrap gap-x-4 gap-y-1.5">
          {frontend.map(({ slug, color, label }: { slug: string; color: string; label: string }) => (
            <span class="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-100" style="opacity: 0.55;">
              <Icon slug={slug} color={color} size={14} label={label} />
              <span class="text-[0.62rem]">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <!-- Separator -->
      <div class="h-px shrink-0" style="background: var(--accent-color); opacity: 0.12;" />

      <!-- Backend -->
      <div class="flex flex-col gap-2">
        <span class="text-[0.48rem] tracking-[0.35em] uppercase font-bold" style="opacity: 0.32;">Backend</span>
        <div class="flex flex-wrap gap-x-4 gap-y-1.5">
          {backend.map(({ slug, color, label }: { slug: string; color: string; label: string }) => (
            <span class="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-100" style="opacity: 0.55;">
              <Icon slug={slug} color={color} size={14} label={label} />
              <span class="text-[0.62rem]">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>

    <!-- Vertical separator -->
    <div class="w-px shrink-0" style="background: var(--accent-color); opacity: 0.10;" />

    <!-- Right: Homelab + Languages -->
    <div class="flex-1 flex flex-col gap-5 overflow-hidden min-w-0">

      <!-- Homelab -->
      <div class="flex flex-col gap-2">
        <span class="text-[0.48rem] tracking-[0.35em] uppercase font-bold" style="opacity: 0.32;">Homelab & DevOps</span>
        <div class="flex flex-wrap gap-x-4 gap-y-1.5">
          {homelab.map(({ slug, color, label }: { slug: string; color: string; label: string }) => (
            <span class="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-100" style="opacity: 0.55;">
              <Icon slug={slug} color={color} size={14} label={label} />
              <span class="text-[0.62rem]">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <!-- Separator -->
      <div class="h-px shrink-0" style="background: var(--accent-color); opacity: 0.12;" />

      <!-- Languages -->
      <div class="flex flex-col gap-2">
        <span class="text-[0.48rem] tracking-[0.35em] uppercase font-bold" style="opacity: 0.32;">Languages</span>
        <div class="flex flex-col gap-3">
          {languages.map(({ flag, lang, level }: { flag: string; lang: string; level: string }) => (
            <div class="flex items-center gap-3">
              <span class="text-base shrink-0">{flag}</span>
              <span class="text-[0.65rem] font-bold shrink-0" style="width: 5rem; opacity: 0.65;">{lang}</span>
              <div class="flex-1 h-0.5 relative" style="background: var(--border-color);">
                <div
                  class="absolute left-0 top-0 h-full"
                  style={`width: ${levelWidth(level)}%; background: var(--accent-color); opacity: 0.65;`}
                />
              </div>
              <span class="text-[0.45rem] tracking-[0.2em] uppercase shrink-0" style="opacity: 0.32; width: 4rem; text-align: right;">{level}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Resume.astro
git commit -m "refactor: Resume 2-col inline skill rows, language progress bars, no chip boxes"
```

---

## Task 11: Projects — Responsive Grid

**Files:**
- Rewrite: `src/components/sections/Projects.astro`

- [ ] **Step 1: Rewrite Projects.astro**

Replace entire file with:

```astro
---
import ProjectCard    from "../../components/ui/ProjectCard.astro";
import SectionHeading from "../../components/ui/SectionHeading.astro";
import type { Project } from "../../lib/content";

interface Props {
  projects: Project[];
}

const { projects } = Astro.props;
---

<div class="h-full flex flex-col gap-5 px-6 laptop:px-10 py-6 overflow-hidden">

  <SectionHeading label="Projects" />

  <div class="flex-1 projects-grid min-h-0">
    {projects.map((entry: Project, i: number) => {
      const { title, description, image, link, type, tags } = entry.data;
      return (
        <ProjectCard
          title={title}
          description={description}
          image={image}
          link={link}
          type={type ?? "source"}
          tags={tags ?? []}
          index={i + 1}
        />
      );
    })}
  </div>

</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Visual check**

Start dev server, navigate to Projects section. Verify:
- Mobile: cards scroll horizontally, section stays 100dvh
- Tablet (768px devtools): 2-col grid
- Laptop (1280px): 3-col grid, all 5 projects visible
- 4K (2560px): 5-col grid, all in one row

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Projects.astro
git commit -m "refactor: Projects responsive grid — mobile h-scroll, tablet 2col, laptop 3col, 4K 5col"
```

---

## Task 12: Contact — 55/45 Split

**Files:**
- Rewrite: `src/components/sections/Contact.astro`

- [ ] **Step 1: Rewrite Contact.astro**

Replace entire file with:

```astro
---
import FormField      from "../../components/ui/FormField.astro";
import SectionHeading from "../../components/ui/SectionHeading.astro";
import type { ContactData, SocialLink } from "../../lib/content";

interface Props {
  contact:     ContactData;
  socialLinks: SocialLink[];
}

const { contact, socialLinks }                                            = Astro.props;
const { email, location, statusStr, statusActive, cv_url, formSubject }  = contact;
---

<script>
  import "../../scripts/contactForm";
</script>

<div class="h-full flex flex-col gap-5 px-6 laptop:px-10 py-6 overflow-hidden">

  <SectionHeading label="Contact" />

  <div class="flex-1 flex gap-8 min-h-0 overflow-hidden">

    <!-- Left: Form (55%) -->
    <div class="flex-[11] flex flex-col min-h-0 overflow-hidden">
      <form id="contact-form" autocomplete="off" data-email={email} class="flex flex-col gap-0 h-full">
        <input type="hidden" name="access_key" value="6f16785c-509f-43aa-bd91-8c38b7d49f94" />
        <input type="hidden" name="subject"    value={formSubject} />

        <div
          id="form-status"
          class="hidden py-2 px-3 mb-3 text-[0.6rem] tracking-[0.15em] text-center"
          style="border: 1px solid var(--border-subtle); color: var(--letter-color);"
        />

        <!-- 2×2 field grid -->
        <div class="grid grid-cols-2 gap-x-6">
          <FormField id="f-name"    name="name"    label="Name *"    required />
          <FormField id="f-email"   name="email"   type="email" label="Email *" required />
          <FormField id="f-project" name="project" label="Project" />
          <FormField id="f-budget"  name="budget"  label="Budget" />
        </div>

        <!-- Textarea + submit -->
        <div class="relative flex-1 mt-2 min-h-0">
          <textarea
            id="f-message"
            name="message"
            required
            placeholder="Your message *"
            class="bg-transparent p-3 pb-10
                   text-[0.85rem] text-[var(--letter-color)]
                   w-full h-full resize-none outline-none transition-colors duration-[250ms]
                   focus:border-[var(--accent-color)]
                   placeholder:text-[0.65rem] placeholder:tracking-[0.2em] placeholder:uppercase
                   placeholder:opacity-35"
            style="border: 1px solid var(--border-subtle); font-family: 'Poiret One', cursive;"
          />
          <button
            id="submit-btn"
            type="submit"
            class="absolute bottom-[0.75rem] right-[0.75rem] flex items-center gap-2 py-[0.35rem] px-3.5
                   border-none cursor-pointer transition-all duration-200
                   hover:opacity-85 hover:translate-x-[2px]
                   disabled:opacity-30 disabled:cursor-default disabled:transform-none"
            style="background: var(--letter-color); color: var(--page-background);"
          >
            <span style="font-family: 'Poiret One', cursive; font-size: 0.55rem; letter-spacing: 0.35em; text-transform: uppercase; font-weight: bold;">Send</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
                 stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
              <path d="M4 10h12M12 5l5 5-5 5" />
            </svg>
          </button>
        </div>
      </form>
    </div>

    <!-- Right: Info + Social (45%) -->
    <div class="flex-[9] flex flex-col gap-6 justify-between overflow-hidden">

      <!-- Info items — accent left border, no box -->
      <div class="flex flex-col gap-5">

        <div class="border-l-2 pl-3 flex flex-col gap-0.5"
             style="border-color: var(--accent-color);">
          <span class="text-[0.46rem] uppercase tracking-[0.3em] font-bold" style="opacity: 0.32;">Email</span>
          <a
            href={`mailto:${email}`}
            class="text-sm font-bold hover:opacity-70 transition-opacity"
            style="color: var(--accent-color);"
          >{email}</a>
        </div>

        <div class="border-l-2 pl-3 flex flex-col gap-0.5"
             style="border-color: var(--accent-color);">
          <span class="text-[0.46rem] uppercase tracking-[0.3em] font-bold" style="opacity: 0.32;">Location</span>
          <span class="text-sm font-bold">{location}</span>
        </div>

        <div class="border-l-2 pl-3 flex flex-col gap-0.5"
             style="border-color: var(--accent-color);">
          <span class="text-[0.46rem] uppercase tracking-[0.3em] font-bold" style="opacity: 0.32;">Status</span>
          <span class="flex items-center gap-2 text-sm font-bold">
            <span
              class="rounded-full shrink-0"
              style={`width: 6px; height: 6px; background: ${statusActive ? "var(--accent-color)" : "var(--border-color)"};`}
            />
            {statusStr}
          </span>
        </div>

      </div>

      <!-- Social + CV links -->
      <div class="flex flex-wrap gap-2">
        {socialLinks
          .filter((s: SocialLink) => s.name === "LinkedIn" || s.name === "GitHub")
          .map((link: SocialLink) => (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-3 py-2 text-[0.52rem] tracking-[0.2em] uppercase font-bold
                     border border-[var(--border-color)]
                     hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]
                     transition-all duration-200"
            >{link.name}</a>
          ))
        }
        <a
          href={cv_url}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-3 py-2 text-[0.52rem] tracking-[0.2em] uppercase font-bold
                 border border-[var(--border-color)]
                 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]
                 transition-all duration-200"
        >CV →</a>
      </div>

    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify build**

```bash
cd /home/cyberdyne/dev/portfolio && npm run build
```
Expected: no errors.

- [ ] **Step 3: Visual check**

Start dev server. Navigate to Contact section. Verify:
- Form and info panel side by side
- Info items have accent left border, no surrounding box
- Form textarea fills remaining height
- Submit button overlaid on textarea bottom-right
- Social links at bottom of right panel

- [ ] **Step 4: Final full visual check**

In browser devtools, test at:
- 375px mobile: each section fills screen, Projects scrolls horizontally
- 768px tablet: Projects shows 2-col grid
- 1280px laptop: all sections fit 100dvh, Projects shows 3-col
- 2560px 4K: Projects shows 5-col, no empty space

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Contact.astro
git commit -m "refactor: Contact 55/45 split layout, accent borders replace info boxes"
```

---

## Post-Implementation Deploy

```bash
# Deploy to Pi
ssh pi@192.168.18.18 "cd ~/docker/stacks/web && docker compose up -d --build"
```
