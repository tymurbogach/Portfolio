import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import type { Mode, Theme } from "../lib/themes";

function getSystemMode(): Mode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyMode(mode: Mode): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

function applyTheme(theme: Theme): void {
  if (theme === "cyberpunk") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  const labelEl = document.getElementById("theme-name-label");
  if (labelEl) labelEl.textContent = theme === "retro" ? "RETRO" : "CYBER";
}

function initThemeMode(): void {
  const modeBtn  = document.getElementById("theme-toggle");
  const themeBtn = document.getElementById("color-theme-btn");
  if (!modeBtn) return;

  const savedMode  = localStorage.getItem("theme") as Mode | null;
  const savedTheme = localStorage.getItem("color-theme") as Theme | null;
  let currentMode:  Mode  = savedMode  ?? getSystemMode();
  let currentTheme: Theme = (savedTheme === "retro" ? "retro" : "cyberpunk");

  applyMode(currentMode);
  applyTheme(currentTheme);

  // Mode toggle (replace node to clear stale listeners from view transitions)
  const newModeBtn = modeBtn.cloneNode(true) as HTMLElement;
  modeBtn.parentNode?.replaceChild(newModeBtn, modeBtn);
  newModeBtn.addEventListener("click", () => {
    currentMode = currentMode === "dark" ? "light" : "dark";
    applyMode(currentMode);
    localStorage.setItem("theme", currentMode);
  });

  // Theme toggle
  if (themeBtn) {
    const newThemeBtn = themeBtn.cloneNode(true) as HTMLElement;
    themeBtn.parentNode?.replaceChild(newThemeBtn, themeBtn);
    newThemeBtn.addEventListener("click", () => {
      currentTheme = currentTheme === "cyberpunk" ? "retro" : "cyberpunk";
      applyTheme(currentTheme);
      localStorage.setItem("color-theme", currentTheme);
    });
  }
}

document.addEventListener("astro:page-load", initThemeMode);

document.addEventListener("astro:before-swap", (e) => {
  const event = e as TransitionBeforeSwapEvent;
  const mode  = localStorage.getItem("theme") ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const theme = localStorage.getItem("color-theme");
  event.newDocument.documentElement.classList.toggle("dark", mode === "dark");
  if (theme === "retro") {
    event.newDocument.documentElement.setAttribute("data-theme", "retro");
  } else {
    event.newDocument.documentElement.removeAttribute("data-theme");
  }
});
