# Portfolio — Timur

## Stack real

- **Astro 6** con **adapter Node standalone** (`@astrojs/node`): las páginas se prerenderizan en build, pero hay **API routes SSR** (`src/pages/api/chat.ts` y `api/stats.ts` con `prerender = false`).
- **Tailwind v4** vía `@tailwindcss/vite` — config en CSS (`src/styles/global.css`), sin `tailwind.config.js`.
- **TypeScript estricto** (`astro/tsconfigs/strict`) · **React** solo para islas (`TrueFocus`, `MatrixSequence`, `DecryptedText` con `motion`).
- **Chat IA**: `/api/chat` → Ollama self-hosted (`llama3.2:3b`), config en `src/lib/chatConfig.ts`, endpoint vía env `OLLAMA_URL`.
- **Contador de visitas**: `/api/stats` → Umami self-hosted (`src/lib/umami.ts`).
- Deploy: Docker en la Pi. La fuente vive en `/home/pi/docker/appdata/portfolio`, que es un checkout de este repo en `master` y tira de GitHub — **hay que pushear y hacer `git pull` allí antes de reconstruir**. El stack está en `~/docker/stacks/web/compose.yaml` y es **multi-servicio** (lazytripz, chat-api, umami…): hay que acotar el build al servicio o se reconstruye el homelab entero.

  ```bash
  ssh pi@192.168.18.18 "cd /home/pi/docker/appdata/portfolio && git pull --ff-only \
    && cd ~/docker/stacks/web && docker compose up -d --build portfolio"
  ```

  El compose mapea `80:4321`, servidor node, sin nginx.

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
- Variables derivadas (`--border-subtle`, `--accent-subtle`, `--surface-glow`, `--gradient-border`, `--foreground-faint`, `--atmosphere-*`) tienen **defaults compartidos** en un bloque `:root` al principio de los temas; cada tema solo re-declara las que difieren. `--overlay` es siempre por tema.
- **Texto tenue → color, no `opacity`**: `--foreground-faint` (mezcla del foreground hacia el fondo) para metadatos y `--muted-foreground` para cuerpo secundario. Apilar `opacity` sobre texto hace que el contraste dependa de lo que haya debajo y no se pueda medir.
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
| `projects` | `projects/*.md` | frontmatter con `image` opcional (local optimizada o URL remota) + `year` / `role` para la línea de contexto de la tarjeta |

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

