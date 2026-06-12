import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import { THEMES } from "../lib/themes";
import type { Mode, Theme } from "../lib/themes";

const THEME_LABELS: Record<Theme, string> = {
  cyberpunk: "CYBER",
  bubblegum: "GUM",
  doom:      "DOOM",
  retro:     "RETRO",
};

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
  if (labelEl) labelEl.textContent = THEME_LABELS[theme];
}

function initThemeMode(): void {
  const modeBtn  = document.getElementById("theme-toggle");
  const themeBtn = document.getElementById("color-theme-btn");
  if (!modeBtn) return;

  const savedMode  = localStorage.getItem("theme") as Mode | null;
  const savedTheme = localStorage.getItem("color-theme") as Theme | null;
  let currentMode:  Mode  = savedMode ?? getSystemMode();
  let currentTheme: Theme = (THEMES as readonly string[]).includes(savedTheme ?? "")
    ? (savedTheme as Theme)
    : "cyberpunk";

  applyMode(currentMode);
  applyTheme(currentTheme);

  const newModeBtn = modeBtn.cloneNode(true) as HTMLElement;
  modeBtn.parentNode?.replaceChild(newModeBtn, modeBtn);
  newModeBtn.addEventListener("click", () => {
    currentMode = currentMode === "dark" ? "light" : "dark";
    applyMode(currentMode);
    localStorage.setItem("theme", currentMode);
  });

  if (themeBtn) {
    const newThemeBtn = themeBtn.cloneNode(true) as HTMLElement;
    themeBtn.parentNode?.replaceChild(newThemeBtn, themeBtn);
    newThemeBtn.addEventListener("click", () => {
      const idx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
      currentTheme = THEMES[idx];
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
  if (theme && theme !== "cyberpunk") {
    event.newDocument.documentElement.setAttribute("data-theme", theme);
  } else {
    event.newDocument.documentElement.removeAttribute("data-theme");
  }
});
