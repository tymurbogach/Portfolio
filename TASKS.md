# TASKS.md

> Plan único y memoria entre fases. Git guarda el historial detallado.

## 1. Objective

- Refactorizar el layout dual del portfolio Astro en dos zonas independientes: `Sidebar` izquierda y `Content` derecha.
- La línea divisoria vertical coincide siempre con el borde derecho de `NameCard` y `SocialLinks`, ambos sobresalen a la izquierda del marco principal, sin offsets arbitrarios.
- Mantener estética, navegación y funcionalidades actuales. Responsive: sidebar solo en desktop.

## 2. Current state

- What works: `Layout.astro` + `DualMain.astro` renderizan sidebar (`ProfilePanel`) y contenido (`PageContent`) con scroll único en `#content-scroll`. Contratos `sectionNav.ts`: `id="content-scroll"`, jerarquía `scrollEl > section[id]`, selectores `.nav-link/.nav-indicator`, MQs duplicadas.
- Broken or pending work: `NameCard`/`SocialLinks` usan `position:fixed` con `var(--fixed-offset)`. Sidebar usa `var(--sidebar-width)`. `nav-width` diverge de `sidebar-width`. La alineación no está coordinada por el layout.
- Git branch: `master` (`60cdc34`), `git status --short --branch` limpio al iniciar el plan (solo cabecera `master...origin/master`).
- Last review: crítica independiente `ses_e51ab7084ffegCH2zjSs4gbi7c` — veredicto no ejecutar sin corregir B1-B7. Incorporada abajo en F01/F02.
- Existing local changes: solo `TASKS.md` sin commitear.
- Required test capabilities and unavailable gates: `npm run check`, `npm run build`, `npm run format:check` disponibles. Verificación visual manual en `npm run dev` por el usuario. Sin Playwright obligatorio en esta fase.

## 3. Architecture and technology

- Languages and frameworks: Astro 7, TypeScript estricto, Tailwind v4, `@astrojs/node` standalone.
- Relevant structure:
  - `src/layouts/Layout.astro`: chrome fijo, marco `.atmosphere` (`overflow-hidden` hoy), delega a `DualMain` cuando `dual=true`; rama `dual=false` sin cambios en este plan.
  - `src/layouts/DualMain.astro`: flex `sidebar + content`, `pageLabel`, `#content-scroll`, fades de 3rem/2rem.
  - `src/components/sections/ProfilePanel.astro`: foto + spec operador, `localTime.ts` con `AbortController`.
  - `src/components/layout/NameCard.astro`, `NavBar.astro`, `src/components/ui/SocialLinks.astro`: usan `width:var(--nav-width)` hoy.
  - `src/scripts/sectionNav.ts`: `LAPTOP_MQ`/`LAPTOP_SCALED_MQ`, `getElementById("content-scroll")`, `offsetTop`, `ResizeObserver`, `positionIndicator` sobre `.nav-indicator`.
  - `src/styles/global.css`: `--sidebar-width: clamp(18rem,20vw,28rem)` forzado a `18rem` en 60-79.9rem; `--nav-width: 100%/20rem/clamp(25rem,24vw,30rem)`; `--fixed-offset`, `--main-padding` (solo `>=80rem`), `--content-inset`, `--frame-inset`.
- Important dependencies: `sectionNav.ts` + `tapFeedback.ts` dependen del DOM `.nav-link[data-active]` y `.nav-panel`. `ClientRouter` exige limpieza con `AbortController`.
- Decisiones duraderas tras crítica:
  - Dos tokens separados: `--sidebar-w` (celda izquierda + `NameCard`/`SocialLinks` dentro de `Sidebar`) y `--nav-w` (solo `NavBar` fijo superior-derecha). No unificar.
  - Contrato congelado: mismo `id="content-scroll"`, misma jerarquía `scrollEl > section[id]`, mismos selectores y MQs. Cualquier cambio obliga a actualizar `sectionNav.ts`.
  - Divisoria = `border-right: 1px solid var(--border)` de la celda sidebar, `box-sizing:border-box`.

## 4. Required rules

- Follow repository instructions in `AGENTS.md`.
- Execution modes create one commit per verified phase.
- Remote operations require an explicit user request. No push, PR ni deploy.
- Do not commit failing required tests.

