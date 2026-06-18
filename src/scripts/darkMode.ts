import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import { THEMES, DEFAULT_THEME } from "../lib/themes";
import type { Mode, Theme } from "../lib/themes";

const THEME_LABELS: Record<Theme, string> = {
  void:       "VOID",
  cyberpunk:  "CYBER",
  matrix:     "NEO",
  bubblegum:  "GUM",
  doom:       "DOOM",
  retro:      "RETRO",
  elegant:    "LUXE",
  candyland:  "CANDY",
  darkmatter: "MATTR",
  claude:     "CLAUD",
  catppuccin:  "CAPP",
  bladerunner: "2049",
};

function getSystemMode(): Mode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Cyberpunk: :root = dark (default, no class needed).
 *            .dark class = light mode override.
 * Others:    .dark class = dark mode (normal convention).
 */
function applyMode(mode: Mode, theme: Theme): void {
  const needsDark = theme === "cyberpunk" ? mode === "light" : mode === "dark";
  document.documentElement.classList.toggle("dark", needsDark);
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

function updateTogglePill(mode: Mode): void {
  const iconDark  = document.getElementById("icon-dark");
  const iconLight = document.getElementById("icon-light");
  if (!iconDark || !iconLight) return;
  iconDark.style.display  = mode === "dark"  ? "block" : "none";
  iconLight.style.display = mode === "light" ? "block" : "none";
}

function initThemeMode(): void {
  const modeBtn  = document.getElementById("theme-toggle");
  const themeBtn = document.getElementById("color-theme-btn");
  if (!modeBtn) return;

  const savedMode  = localStorage.getItem("theme") as Mode | null;
  const savedTheme = localStorage.getItem("color-theme") as Theme | null;
  let currentMode:  Mode  = savedMode ?? "dark";
  let currentTheme: Theme = (THEMES as readonly string[]).includes(savedTheme ?? "")
    ? (savedTheme as Theme)
    : DEFAULT_THEME;

  applyMode(currentMode, currentTheme);
  applyTheme(currentTheme);
  updateTogglePill(currentMode);

  const newModeBtn = modeBtn.cloneNode(true) as HTMLElement;
  modeBtn.parentNode?.replaceChild(newModeBtn, modeBtn);
  newModeBtn.addEventListener("click", () => {
    currentMode = currentMode === "dark" ? "light" : "dark";
    applyMode(currentMode, currentTheme);
    updateTogglePill(currentMode);
    localStorage.setItem("theme", currentMode);
  });

  if (themeBtn) {
    const newThemeBtn = themeBtn.cloneNode(true) as HTMLElement;
    themeBtn.parentNode?.replaceChild(newThemeBtn, themeBtn);
    newThemeBtn.addEventListener("click", () => {
      const idx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
      currentTheme = THEMES[idx];
      applyTheme(currentTheme);
      applyMode(currentMode, currentTheme);
      localStorage.setItem("color-theme", currentTheme);
    });
  }
}

document.addEventListener("astro:page-load", initThemeMode);

document.addEventListener("astro:before-swap", (e) => {
  const event = e as TransitionBeforeSwapEvent;
  const mode  = (localStorage.getItem("theme") as Mode | null) ?? "dark";
  const theme = (localStorage.getItem("color-theme") as Theme | null) ?? "cyberpunk";
  const needsDark = theme === "cyberpunk" ? mode === "light" : mode === "dark";
  event.newDocument.documentElement.classList.toggle("dark", needsDark);
  if (theme && theme !== "cyberpunk") {
    event.newDocument.documentElement.setAttribute("data-theme", theme);
  } else {
    event.newDocument.documentElement.removeAttribute("data-theme");
  }
});
