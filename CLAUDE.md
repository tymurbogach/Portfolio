# Portfolio — Timur

## Stack

- **Astro 5.10** (static site, output `dist/`)
- **Tailwind v4** vía `@tailwindcss/vite` (config en CSS con `@theme`, sin `tailwind.config.js`)
- **TypeScript** (estricto)
- **simple-icons** para logos técnicos
- **Build**: `npm run build` → `dist/`
- **Deploy**: Docker + Nginx

## Skills activas

- frontend-design
- caveman
- context7
- code-review
- code-simplifier
- security-guidance

---

## Principio rector — Content-driven

La página es **100% dirigida por contenido**. Para cualquier actualización futura (añadir proyecto, cambiar bio, añadir skill, editar nav) **solo se tocan archivos `.md` / `.json` / `.mdx` dentro de `src/content/`**. Nunca `.astro`, nunca componentes.

Si un cambio de contenido obliga a tocar un componente, el componente está mal diseñado y debe refactorizarse para leer del content collection.

---

## Arquitectura objetivo (separación de responsabilidades)

```
src/
├─ content/                      ← CONTENIDO (única capa editable sin tocar código)
│  ├─ site/site.json             ← metadatos globales (title, url, lang, OG, nav)
│  ├─ profile/profile.json       ← hero/about: nombre, rol, bio, email, social
│  ├─ projects/*.md              ← un proyecto por archivo con frontmatter
│  ├─ experience/*.md            ← experiencia laboral (opcional)
│  └─ skills/skills.json         ← grupos y skills (con slugs simple-icons)
├─ content.config.ts             ← defineCollection() + loaders + schemas Zod
├─ layouts/
│  └─ BaseLayout.astro           ← <html>, <head>, meta/OG, fuentes, slots
├─ components/
│  ├─ ui/                        ← primitivos sin estado: Button, Card, Tag, Icon
│  ├─ sections/                  ← secciones de página: Hero, About, Projects, Skills, Contact
│  └─ layout/                    ← Nav, Footer, ThemeToggle
├─ lib/
│  └─ content.ts                 ← helpers: getProfile(), getProjects(), getSkills()
├─ styles/
│  └─ global.css                 ← @import "tailwindcss"; @theme { --color-…; --font-… }
├─ assets/                       ← imágenes procesables por <Image /> de astro:assets
├─ consts.ts                     ← constantes no editables por contenido (rutas internas, etc.)
└─ pages/
   └─ index.astro                ← SOLO compone <Section /> y pasa datos. Cero texto hardcoded.
```

---

## Reglas de código

### Astro 5

- Content collections con `defineCollection()` en `src/content.config.ts`.
  - `loader: glob({ pattern: "**/*.md", base: "./src/content/projects" })` para colecciones multi-archivo.
  - `loader: file("./src/content/skills/skills.json")` para archivos únicos con múltiples entradas.
- **Validar todo con Zod**: titles obligatorios, fechas como `z.coerce.date()`, urls como `z.string().url()`, enums para categorías.
- `src/pages/*.astro` son **delgadas**: `import { getEntry, getCollection } from 'astro:content'`, pasan datos a secciones, nada más.
- Imágenes locales: `<Image>` de `astro:assets`, `import` desde `src/assets/…`.
- SEO: todas las `<meta>` en `BaseLayout`, valores inyectados desde `site.json` + props.
- `client:*` **solo** cuando hay interactividad JS real. HTML estático siempre que sea posible.
- `astro:assets` + `Image` para todo lo que pueda optimizarse (WebP/AVIF automático).

### Tailwind v4

- Config en CSS, no JS. En `src/styles/global.css`:

  ```css
  @import "tailwindcss";
  @theme {
    --color-brand-500: …;
    --font-display: …;
    --font-body: …;
  }
  ```

- **Nada** de `tailwind.config.js` (legacy v3).
- Tokens (colores, fuentes, radios, espaciados) viven **solo** en `@theme`. Nunca valores hex/px sueltos en clases.
- Si un patrón de clases se repite 3+ veces → extraer a componente `.astro`, **no** a `@apply`.
- Dark mode con `@variant dark (&:where(.dark, .dark *))` si aplica.

### Componentes

- **Un componente por archivo**, PascalCase.
- Props tipadas con `interface Props` al inicio del frontmatter.
- Sin `getCollection()` / fetch dentro de componentes — los datos llegan por props o vía `src/lib/content.ts`.
- `ui/` sin estado ni data fetching. `sections/` reciben su data como props.
- simple-icons: un solo `<Icon slug="…" />` que resuelve el SVG, no imports dispersos.

### TypeScript

- `strict: true` ya activo — mantener. Corregir warnings, no silenciarlos.
- Tipos derivados de collections: `type Project = CollectionEntry<'projects'>`.

### Accesibilidad y rendimiento

- Semántica: `<header>`, `<main>`, `<nav>`, `<footer>`, `h1` único por página, headings en orden.
- Contraste AA mínimo, focus visible en todo elemento interactivo, `alt` obligatorio (vía Zod).
- Fuentes: `font-display: swap`; si son externas, `preconnect`.
- Objetivo Lighthouse: **perf ≥ 95, a11y ≥ 95, SEO ≥ 95**.

---

## Flujo de trabajo obligatorio

1. **Plan antes de código.** Listar archivos a crear/modificar/eliminar y por qué. Esperar OK si el scope crece respecto a lo pedido.
2. **Leer antes de escribir.** Inspeccionar el estado actual del repo (`src/`, `astro.config.mjs`, `content.config.ts` si existe) antes de proponer cambios.
3. **Refactor incremental.** Un cambio conceptual por iteración en este orden:
   1. Content collections + schemas
   2. Layouts + helpers en `lib/`
   3. Sections (consumiendo data)
   4. UI primitivos
   5. Limpieza final
4. **Build siempre verde.** `npm run build` sin errores ni warnings nuevos en cada paso.
5. **Limpieza.** Eliminar código muerto, imports sin uso, CSS no referenciado, assets huérfanos.

---

## No tocar sin justificación técnica explícita

- `Dockerfile`, `docker-compose.yml`, `nginx/` — deploy estable.
- `astro.config.mjs` salvo que el refactor lo exija (p. ej. añadir integración oficial).
- Identidad visual core: tipografía base y esencia cromática. Se pueden refinar escalas, pesos, espaciados; no cambiar el carácter.

---

## Criterio de aceptación (4 checks binarios)

El trabajo está terminado **solo si** los cuatro pasan:

1. Abrir `src/content/profile/profile.json`, cambiar `name` → se refleja en toda la página sin tocar nada más.
2. Crear un `.md` nuevo en `src/content/projects/` con frontmatter válido → aparece su card automáticamente, sin editar código.
3. `npm run build` termina sin errores ni warnings nuevos; `dist/` sirve correctamente bajo Nginx.
4. `grep -rE "(>[A-Z][a-z]+ [A-Z])" src/pages src/components/sections` no devuelve strings de contenido personal. Cero texto hardcoded fuera de `src/content/`.
