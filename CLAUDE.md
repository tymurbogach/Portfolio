# Portfolio — Timur

## Stack real

- **Astro 6** con **adapter Node standalone** (`@astrojs/node`): las páginas se prerenderizan en build, pero hay **API routes SSR** (`src/pages/api/chat.ts` y `api/stats.ts` con `prerender = false`).
- **Tailwind v4** vía `@tailwindcss/vite` — config en CSS (`src/styles/global.css`), sin `tailwind.config.js`.
- **TypeScript estricto** (`astro/tsconfigs/strict`) · **React** solo para islas (`TrueFocus`, `MatrixSequence`, `DecryptedText` con `motion`).
- **Chat IA**: `/api/chat` → Ollama self-hosted (`llama3.2:3b`), config en `src/lib/chatConfig.ts`, endpoint vía env `OLLAMA_URL`.
- **Contador de visitas**: `/api/stats` → Umami self-hosted (`src/lib/umami.ts`).
- Deploy: Docker en la Pi → `ssh pi@192.168.18.18 "cd ~/docker/stacks/web && docker compose up -d --build"` (compose mapea `80:4321`, servidor node, sin nginx).

## Comandos

```bash
npm run dev       # dev server :4321
npm run check     # astro check (typecheck) — debe quedar en 0 errors / 0 warnings
npm run format    # prettier (plugins astro + tailwindcss)
npm run build     # build completo → dist/
npm run cv:pdf    # regenerar los PDF del CV desde cv/cv.config.*.json
```

**Tras cualquier cambio: `npm run check` y `npm run build` deben pasar antes de dar el trabajo por terminado.**

## Arquitectura

- **Fake SPA**: las 5 rutas renderizan la misma página con todas las secciones (`PageContent.astro`); `src/scripts/sectionNav.ts` sincroniza URL ↔ sección (scroll spy, smooth scroll, popstate) y posiciona el indicador del nav. Cada ruta conserva title/description/canonical propios.
- **body `position:fixed`**: el scroll real solo ocurre dentro de `#content-scroll` (`DualMain.astro`).
- **Chrome fijo** (NameCard, NavBar, SocialLinks, ChatToggle) vive en `Layout.astro` fuera del contenedor de scroll.

### Temas

- **Única fuente de verdad**: `src/lib/themes.ts` → `THEMES` (7: `bladerunner` default, `void`, `cyberpunk`, `matrix`, `bubblegum`, `doom`, `claude`), `THEME_LABELS`, claves de localStorage, `resolveThemeState()`, `applyThemeToRoot()`.
- CSS por tema en `global.css` con `[data-theme="..."]`; **cyberpunk es especial**: ocupa `:root` a pelo y su `.dark` es el modo CLARO (convención invertida). El resto usa `.dark` = oscuro.
- Variables derivadas (`--border-subtle`, `--accent-subtle`, `--surface-glow`, `--gradient-border`) tienen **defaults compartidos** en un bloque `:root` al principio de los temas; cada tema solo re-declara las que difieren. `--overlay` es siempre por tema.
- Anti-flash: script `is:inline` en `Layout.astro` que recibe las constantes con `define:vars` (un `is:inline` no puede importar) — no hardcodear nombres de tema ahí.
- **Añadir un tema**: bloque `[data-theme="x"]` + `[data-theme="x"].dark` en `global.css` con la paleta completa + añadir a `THEMES` y `THEME_LABELS` en `themes.ts`. Nada más: el inline script y darkMode.ts lo recogen solos.

### Colecciones de contenido (Astro 6)

Schemas en `src/content.config.ts` (zod desde `astro/zod`), helpers tipados en `src/lib/content.ts` (tipos inferidos con `CollectionEntry`, sin casts).

| Colección | Archivo | Datos |
|-----------|---------|-------|
| `site` | `site/site.json` | name, url, lang, description, pageDescriptions, pages (nav) |
| `profile` | `profile/profile.json` | nameDisplay, role, focus, timezone |
| `home` | `home/data.json` | hero (title/subtitle/comment/cta) |
| `about` | `about/data.json` | journey, education, hobbies |
| `resume` | `resume/data.json` | frontend/backend/homelab/ai (techSkill[]) + languages |
| `contact` | `contact/data.json` | intro, email, location, status, cv_url, cv_url_es, formSubject, web3formsKey (pública por diseño — se prerenderiza en el HTML; NO usar env vars para ella: `.dockerignore` excluye `.env*` del build de la Pi) |
| `social` | `social/data.json` | array de links |
| `projects` | `projects/*.md` | frontmatter con `image: image().or(z.url())` — local optimizada o URL remota |

Imágenes de proyectos en `src/content/projects/_images/` (rutas relativas `./_images/x.png` en el frontmatter). Avatar en `src/assets/gopnik.png` (usado con `<Image>` y como og:image optimizada vía `getImage`).

### Scripts cliente (`src/scripts/`)

| Script | Qué hace |
|--------|----------|
| `sectionNav.ts` | Fake-SPA: scroll spy, smooth scroll, popstate, nav indicator (fusiona el antiguo navIndicator/navUtils) |
| `darkMode.ts` | Toggle modo + ciclo de temas; re-aplica tema en `astro:before-swap` |
| `chat.ts` | Widget de chat: open/close, Escape, streaming desde `/api/chat` |
| `contactForm.ts` | Submit a Web3Forms con validación y estados |
| `cvModal.ts` | Modal CV: iframe lazy, focus trap, Escape, retorno de foco |
| `resumeToggles.ts` | Show-more por categoría con ResizeObserver |
| `tapFeedback.ts` | Feedback táctil (sustituye al tap-highlight nativo) |
| `visitCounter.ts` | Pinta el contador desde `/api/stats` |
| `localTime.ts` | Hora local en vivo del operator card (tick por minuto, tz de `profile.timezone`) |

