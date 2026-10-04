# Plan de mejora del portfolio

## Reglas de ejecución

- Completa una tarea por commit atómico.
- Actualiza la casilla de esta lista en el mismo commit.
- Antes de cada tarea, confirma que `git status --short` está vacío.
- Después de T01, ejecuta `npm run format:check`, `npm run test`,
  `npm run check` y `npm run build` antes de cada commit.
- No hagas push ni despliegue sin una petición explícita.

## Línea base

- El árbol de trabajo está limpio en `436c750`.
- `npm run check` y `npm run build` pasan, pero Astro muestra dos hints.
- `npm run format:check` falla al analizar cuatro componentes Astro.
- `npm audit --omit=dev` informa de una vulnerabilidad crítica y once altas.

## Tareas

- [ ] T01. Actualizar Astro, integraciones y herramientas. Eliminar los hints,
  normalizar el formato y dejar el audit sin vulnerabilidades altas o críticas.
- [ ] T02. Añadir Vitest, pruebas unitarias para temas, chat y Umami, y ampliar CI.
- [ ] T03. Mover el texto visible a colecciones, incluida una colección `chat`.
- [ ] T04. Convertir `SocialLinks` en componente presentacional y eliminar tipos
  redundantes en callbacks de colecciones.
- [ ] T05. Sustituir estilos inline no permitidos, eliminar `transition-all` y
  mover los estilos de TrueFocus a `global.css`.
- [ ] T06. Rehacer TrueFocus sin animaciones de layout y respetar reduced motion.
- [ ] T07. Normalizar AbortController, temporizadores y fetch en scripts cliente.
- [ ] T08. Corregir accesibilidad del formulario y del diálogo de chat.
- [ ] T09. Limitar el chat, validar entradas, cancelar upstreams y documentar la
  regla de rate limit de Cloudflare.
- [ ] T10. Validar Umami, cachear estadísticas, añadir salud, cabeceras y entorno.
- [ ] T11. Actualizar README y validar el flujo de despliegue de la Pi.

## Interfaces previstas

- `POST /api/chat` añade respuestas `429` y `504`.
- `GET /api/health` devuelve `{ "status": "ok" }`.
- `npm run test` ejecuta las pruebas una vez.
- Las variables de Umami se documentan sin secretos.