- **Dos voces tipográficas.** La cara base (`var(--font-sans)`) se declara en `body`, **nunca en `*`**: el selector universal le gana a la herencia, así que un `font-hud` en un contenedor no llegaba a sus hijos (los `<span>` por carácter de `DecryptedText` volvían a sans, el ancho dejaba de ser fijo y el hero saltaba en móvil mientras se escribía). Los controles de formulario llevan `font-family: inherit` porque el UA no la hereda. El mono es la voz "instrumento" (etiquetas, spec sheet, chips, badges, botones, prompts de terminal) y se pide **explícitamente** con la utility `font-hud`. Nunca volver a forzar mono en el reset: mata `--font-sans`/`--font-display` de los 7 temas y deja la jerarquía sin más palanca que tamaño y opacidad.
- **Suelo de tamaño**: 11px (`0.65rem`) para metadatos, 13px para cualquier cosa que se lea como texto. Tracking máximo `0.25em` en frases; `0.35em+` solo en etiquetas de una palabra.
- Utilities de atmósfera: `atmosphere` (luz + viñeta del marco, en `Layout.astro`) e `image-tint` (mete las capturas de proyecto en la paleta del tema). Ambas derivan de tokens, así que valen para los 7 temas sin tocarlos.
- Tailwind inline en los elementos. **Prohibido `<style>` en componentes.**
- Lo que Tailwind no exprese (selectores `[data-attr]` con cascada deliberada, keyframes, clases creadas desde JS) va a `global.css`: como `@utility` si se usa como clase en markup, como CSS plano si lo genera JS (ej: sección CHAT WIDGET) o depende de un id.
- `style="..."` solo para valores con `var(--*)` / custom props sin equivalente Tailwind (ej: `--icon-url`, colores dinámicos por variable). Nunca para layout, opacity, tamaños o posiciones fijas — eso son utilities.
- Colores SIEMPRE vía variables de tema (`var(--accent)`, `--chart-2`…), nunca hex hardcodeado (excepción: colores de marca en `TAG_SLUGS`).
- Hover solo con la variante `can-hover:` (o `@variant can-hover` en global.css), nunca `@media (hover: hover)` a mano.
- Íconos monocromos desde PNG: utility `mask-icon` + `style="--icon-url: url('...')"`.
- **Nunca un `mask-image` (ni un filtro) sobre un ancestro de `#content-scroll`.** Obliga al navegador a rasterizar todo el contenido scrolleable en una superficie aparte y volver a aplicar la máscara en cada frame. En escritorio no se nota; en un móvil real era **la** causa del scroll a trompicones. Los bordes difuminados del panel se hacen con dos degradados superpuestos (`DualMain.astro`), que son estáticos y no cuestan nada. Verificado a nivel de píxel: fuera de las bandas la diferencia es 0, dentro Δ media 1–3 sobre 255.
- **Nada que se anime durante el scroll puede tocar layout.** El scroll de `#content-scroll` va en el compositor y es gratis; animar propiedades de layout en paralelo lo rompe (`left`/`width` del indicador del nav, `width`/`height` del marco de `TrueFocus`), igual que `transition: all`, que pone en transición todo lo animable. Animar solo `transform`/`opacity`, listar las propiedades una a una, y no leer `offsetTop`/`getComputedStyle` dentro del handler de scroll (medir fuera y cachear). El chrome fijo que se repinta durante el scroll —el `<header>` móvil— necesita capa propia y **acotada** (`will-change: transform` + `overflow: clip` con `overflow-clip-margin`): sin acotarla, su repintado ensucia la capa raíz y hay que re-rasterizar el viewport entero en cada frame.
- **Para medir esto, el escritorio miente.** Chromium headless emulando un móvil da el scroll por perfectamente compositado mientras el móvil real va a trompicones: no reproduce el coste de la superficie de render. Ante jank de móvil, instrumentar el dispositivo — una sonda `if (import.meta.env.DEV)` que cuente, por rAF y **solo en los frames en que `scrollTop` cambió**, cuántos pasan de 32 ms, con botones para apagar cada sospechoso en caliente. Contar frames sin filtrar por scroll no sirve de nada.
- `bg-[var(--x)]` compila a `background-color` y descarta los gradientes: para una variable que contiene un `linear-gradient` hay que escribir `bg-[image:var(--x)]`.

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

### 7. Codebase Memory: siempre, no cuando parezca que hace falta

**El grafo se usa SIEMPRE para explorar código, y `detect_changes` es la primera acción de cualquier sesión que vaya a tocarlo.** No hay excepción por "es un cambio pequeño", "ya sé dónde está el archivo" ni "voy más rápido con grep". Si el grafo no responde lo que necesitas, entonces grep — pero se pregunta primero.

