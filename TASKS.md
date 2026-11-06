# TASKS.md

> Plan único y memoria entre fases. Git guarda el historial detallado.

## 1. Objective

- Separar `DualMain` en dos componentes independientes (`Sidebar` izquierda y `ContentPanel` derecha) sin ningún cambio visual ni de comportamiento.
- Todo sigue igual que antes: mismo markup renderizado, mismas clases, mismos tokens, mismo chrome fijo en `Layout`, mismos contratos `sectionNav`.

## 2. Current state

- What works: `Sidebar` y `ContentPanel` son componentes separados. F03 coordina ahora la divisoria con los bloques fijos y centra ambos contenidos en sus columnas.
- Historia: F01-grid (`6b6161d`) y el intento de voladizo F02 cambiaron la geometría (grid, tokens, overflow, centrado 68ch). El usuario lo rechazó con captura: no era lo pedido. Se revirtió `src/` al original y se rehízo como split verbatim.
- Git branch: `master`, por delante de `origin/master` (commits locales sin push).
- Last review: segunda revisión de F02 bloqueó por `overflow-x:visible + overflow-y:hidden` (computa a `auto`). F02 cancelado a petición del usuario: todo igual que antes.
- Existing local changes: F03 alineación y prueba visual automatizada; commit, push y deploy solicitados.
- Required test capabilities: `npm run check`, `npm run build`, `npm run format:check`, `npm run test:visual`. Verificación visual final del usuario en `npm run dev`.

## 3. Architecture and technology

- Languages and frameworks: Astro 7, TypeScript estricto, Tailwind v4, `@astrojs/node` standalone.
- Relevant structure (sin cambios respecto al original):
  - `src/layouts/Layout.astro`: chrome fijo (`NameCard`, `NavBar`, `SocialLinks`, chat), marco `.atmosphere`, delega a `DualMain` cuando `dual=true`.
  - `src/layouts/DualMain.astro`: composición; el markup vive en `Sidebar` y `ContentPanel`.
  - `src/components/layout/Sidebar.astro` (nuevo): celda izquierda original con `ProfilePanel`, clases y `width: var(--sidebar-width)` intactos.
  - `src/components/layout/ContentPanel.astro` (nuevo): panel derecho original (`pageLabel`, `#content-scroll`, fades), `id`/clases/jerarquía intactos.
  - `--sidebar-width` se calcula desde `--nav-width`, `--fixed-offset` y el inset real del marco. No se dibuja una barra entre paneles. `ContentPanel` centra su encabezado y scroller con el mismo ancho máximo.
  - `src/scripts/sectionNav.ts`: sin cambios; contrato preservado por construcción.
- Important dependencies: ninguna nueva.

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

- Shared phase gate: `npm run check` + `npm run build` + `npm run format:check` en archivos tocados.
- Delivery gate: puerta compartida + `npm run test:visual`.
- Entorno esperado: Arch Linux, Node del repo, `~/Projects/portfolio`.

## 6. Phase plan

| Phase | Title                                 | Status      |
| ----- | ------------------------------------- | ----------- |
| F01   | Split verbatim Sidebar + ContentPanel | Completada  |
| F02   | Voladizo coordinado                   | Cancelada   |
| F03   | Alinear y centrar ambas columnas      | In progress |

### F01: Split verbatim Sidebar + ContentPanel

- Objective: dos componentes independientes con HTML renderizado idéntico al original.
- Tasks:
  - [x] `Sidebar.astro`: celda izquierda original verbatim.
  - [x] `ContentPanel.astro`: panel derecho original verbatim (`pageLabel`, `#content-scroll`, fades).
  - [x] `DualMain.astro`: solo composición, flex original intacto.
  - [x] `Layout.astro`, `NameCard`, `SocialLinks`, `global.css`: sin cambios.
  - [x] Puerta compartida en verde.
- Dependencies: ninguna.
- Acceptance criteria:
  - [x] El HTML renderizado es el mismo que antes del split (solo cambian fronteras de componente).
  - [x] `npm run check` 0 errores, `npm run build` Complete, `prettier --check` OK en los 3 archivos.
  - [x] `grep id="content-scroll"`: un solo resultado.
- Required tests:
  - `npm run check`
  - `npm run build`
  - `npx prettier --check` en archivos tocados
- Test evidence: lead `check` 49 archivos 0 errores, `build` Complete, `prettier` OK tras normalizar `ContentPanel`.
- Files changed: `src/layouts/DualMain.astro`, `src/components/layout/Sidebar.astro` (nuevo), `src/components/layout/ContentPanel.astro` (nuevo).
- Risks: ninguno; cambio solo organizativo.
- Status: Completada

### F02: Voladizo coordinado

- Status: Cancelada a petición del usuario. El intento de voladizo se retiró; no queda stash.

### F03: Alinear y centrar ambas columnas

- Objective: sincronizar el borde de la columna izquierda con los bordes derechos de `NameCard`/`SocialLinks`, y centrar cada panel en su zona.
- Tasks:
  - [x] Derivar `--sidebar-width` de `--nav-width`, `--fixed-offset` y el inset del marco.
  - [x] Mantener el límite entre columnas sin barra visible.
  - [x] Centrar encabezado y scroller de `ContentPanel` con un ancho máximo compartido.
  - [x] Centrar `ProfilePanel` en la columna y limitar la altura de la foto en viewports bajos.
  - [x] Añadir Playwright para medir alineación, centrado, overflow y separación de las tarjetas fijas en varios anchos/altos.
  - [x] Ejecutar `check`, `build` y la suite visual.
- Dependencies: F01.
- Acceptance criteria:
  - [x] Bordes derechos de `NameCard` y `SocialLinks` coinciden con el límite invisible entre columnas con tolerancia de 1px.
  - [x] No se dibuja una barra vertical entre columnas.
  - [x] Foto izquierda y contenido derecho se centran en sus columnas con tolerancia de 1px.
  - [x] La foto y los detalles del perfil no quedan bajo `NameCard` ni `SocialLinks` a 1024x700, 1280x720 y 2000x1000.
  - [x] No hay overflow horizontal en los viewports medidos.
  - [ ] El usuario confirma que el resultado coincide con la imagen de referencia.
- Required tests: `npm run check`, `npm run build`, `npm run test:visual`, `npx prettier --check` en archivos tocados.
- Test evidence: `check` 49 archivos / 0 errores; build Complete; Playwright 31/31; Prettier dirigido OK. `format:check` global sigue marcando `src/pages/privacy.astro` preexistente.
- Files changed: `AGENTS.md`, `src/styles/global.css`, `src/components/layout/Sidebar.astro`, `src/components/layout/ContentPanel.astro`, `src/components/sections/ProfilePanel.astro`, `tests/visual/layout-alignment.spec.ts`, snapshots desktop de `tests/visual/routes.spec.ts`.
- Risks: la medida usa el borde de 1px de `.atmosphere`; si cambia su grosor, actualizar la fórmula compartida de `--sidebar-width`.
- Status: Implemented; el usuario solicita commit, push y deploy. Confirmación visual manual pendiente.

## 7. Completed phases

| Phase | Outcome                              | Verification                                 | Commit    |
| ----- | ------------------------------------ | -------------------------------------------- | --------- |
| F01   | Split verbatim, sin cambios visuales | check 0 errores, build Complete, prettier OK | `cd429ab` |

## 8. Recommended next action

- Next phase: F03 — confirmar apariencia en `npx astro sync && npm run dev`.
- Resume command: none
- Suggested effort: low
