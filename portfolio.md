# Portfolio — Referencia rápida para Claude

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 6 (static, SSG) |
| CSS | Tailwind v4 vía `@tailwindcss/vite` (config en CSS, sin `tailwind.config.js`) |
| TypeScript | `astro/tsconfigs/strict` |
| Iconos | `simple-icons` npm package |
| Fuente | Poiret One (Google Fonts, única fuente del proyecto) |
| Deploy | `npm run build` → `dist/` → Docker + Nginx en Pi (`192.168.18.18`) |

---

## Estructura de archivos

```
src/
├── content.config.ts          ← colecciones Astro 6 (file/glob loaders)
├── styles/
│   └── global.css             ← import TW, @theme breakpoints, temas, tokens, @utility
├── layouts/
│   ├── Layout.astro           ← HTML base, SEO, scripts globales, mobile/desktop layout
│   └── DualMain.astro         ← layout 2 columnas: sidebar ProfilePanel + panel derecho
├── components/
│   ├── layout/
│   │   ├── Header.astro       ← móvil: NameCard + NavBar juntos
│   │   ├── Footer.astro       ← móvil: SocialLinks
│   │   ├── NameCard.astro     ← logo/nombre clickable, link a home
│   │   └── NavBar.astro       ← nav con íconos CSS-mask + indicator animado
│   ├── sections/
│   │   ├── PageContent.astro  ← orquesta todas las secciones (home/about/resume/projects/contact)
│   │   ├── Hero.astro         ← sección home: título + CTA + tech strip
│   │   ├── About.astro        ← timeline journey + education + hobbies + quote
│   │   ├── Resume.astro       ← skills por categoría (Chip) + languages
│   │   ├── Projects.astro     ← grid de ProjectCard
│   │   ├── ProfilePanel.astro ← sidebar: foto + bio + stats + botón CV
│   │   └── Contact.astro      ← form Web3Forms + info grid + links sociales
│   └── ui/
│       ├── Button.astro       ← variants: primary | ghost | accent
│       ├── Chip.astro         ← badge de skill con Icon + label
│       ├── FormField.astro    ← input con label flotante peer + underline animado
│       ├── Icon.astro         ← SVG desde simple-icons por slug
│       ├── Modal.astro        ← modal CV con iframe + download
│       ├── ProjectCard.astro  ← tarjeta de proyecto con imagen, tags, badge live/src
│       ├── SectionHeading.astro ← h2 tiny-caps + línea divisora con acento
│       └── SocialLinks.astro  ← íconos de redes sociales (footer móvil)
├── pages/
│   ├── index.astro            ← / (Layout dual=true → PageContent)
│   ├── about.astro            ← /about
│   ├── resume.astro           ← /resume
│   ├── projects.astro         ← /projects
│   └── contact.astro          ← /contact
├── scripts/
│   ├── themeToggle.ts         ← cicla temas (THEMES array); triple-clic en #theme-toggle
│   ├── sectionNav.ts          ← scroll SPA: URL ↔ sección, scroll suave, popstate
│   ├── navIndicator.ts        ← posiciona línea bajo enlace activo en nav
│   ├── cvModal.ts             ← abre/cierra modal CV, carga iframe lazy
│   └── contactForm.ts         ← submit a Web3Forms API, gestión de estado del form
└── lib/
    └── content.ts             ← tipos y helpers para getEntry/getCollection
```

---

## CSS — global.css

**Solo contiene:**
1. `@import "tailwindcss"`
2. `@theme` — breakpoints custom: `mobile/tablet/laptop/desktop/fhd/qhd/uhd`
3. Temas (`:root.theme-*`) — variables CSS por tema
4. `:root` — tokens globales (`--space-*`, `--sidebar-width`)
5. Reset + tipografía + scrollbar oculta
6. `*:focus-visible` — focus ring con `--accent-color`
7. `@utility` blocks — utilidades cyberpunk (ver tabla abajo)

**Temas disponibles:** `theme-void` (oscuro teal+naranja) | `theme-abyss` (azul+cyan+magenta) | `theme-chalk` (claro frío) | `theme-stone` (claro terracota)

**Variables obligatorias por tema:**
`--component-background`, `--page-background`, `--total-background`, `--letter-color`, `--border-color`, `--hover-bg`, `--hover-text`, `--accent-color`, `--accent-text`, `--accent-subtle`, `--surface-raised`, `--accent-secondary`, `--accent-tertiary`, `--glow-primary`, `--glow-secondary`, `--gradient-hero`, `--gradient-border`, `--surface-glow`

**Breakpoints (uso: `mobile:`, `tablet:`, `laptop:`, `fhd:`, `qhd:`, `uhd:`):**
`30rem | 48rem | 80rem | 120rem | 160rem | 240rem`

