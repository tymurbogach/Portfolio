# Datos profesionales en portfolio (F09)

Los `cv.config.{en,es}.json` de este directorio quedan congelados como
proyección de lectura: no añadir hechos nuevos aquí. La fuente de verdad es
el perfil maestro de JobPilot.

- Camino futuro: `npm run cv:jobpilot` descarga el CV general aprobado desde
  JobPilot (`GET /public/cv/{es,en}` con token revocable) y verifica su SHA-256
  antes de sustituir `public/TymurBogach_CV_{ES,EN}.pdf`. Si JobPilot no
  responde o el hash no coincide, se conserva el PDF anterior.
- Camino anterior (`npm run cv:pdf` desde estos configs) sigue disponible hasta
  validar el consumo en producción. No borrar estos archivos hasta entonces.
- El contenido editorial propio (textos del sitio, colecciones, estilos) no se
  ve afectado: solo los datos profesionales duplicados quedan congelados.
