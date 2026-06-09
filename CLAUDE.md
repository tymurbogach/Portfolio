# Portfolio — Timur

## Stack

- **Astro 6** (static, SSG) + **Tailwind v4** vía `@tailwindcss/vite` (config en CSS, sin `tailwind.config.js`)
- **TypeScript** estricto (`astro/tsconfigs/strict`) · **simple-icons** para logos
- Build: `npm run build` → `dist/` · Dev: `npm run dev` (puerto 4321)
- Deploy: Pi via Docker → `ssh pi@192.168.18.18 "cd ~/docker/stacks/web && docker compose up -d --build"`

## Skills activas

| Skill | Activación |
|-------|-----------|
| `caveman` | automática (hook de sesión) |
| `context7` | automática (al mencionar librería/framework) |
| `frontend-design` | manual `/frontend-design` o cuando Claude detecta tarea UI |
| `code-review` | manual `/code-review` |
| `code-simplifier` | manual `/simplify` |
| `security-guidance` | manual `/security-review` |

## Separación de código

Reglas obligatorias en todo el proyecto:

- **Scripts**: toda lógica JS/TS va en `src/scripts/`. Los componentes solo hacen `import` desde ahí. Prohibido JS inline en `.astro` salvo el anti-flash de tema en `<head>` (`is:inline` justificado).
- **Estilos**: usar Tailwind inline en los elementos. Prohibido `<style>` en componentes salvo que Tailwind no pueda expresarlo (ej: selectores `[data-attr]`, `color-mix()`). En ese caso, el estilo va como `@utility` en `src/styles/global.css`.
- **Sin `style="..."` inline** salvo referencias a variables CSS (`var(--*)`) que no tienen equivalente Tailwind directo.

## Auto-memoria

Al terminar cualquier sesión con cambios relevantes (features nuevas, decisiones de arquitectura, bugs resueltos, cambios de diseño significativos), guardar en memoria sin que el usuario lo pida explícitamente.

## Referencia técnica completa

@portfolio.md
