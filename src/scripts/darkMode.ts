import type { TransitionBeforeSwapEvent } from "astro:transitions/client";
import {
  THEMES,
  THEME_LABELS,
  MODE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  resolveThemeState,
  applyThemeToRoot,
} from "../lib/themes";
import type { Mode, Theme } from "../lib/themes";

function applyTheme(theme: Theme, mode: Mode): void {
  applyThemeToRoot(document.documentElement, theme, mode);
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

  const controller = new AbortController();
  const { signal } = controller;

  let { mode: currentMode, theme: currentTheme } = resolveThemeState(localStorage);

  applyTheme(currentTheme, currentMode);
  updateTogglePill(currentMode);

  modeBtn.addEventListener("click", () => {
    currentMode = currentMode === "dark" ? "light" : "dark";
    applyTheme(currentTheme, currentMode);
    updateTogglePill(currentMode);
    localStorage.setItem(MODE_STORAGE_KEY, currentMode);
  }, { signal });

  themeBtn?.addEventListener("click", () => {
    const idx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
    currentTheme = THEMES[idx];
    applyTheme(currentTheme, currentMode);
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }, { signal });

  document.addEventListener("astro:before-preparation", () => controller.abort(), { once: true });
}

document.addEventListener("astro:page-load", initThemeMode);

// Re-apply the persisted theme to the incoming document before the view
// transition swap, so client-side navigation never flashes the default theme.
document.addEventListener("astro:before-swap", (e) => {
  const event = e as TransitionBeforeSwapEvent;
  const { mode, theme } = resolveThemeState(localStorage);
  applyThemeToRoot(event.newDocument.documentElement, theme, mode);
});