**@utility classes:**
| Clase | Efecto |
|-------|--------|
| `text-gradient` | Texto con gradiente de acento |
| `neon-border` | Borde + triple glow del acento |
| `neon-glow` | Box-shadow neón |
| `text-glow` | Text-shadow neón |
| `gradient-line` | Línea 1px con gradiente de acento |
| `surface-accent` | Fondo sutil con tono de acento |
| `hero-gradient` | Gradiente de fondo del hero |
| `neon-left-border` | Borde izquierdo neón (citas) |
| `tag-secondary` | Badge con acento secundario |
| `hover-glow` | Glow en hover (tarjetas) |
| `scanlines` | Overlay CRT scanlines via `::after` |

---

## Colecciones de contenido (Astro 6)

Cada colección usa `file()` loader. Los JSON de entrada única están envueltos como `{id: data}` para que `getEntry(col, id)` funcione.

| Colección | Archivo | getEntry id | Datos |
|-----------|---------|-------------|-------|
| `site` | `src/content/site/site.json` | `"site"` | nombre, url, páginas nav, SEO |
| `profile` | `src/content/profile/profile.json` | `"profile"` | nombre, nameDisplay, role |
| `home` | `src/content/home/data.json` | `"data"` | hero, stats, techStrip, cta |
| `about` | `src/content/about/data.json` | `"data"` | journey, education, hobbies, quote |
| `resume` | `src/content/resume/data.json` | `"data"` | frontend, backend, homelab, languages |
| `contact` | `src/content/contact/data.json` | `"data"` | email, location, status, cv_link |
| `social` | `src/content/social/data.json` | `"data"` | array de links sociales |
| `projects` | `src/content/projects/*.md` | slug del fichero | title, description, image, link, tags, order |

Helpers en `src/lib/content.ts`: `getSite()`, `getProfile()`, `getHomeData()`, `getAboutData()`, `getResumeData()`, `getContactData()`, `getSocialLinks()`, `getProjects()`, `getLabeledSections(site)`.

Tipos exportados: `SiteData`, `ProfileData`, `HomeData`, `AboutData`, `ResumeData`, `ContactData`, `SocialLink`, `NavPage`, `Project`.

---

## Patrones no obvios

- **Cambio de tema**: Triple-clic en el div `id="theme-toggle"` (el bloque del h1 en Hero). Cicla el array THEMES. Se preserva en `localStorage["theme"]`.
- **Anti-flash de tema**: Script `is:inline` en `<head>` aplica el tema guardado antes del primer paint.
- **body position:fixed**: El body tiene `position:fixed; inset:0` para evitar scroll nativo del documento. El scroll real ocurre solo dentro de `#content-scroll`.
- **SPA routing falso**: El sitio es una sola página con todas las secciones; la URL cambia con `history.replaceState` al scrollear. `sectionNav.ts` lo gestiona.
- **Nav indicator**: El `#nav-indicator` (línea dorada bajo el enlace activo) está fuera del `<nav>` para que `overflow-hidden` no lo corte.
- **Íconos CSS mask**: Los íconos de nav usan CSS `mask-image` con la URL del PNG, coloreados con `background-color` (no `<img>`). Esto permite colorearlos con variables CSS.
- **FormField peer pattern**: Requiere input ANTES que label como siblings en el mismo contenedor para que las clases `peer-*` de Tailwind funcionen.
- **Iframe CV lazy**: El `src` del iframe en el modal está en `data-src` y se copia al `src` solo al primer clic en "View CV" (evita cargar el PDF al inicio).
- **AbortController en scripts**: Todos los scripts de evento usan AbortController + `astro:before-preparation` para limpiar listeners al navegar.

---

## Deploy

```bash
# Build local
npm run build        # genera dist/
npm run dev          # dev server en :4321
npm run preview      # preview del build

# Redeploy en Pi (tras cambios pusheados)
ssh pi@192.168.18.18 "cd ~/docker/stacks/web && docker compose up -d --build"
```

---

## Para añadir un nuevo tema

1. Añadir bloque `:root.theme-nombre { ... }` en `global.css` con todas las variables obligatorias
2. Añadir `"theme-nombre"` al array `THEMES` en `src/scripts/themeToggle.ts`
3. Añadir `"theme-nombre"` al array `valid[]` en el script `is:inline` de `src/layouts/Layout.astro`

## Para añadir un nuevo proyecto

Crear `src/content/projects/nombre.md` con frontmatter:
```md
---
title: "Nombre"
description: "Descripción"
image: "/img/nombre.png"
link: "https://..."   # opcional
tags: ["Tag1", "Tag2"]
order: 6              # orden en la lista
---
```
