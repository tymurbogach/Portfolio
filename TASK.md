# Plan de mejora del portfolio

## Reglas de ejecución

- Completa una tarea por commit atómico.
- Actualiza la casilla de esta lista en el mismo commit.
- Antes de cada tarea, confirma que `git status --short` está vacío.
- Después de T01, ejecuta `npm run format:check`, `npm run test`,
  `npm run check` y `npm run build` antes de cada commit.
- Push y despliegue al final: tras verificar todas las puertas, cuando el
  usuario lo pida al cerrar la tanda. Ver `AGENTS.md`.

## Línea base

- El árbol de trabajo está limpio en `436c750`.
- `npm run check` y `npm run build` pasan, pero Astro muestra dos hints.
- `npm run format:check` falla al analizar cuatro componentes Astro.
- `npm audit --omit=dev` informa de una vulnerabilidad crítica y once altas.

## Tareas

- [x] T01. Actualizar Astro, integraciones y herramientas. Eliminar los hints,
      normalizar el formato y dejar el audit sin vulnerabilidades altas o críticas.
- [x] T02. Añadir Vitest, pruebas unitarias para temas, chat y Umami, y ampliar CI.
- [x] T03. Mover el texto visible a colecciones, incluida una colección `chat`.
- [x] T04. Convertir `SocialLinks` en componente presentacional y eliminar tipos
      redundantes en callbacks de colecciones.
- [x] T05. Sustituir estilos inline no permitidos, eliminar `transition-all` y
      mover los estilos de TrueFocus a `global.css`.
- [x] T06. Rehacer TrueFocus sin animaciones de layout y respetar reduced motion.
- [x] T07. Normalizar AbortController, temporizadores y fetch en scripts cliente.
- [x] T08. Corregir accesibilidad del formulario y del diálogo de chat.
- [x] T09. Limitar el chat, validar entradas, cancelar upstreams y documentar la
      regla de rate limit de Cloudflare.
- [x] T10. Validar Umami, cachear estadísticas, añadir salud, cabeceras y entorno.
- [ ] T11. Actualizar README y validar el flujo de despliegue de la Pi.

## Limitaciones conocidas

- T01 dejó 3 entradas altas por `http-cache-semantics`; `npm audit fix` del
  22-11-2026 las eliminó (astro 7.4.13, vite 8.3.8, zod 4.6.7, undici y
  fast-uri corregidos, 0 vulnerabilidades). Sin downgrades.
- T11 tiene el README y `AGENTS.md` actualizados; la validación del flujo de
  la Pi queda pendiente de una petición explícita de despliegue.

## Interfaces previstas

- `POST /api/chat` añade respuestas `429` y `504`.
- `GET /api/health` devuelve `{ "status": "ok" }`.
- `npm run test` ejecuta las pruebas una vez.
- Las variables de Umami se documentan sin secretos.