## REGLAS DE ARQUITECTURA (contrato obligatorio)

Estas reglas se aplican a **toda implementación nueva o modificación**. Si una petición del usuario entra en conflicto con ellas, avisar antes de romperlas.

### 1. Separación JS / HTML

Cero JS inline en `.astro`. Toda lógica cliente va en `src/scripts/<feature>.ts`; el componente solo hace:

```astro
<script>
  import "../../scripts/feature";
</script>
```

Única excepción: el anti-flash `is:inline` del `<head>` de `Layout.astro`.

### 2. Ciclo de vida obligatorio de los scripts

Todo script con listeners sigue EXACTAMENTE este patrón (el sitio usa ClientRouter; sin cleanup, los listeners se acumulan en cada navegación):

```ts
function initFeature(): void {
  const el = document.getElementById("...");
  if (!el) return;

  const controller = new AbortController();
  const { signal } = controller;

  el.addEventListener("click", handler, { signal });          // TODOS con { signal }
  document.addEventListener("keydown", handler, { signal });  // también los de document/window

  document.addEventListener("astro:before-preparation", () => controller.abort(), { once: true });
}

document.addEventListener("astro:page-load", initFeature);
```

Prohibido: listeners sin `signal`, hacks de `cloneNode/replaceChild`, llamadas top-level que dupliquen lo que ya dispara `astro:page-load`.

### 3. Estilos

- Tailwind inline en los elementos. **Prohibido `<style>` en componentes.**
- Lo que Tailwind no exprese (selectores `[data-attr]` con cascada deliberada, keyframes, clases creadas desde JS) va a `global.css`: como `@utility` si se usa como clase en markup, como CSS plano si lo genera JS (ej: sección CHAT WIDGET) o depende de un id.
- `style="..."` solo para valores con `var(--*)` / custom props sin equivalente Tailwind (ej: `--icon-url`, colores dinámicos por variable). Nunca para layout, opacity, tamaños o posiciones fijas — eso son utilities.
- Colores SIEMPRE vía variables de tema (`var(--accent)`, `--chart-2`…), nunca hex hardcodeado (excepción: colores de marca en `TAG_SLUGS`).
- Hover solo con la variante `can-hover:` (o `@variant can-hover` en global.css), nunca `@media (hover: hover)` a mano.
- Íconos monocromos desde PNG: utility `mask-icon` + `style="--icon-url: url('...')"`.

### 4. Jerarquía de componentes

- `ui/` — piezas reutilizables y presentacionales; reciben TODO por props, no leen colecciones.
- `sections/` — secciones de página; leen colecciones (o reciben data de `PageContent`) y componen `ui/`.
- `layout/` — chrome global (nav, header, footer, chat).
- Markup repetido 2+ veces → componente en `ui/` (ejemplos existentes: `ChatToggle`, `CvDownloadButton`, `DownloadIcon`).

### 5. Contenido

- Cero strings de contenido hardcodeados en componentes: todo texto visible, URL o dato viene de `src/content/` con schema en `content.config.ts`.
- Tipos SIEMPRE inferidos (`CollectionEntry<...>["data"]` en `lib/content.ts`); prohibido duplicar shapes a mano o anotar callbacks de `.map()` con tipos inline — dejar que fluya la inferencia.
- Al añadir un campo: schema + JSON + consumidor en el mismo cambio. Sin campos huérfanos.

### 6. Constantes compartidas

Valores usados por 2+ módulos viven en `src/lib/` con un único punto de verdad (ej: `themes.ts`, `chatConfig.ts`). Las media queries de JS que replican breakpoints CSS se declaran como constante nombrada con comentario apuntando al token CSS (`LAPTOP_MQ` en `sectionNav.ts` ↔ `--breakpoint-laptop`).

### 7. Checklist antes de cerrar cualquier feature

1. ¿Scripts con el patrón AbortController completo (regla 2)?
2. ¿Ni un `<style>` ni `style=` no-var nuevos (regla 3)?
3. ¿Componente en la carpeta correcta y sin markup duplicado (regla 4)?
4. ¿Contenido en colección con schema, tipos inferidos (regla 5)?
5. ¿`npm run check` = 0 errors/0 warnings y `npm run build` verde?
6. ¿Docs actualizadas si cambió la arquitectura (este archivo / README.md)?

## Skills activas

| Skill | Activación |
|-------|-----------|
| `caveman` | automática (hook de sesión) |
| `context7` | automática (al mencionar librería/framework) |
| `frontend-design` | manual `/frontend-design` o cuando Claude detecta tarea UI |
| `code-review` | manual `/code-review` |
| `code-simplifier` | manual `/simplify` |
| `security-guidance` | manual `/security-review` |

## Auto-memoria

Al terminar cualquier sesión con cambios relevantes (features nuevas, decisiones de arquitectura, bugs resueltos, cambios de diseño significativos), guardar en memoria sin que el usuario lo pida explícitamente.