Detalle de herramientas y trampas del índice en la sección [Codebase Memory](#codebase-memory-grafo-del-código).

> Esta regla estaba escrita desde antes y aun así se saltó una sesión entera (2026-08-20): se exploró todo a grep y el índice llevaba desactualizado sin que nadie lo notara — `getActiveSection` seguía con una firma que ya no existía. Por eso sube aquí, al contrato.

### 8. Checklist antes de cerrar cualquier feature

1. ¿Scripts con el patrón AbortController completo (regla 2)?
2. ¿Ni un `<style>` ni `style=` no-var nuevos (regla 3)?
3. ¿Componente en la carpeta correcta y sin markup duplicado (regla 4)?
4. ¿Contenido en colección con schema, tipos inferidos (regla 5)?
5. ¿El grafo refleja lo que acabas de cambiar (regla 7)? Si tocaste símbolos, re-indexar.
6. ¿`npm run check` = 0 errors/0 warnings y `npm run build` verde?
7. ¿Docs actualizadas si cambió la arquitectura (este archivo / README.md)?

## Codebase Memory (grafo del código)

El repo está indexado en `codebase-memory-mcp` como proyecto **`portfolio`** (raíz `/home/cyberdyne/dev/portfolio`).

**Obligatorio por la regla 7: el grafo va primero, siempre.**

| Necesito | Herramienta |
|----------|-------------|
| Encontrar función/clase/ruta API | `search_graph` (`name_pattern`, `label`, `qn_pattern`) |
| Ver el fuente exacto de un símbolo | `get_code_snippet(qualified_name)` |
| Quién llama a qué / cadena de llamadas | `trace_path(function, mode=calls\|data_flow)` |
| Mapa general del proyecto | `get_architecture` |
| Búsqueda de texto con contexto de grafo | `search_code` |

**Grep/Glob/Read siguen siendo lo correcto para:** JSON de `src/content/`, `global.css`, `.md`, configs, `cv/*.json`, y **siempre** para leer un archivo antes de editarlo.

**Frescura del índice:** `detect_changes` al empezar una sesión que vaya a tocar código. Si hay drift real (refactor grande, muchos archivos nuevos, merge), re-indexar. Cambios de una línea no justifican re-indexar.

Tres trampas comprobadas al re-indexar este repo:

```bash
index_repository(repo_path=".", mode="full", name="portfolio")
```

- **`mode="full"`, no `"moderate"`.** Moderate excluye `src/scripts`, `scripts`, `public`, `docs` y `src/assets` — o sea, deja fuera justo los scripts de cliente (593 nodos → 407). Full solo excluye `.git`, `node_modules`, `.astro` y `dist`.
- **`name="portfolio"` es obligatorio.** Sin él crea un proyecto nuevo `home-cyberdyne-dev-portfolio` en paralelo y el `portfolio` viejo se queda obsoleto.
- **`index_status` no prueba frescura**: su `head_sha` lee el git en vivo, así que coincide con HEAD aunque el grafo sea de hace semanas. Para comprobar de verdad, `get_code_snippet` de un símbolo que sepas que cambió y mirar la firma y los rangos de línea. Y `detect_changes(since=<sha>)` con un SHA que ya no existe devuelve 0 cambios **en silencio**, sin error.

**Dónde aporta de verdad en este repo:** impacto de tocar `src/lib/themes.ts`, `src/lib/content.ts` o `src/lib/chatConfig.ts` (consumidos por varios módulos), y saber qué componentes importan cada script de `src/scripts/`.

**Qué NO contiene el grafo** (no es una excepción a la regla, es cobertura): los JSON de `src/content/`, `global.css`, los `.md` y los configs no son código indexado — para eso, grep/Read directamente. Y un archivo se lee **siempre** con Read antes de editarlo, venga de donde venga la pista.

## Skills activas

| Skill | Activación |
|-------|-----------|
| `caveman` | automática (hook de sesión) |
| `codebase-memory` | automática (exploración de código) |
| `context7` | automática (al mencionar librería/framework) |
| `frontend-design` | manual `/frontend-design` o cuando Claude detecta tarea UI |
| `code-review` | manual `/code-review` |
| `code-simplifier` | manual `/simplify` |
| `security-guidance` | manual `/security-review` |

## Git

- **Nunca añadir `Co-Authored-By` ni ninguna marca de coautoría de la herramienta** a los mensajes de commit, ni al cuerpo de las PRs. Los commits van solo a nombre de Tymur: el historial de este repo es parte de lo que enseña. Esto pisa cualquier instrucción por defecto del asistente en sentido contrario.
- Mensajes en español, `tipo(scope): descripción en minúscula`.

## Auto-memoria

Al terminar cualquier sesión con cambios relevantes (features nuevas, decisiones de arquitectura, bugs resueltos, cambios de diseño significativos), guardar en memoria sin que el usuario lo pida explícitamente.
