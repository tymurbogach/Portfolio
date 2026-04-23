// Lista ordenada de temas disponibles.
// Actualizado con las nuevas clases semánticas ('theme-*')
const THEMES = [
  "theme-void",  // Void  — oscuro, acento dorado    (DEFAULT)
  "theme-abyss", // Abyss — oscuro, acento cyan
  "theme-chalk", // Chalk — claro, neutro frío
  "theme-stone", // Stone — claro, terracota cálido
  "theme-slate", // Slate — claro, azul océano
  "theme-moss",  // Moss  — claro, verde bosque
  "theme-sand",  // Sand  — claro, ámbar cálido
] as const;

type Theme = (typeof THEMES)[number];

// Elimina todas las clases de tema del <html> y aplica la indicada
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  (THEMES as readonly string[]).forEach(t => root.classList.remove(t));
  root.classList.add(theme);
}

// Inicializa el botón de cambio de tema (la foto de perfil)
function initThemeToggle(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  // Recupera el tema guardado; si no hay ninguno, arranca en el primero (theme-void)
  const saved = localStorage.getItem("theme");
  let idx = THEMES.indexOf(saved as Theme);
  if (idx < 0) idx = 0;

  applyTheme(THEMES[idx]);

  // Se asegura de no duplicar event listeners en componentes persistentes de Astro
  // clonando el botón (limpia listeners antiguos) y reemplazándolo
  const newBtn = btn.cloneNode(true);
  btn.parentNode?.replaceChild(newBtn, btn);

  // Cada clic avanza al siguiente tema de forma cíclica
  newBtn.addEventListener("click", () => {
    idx = (idx + 1) % THEMES.length;
    applyTheme(THEMES[idx]);
    localStorage.setItem("theme", THEMES[idx]);
  });
}

// Se ejecuta en cada carga de página (incluidas navegaciones SPA)
document.addEventListener("astro:page-load", initThemeToggle);

// Antes de que Astro intercambie el DOM en una navegación,
// aplica el tema guardado al nuevo documento para evitar el flash blanco
document.addEventListener("astro:before-swap", (e) => {
  const event = e as Event & { newDocument: Document };
  const saved = localStorage.getItem("theme");
  // Si el tema guardado no es válido, usa el por defecto (primer elemento)
  const valid: Theme = THEMES.includes(saved as Theme) ? (saved as Theme) : THEMES[0];

  (THEMES as readonly string[]).forEach(t => event.newDocument.documentElement.classList.remove(t));
  event.newDocument.documentElement.classList.add(valid);
});