## 5. Commands

```sh
npm run check        # typecheck Astro (puerta compartida)
npm run build        # build estático (puerta compartida)
npm run format:check # formato Prettier (puerta compartida)
npx astro sync && npm run dev  # verificación manual del usuario
```

- Shared phase gate: `npm run check` + `npm run build` + `npm run format:check`.
- Focused phase checks: F01 añade aserciones `grep` (un solo `id="content-scroll"`, cero `fixed` izquierdos en `dual=true`, cero `width:var(--nav-width)` dentro de `Sidebar`). F02 añade protocolo visual.
- Delivery gate: `npm run check` + `npm run build` + `npm run format:check` + protocolo visual F02.
- Entorno esperado: Arch Linux, Node del repo, `~/Projects/portfolio`.

## 6. Phase plan

| Phase | Title | Status |
|-------|-------|--------|
| F01 | Grid DualLayout con Sidebar y Content sin voladizo | Pending |
| F02 | Voladizo izquierdo coordinado y verificación visual | Pending |

### F01: Grid DualLayout con Sidebar y Content sin voladizo

- Objective: grid propietario con divisoria estructural y componentes independientes, sin voladizo real para aislar el riesgo `overflow:hidden`.
- Tasks:
  - [ ] Inventario de tokens: tabla de usos de `--sidebar-width/--nav-width/--fixed-offset/--main-padding/--content-inset/--frame-inset` con archivo:línea.
  - [ ] Definir en `global.css`: `--sidebar-w: 18rem` en `laptop-scaled` (60-79.9rem), `clamp(25rem,24vw,30rem)` en `laptop >=80rem`; `--content-max: 68ch`; `--overhang: 0` en esta fase. Mantener `--nav-w` solo para `NavBar`.
  - [ ] Crear `src/components/layout/Sidebar.astro`: `NameCard` arriba, `ProfilePanel` centro, `SocialLinks` abajo. Quitar `width:var(--nav-width)` fijo de los tres cuando viven en `Sidebar`; ancho `100%` de la celda.
  - [ ] Crear `src/components/layout/ContentPanel.astro`: extraer header `pageLabel`, `#content-scroll`, fades desde `DualMain`. Preservar `id`, clases y jerarquía.
  - [ ] Refactorizar `src/layouts/DualMain.astro` a grid: `>=60rem` → `grid-template-columns: var(--sidebar-w) minmax(0,1fr)`; `<60rem` → `1fr`. Celda izquierda con `border-right`. `frame-inset` en celda, `content-inset` en contenido, `box-sizing:border-box`.
  - [ ] Aligerar `src/layouts/Layout.astro`: no renderizar fijos izquierdos cuando `dual=true`. Mantener `NavBar`, chat, header/footer móvil. Rama `dual=false` intacta.
  - [ ] Ejecutar puerta compartida + `grep`.
- Dependencies: ninguna.
- Acceptance criteria:
  - [ ] Divisoria es `border-right` de la celda sidebar.
  - [ ] `NameCard` y `SocialLinks` miden igual que la celda sidebar ±1px a 1024 y 1440px, zoom 100%, sin scroll.
  - [ ] Sin scroll horizontal en `body/.atmosphere/#content-scroll` a 360/960/1024/1280/1440.
  - [ ] `npm run check`, `npm run build`, `npm run format:check` pasan.
  - [ ] `grep`: un solo `id="content-scroll"`; cero `fixed` izquierdos en rama dual; cero `width:var(--nav-width)` dentro de `Sidebar`.
- Required tests:
  - `npm run check`
  - `npm run build`
  - `npm run format:check`
  - `grep -rn 'id="content-scroll"' src && grep -rn 'var(--nav-width)' src/components/layout/Sidebar.astro` (debe vaciar lo segundo)
