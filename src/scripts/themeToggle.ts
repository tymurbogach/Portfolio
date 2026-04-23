// Temas disponibles en orden de ciclo. Para añadir uno:
// 1. Añadir bloque CSS :root.theme-* en global.css con todas las variables obligatorias
// 2. Añadir el string al array THEMES

import type { TransitionBeforeSwapEvent } from "astro:transitions/client";

// 3. Añadir al array valid[] en el script is:inline de Layout.astro (anti-flash)
const THEMES = ["theme-void", "theme-abyss", "theme-chalk", "theme-stone"] as const;

function applyTheme(theme: string): void {
  const root = document.documentElement;
  root.classList.forEach((cls) => {
    if (cls.startsWith("theme-")) root.classList.remove(cls);
  });
  root.classList.add(theme);
}

function initThemeToggle(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  let idx = THEMES.indexOf(localStorage.getItem("theme") as typeof THEMES[number]);
  if (idx < 0) idx = 0;

  applyTheme(THEMES[idx]);

  // Clonar para limpiar listeners anteriores (necesario en SPA con astro:page-load)
  const newBtn = btn.cloneNode(true) as HTMLElement;
  btn.parentNode?.replaceChild(newBtn, btn);

  // Triple-clic nativo (e.detail === 3) para cambiar tema
  newBtn.addEventListener("click", (e) => {
    if (e.detail < 3) return;
    e.preventDefault();
    e.stopPropagation();

    idx = (idx + 1) % THEMES.length;
    applyTheme(THEMES[idx]);
    localStorage.setItem("theme", THEMES[idx]);
  });
}

document.addEventListener("astro:page-load", initThemeToggle);

// Preserva el tema al navegar SPA sin flash
document.addEventListener("astro:before-swap", (e) => {
  const event = e as TransitionBeforeSwapEvent;
  const saved = localStorage.getItem("theme") || THEMES[0];

  event.newDocument.documentElement.classList.forEach((cls: string) => {
    if (cls.startsWith("theme-")) {
      event.newDocument.documentElement.classList.remove(cls);
    }
  });

  event.newDocument.documentElement.classList.add(saved);
});
