# TASKS.md

> Plan único y memoria entre fases. Git guarda el historial detallado.

## 1. Objective

- Separar `DualMain` en dos componentes independientes (`Sidebar` izquierda y `ContentPanel` derecha) sin ningún cambio visual ni de comportamiento.
- Todo sigue igual que antes: mismo markup renderizado, mismas clases, mismos tokens, mismo chrome fijo en `Layout`, mismos contratos `sectionNav`.

## 2. Current state

- What works: el split verbatim está implementado. `npm run check` 0 errores, `npm run build` Complete.
- Historia: F01-grid (`6b6161d`) y el intento de voladizo F02 cambiaron la geometría (grid, tokens, overflow, centrado 68ch). El usuario lo rechazó con captura: no era lo pedido. Se revirtió `src/` al original y se rehízo como split verbatim.
- Git branch: `master`, por delante de `origin/master` (commits locales sin push).
- Last review: segunda revisión de F02 bloqueó por `overflow-x:visible + overflow-y:hidden` (computa a `auto`). F02 cancelado a petición del usuario: todo igual que antes.
- Existing local changes: split verbatim sin commitear.
- Required test capabilities: `npm run check`, `npm run build`, `npm run format:check`. Verificación visual del usuario en `npm run dev`.

## 3. Architecture and technology

- Languages and frameworks: Astro 7, TypeScript estricto, Tailwind v4, `@astrojs/node` standalone.
- Relevant structure (sin cambios respecto al original):
  - `src/layouts/Layout.astro`: chrome fijo (`NameCard`, `NavBar`, `SocialLinks`, chat), marco `.atmosphere`, delega a `DualMain` cuando `dual=true`.
  - `src/layouts/DualMain.astro`: composición; el markup vive en `Sidebar` y `ContentPanel`.
  - `src/components/layout/Sidebar.astro` (nuevo): celda izquierda original con `ProfilePanel`, clases y `width: var(--sidebar-width)` intactos.
  - `src/components/layout/ContentPanel.astro` (nuevo): panel derecho original (`pageLabel`, `#content-scroll`, fades), `id`/clases/jerarquía intactos.
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
- Delivery gate: lo mismo. Sin suite adicional.
- Entorno esperado: Arch Linux, Node del repo, `~/Projects/portfolio`.

## 6. Phase plan

| Phase | Title                                 | Status     |
| ----- | ------------------------------------- | ---------- |
| F01   | Split verbatim Sidebar + ContentPanel | Completada |
| F02   | Voladizo coordinado                   | Cancelada  |

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

- Status: Cancelada a petición del usuario (todo sigue igual que antes). Historial del intento bloqueado en Git (`stash F02-bloqueado-revertir-a-F01`).

## 7. Completed phases

| Phase | Outcome                              | Verification                                 | Commit        |
| ----- | ------------------------------------ | -------------------------------------------- | ------------- |
| F01   | Split verbatim, sin cambios visuales | check 0 errores, build Complete, prettier OK | por registrar |

## 8. Recommended next action

- Next phase: ninguna. Verificación visual del usuario en `dev`.
- Resume command: none
- Suggested effort: low