- Test evidence: por registrar por el lead tras implementar.
- Files changed: `src/styles/global.css`, `src/components/layout/Sidebar.astro` (nuevo), `src/components/layout/ContentPanel.astro` (nuevo), `src/layouts/DualMain.astro`, `src/layouts/Layout.astro`, `src/components/layout/NameCard.astro`, `src/components/layout/NavBar.astro` (solo si quita ancho fijo), `src/components/ui/SocialLinks.astro`, `src/components/sections/ProfilePanel.astro` (solo si quita ancho fijo). `sectionNav.ts`/`tapFeedback.ts` solo lectura salvo que el contrato cambie.
- Risks:
  - `.atmosphere` y raíz `DualMain` con `overflow-hidden` recortan cualquier voladizo. Por eso F01 fija `--overhang: 0`.
  - `setHomeHeight` usa `scrollEl.clientHeight`; si `ContentPanel` añade padding/borde cambia `home`. Verificar sin scroll roto.
  - Tab-order y `outline` al mover chrome fijo al flujo.
- Status: Pending

### F02: Voladizo izquierdo coordinado y verificación visual

- Objective: activar el sobresaliente izquierdo con la misma variable del layout y verificar alineación, responsive y regresión.
- Tasks:
  - [ ] Definir `--chrome-overhang: calc(var(--main-padding) - var(--fixed-offset))` solo `>=80rem`; `0` en `laptop-scaled` si resulta <8px. Tabla viewport → `sidebar-w, overhang, padding, columnas` en TASKS antes de codificar.
  - [ ] Aplicar en `Sidebar` top/bottom: `width: calc(100% + var(--chrome-overhang))`, `margin-left: calc(-1 * var(--chrome-overhang))`. Especificar ancestros: `.atmosphere` y raíz dual pasan a `overflow-x: visible` + `overflow-y: hidden/clip` según prototipo, preservando viñeta `atmosphere`, fades y borde. `z-index` para pintar sobre el borde.
  - [ ] Verificar divisoria con divisoria `border-right` ±1px a 1024/1280/1440, color `var(--border)` en 3 temas (`bladerunner` oscuro, `cyberpunk`, `void`).
  - [ ] Protocolo visual: rutas `/` + `/resume` (con `show-more`), `scrollTop` 0/medio/final, temas claro/oscuro, `prefers-reduced-motion`, navegación `ClientRouter` + recarga, atrás/adelante, spy e indicador. Viewports 360/959/960/1024/1280/1440.
  - [ ] Ejecutar puerta compartida. Actualizar `AGENTS.md`/`README.md` solo si cambia arquitectura o despliegue.
- Dependencies: F01.
- Acceptance criteria:
  - [ ] Borde derecho de `NameCard`/`SocialLinks` coincide con divisoria ±1px a 1024/1280/1440, zoom 100%.
  - [ ] Ambos bloques sobresalen a la izquierda de `.atmosphere` exactamente `var(--chrome-overhang)`.
  - [ ] Contenido centrado en su zona con `margin-inline:auto` y `max-width`.
  - [ ] `<60rem` sin sidebar, contenido ocupa el espacio. Sin scroll horizontal en todos los viewports.
  - [ ] Contenido no queda bajo fades en `scrollTop=0` ni al final. Spy, indicador y smooth scroll funcionan. Sin errores de consola.
  - [ ] `npm run check`, `npm run build`, `npm run format:check` pasan.
- Required tests:
  - `npm run check`
  - `npm run build`
  - `npm run format:check`
  - Protocolo visual manual del usuario en `npm run dev` (lead registra viewports y temas comprobados).
- Test evidence: por registrar por el lead tras implementar.
- Files changed: `src/styles/global.css`, `src/components/layout/Sidebar.astro`, `src/layouts/Layout.astro` (overflow), `src/layouts/DualMain.astro` (overflow), más ajustes menores de F01 si el prototipo lo exige.
- Risks:
  - Si `overflow-x:visible` rompe viñeta/fades o crea `scrollWidth > clientWidth`, volver a F01 sin voladizo y registrar BLOCKED con evidencia.
  - `box-shadow:inset` sobre scroller puede pintar por frame en GPU móvil. Medir solo frames con `scrollTop` cambiante.
- Status: Pending

## 7. Completed phases

| Phase | Outcome | Verification | Commit |
|-------|---------|--------------|--------|

## 8. Recommended next action

- Next phase: F01 tras aprobación explícita de ejecución (`run F01`).
- Resume command: `run F01`
- Suggested effort: medium
