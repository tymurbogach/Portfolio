# AGENTS.md — Portfolio

## Stack y ejecución

- Astro 7 con `@astrojs/node` en modo `standalone`.
- Tailwind CSS v4 se configura desde `src/styles/global.css` con `@tailwindcss/vite`.
- TypeScript usa `astro/tsconfigs/strict`. React se usa solo en islas.
- `/api/chat` usa Ollama y recibe `OLLAMA_URL` desde el entorno.
- `/api/stats` consulta Umami.
- Las rutas de API no se prerenderizan. Las páginas estáticas se generan durante el build.

```bash
npm run dev           # Servidor de desarrollo en el puerto 4321
npm run check         # Typecheck de Astro
npm run format:check  # Comprueba el formato
npm run build         # Genera dist/
npm run cv:pdf        # Regenera ambos PDF del CV
```

Después de cada cambio, ejecuta `npm run check` y `npm run build`. No cierres el trabajo si uno falla.

## Despliegue

Cuando el usuario diga explícitamente `deploy` para este portfolio:

1. Revisa los cambios y ejecuta `npm run check` y `npm run build`.
2. Si hay cambios del trabajo pendientes, crea un commit convencional en español. No crees commits vacíos.
3. Ejecuta `git push origin master`.
4. Ejecuta `ssh pi@192.168.18.18 '/home/pi/docker/scripts/deploy portfolio'`.

Detén el proceso e informa del error si falla una comprobación, el commit, el push o el comando remoto.

El despliegue se ejecuta desde la Pi. El comando remoto debe actualizar, reconstruir y reiniciar solo el servicio `portfolio`.

## Arquitectura

- Las cinco rutas usan `PageContent.astro`. `sectionNav.ts` sincroniza cada sección con la URL.
- El documento usa `body` fijo. El único contenedor con scroll es `#content-scroll` en `DualMain.astro`.
- El chrome fijo vive fuera del contenedor de scroll en `Layout.astro`.
- `ui/` contiene piezas presentacionales reutilizables. `sections/` compone secciones y obtiene contenido. `layout/` contiene chrome global.
- Extrae un componente cuando una abstracción estable reduzca duplicación o aclare la intención.

## Cliente y estilos

- Coloca la lógica cliente de Astro en `src/scripts/`. Mantén el script anti-flash inline de `Layout.astro` como excepción.
- Cada navegación con ClientRouter debe liberar listeners, temporizadores, observadores y solicitudes que haya creado. Usa `AbortController` cuando aplique.
- Usa Tailwind para estilos locales. Usa `global.css` para tokens, selectores compartidos, keyframes y clases que genera JavaScript. Usa CSS de componente cuando esté aislado y sea más claro.
- Usa estilos inline para propiedades dinámicas, variables CSS o cuando eviten una abstracción peor. No ocultes layout complejo en estilos inline.
- Usa variables de tema para colores. Conserva los colores de marca de `TAG_SLUGS` como excepción.
- Usa `can-hover:` para efectos hover. No crees media queries manuales para hover.
- Declara la fuente base en `body`, no en el selector universal. Usa `font-hud` solo para la voz de instrumento.
- Conserva un mínimo de 11 px para metadatos y 13 px para texto de lectura.

### Rendimiento móvil

- No uses `mask-image` ni filtros sobre un ancestro de `#content-scroll`.
- Durante el scroll, anima solo `transform` y `opacity`. No animes propiedades de layout ni uses `transition: all`.
- No leas geometría ni estilos calculados dentro de un handler de scroll. Mide antes y almacena el resultado.
- Para investigar jank, mide en un móvil real y cuenta solo los frames donde cambie `scrollTop`.

## Temas y contenido

- `src/lib/themes.ts` es la fuente de verdad para temas, etiquetas, claves de almacenamiento y aplicación al documento.
- Cada tema define sus tokens en `global.css`. Cyberpunk conserva su convención especial: `:root` es oscuro y `.dark` es claro.
- El texto secundario usa tokens de color como `--foreground-faint` y `--muted-foreground`. No apiles opacidad sobre texto.
- Para añadir un tema, actualiza `THEMES`, `THEME_LABELS` y los dos bloques de paleta en `global.css`.
- El contenido editorial, URLs públicas y datos del perfil viven en `src/content/` y tienen schema en `src/content.config.ts`.
- Las etiquetas locales de interfaz, estados, errores y atributos de accesibilidad pueden vivir junto al componente.
- Al añadir un dato de contenido, actualiza schema, archivo de contenido y consumidor en el mismo cambio.
- Usa tipos inferidos desde las colecciones. No dupliques shapes de contenido.

## Código compartido y cierre

- Coloca en `src/lib/` los contratos y constantes de dominio que varios módulos necesitan. Mantén locales los detalles de una sola función o feature.
- Si un cambio altera arquitectura, comportamiento de despliegue o convenciones persistentes, actualiza este archivo o el README.
- Antes de cerrar una feature, verifica la limpieza de recursos cliente, el tipado, el build y la documentación afectada.

## Git

- No añadas `Co-Authored-By` ni atribución de herramientas en commits o PRs.
- Usa mensajes en español con el formato `tipo(scope): descripción en minúscula`.
