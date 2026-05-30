import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import { THEMES } from "../lib/themes";
export { THEMES };

function applyTheme(theme: string): void {
  const root = document.documentElement;
  root.classList.forEach((cls) => {
    if (cls.startsWith("theme-")) root.classList.remove(cls);
  });
  root.classList.add(theme);
  const badge = document.querySelector<HTMLElement>("[data-theme-label]");
  if (badge) badge.textContent = theme.replace("theme-", "");
}

function initThemeToggle(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  let idx = THEMES.indexOf(localStorage.getItem("theme") as typeof THEMES[number]);
  if (idx < 0) idx = 0;

  applyTheme(THEMES[idx]);

  const newBtn = btn.cloneNode(true) as HTMLElement;
  btn.parentNode?.replaceChild(newBtn, btn);

  newBtn.addEventListener("click", (e) => {
    e.preventDefault();
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
