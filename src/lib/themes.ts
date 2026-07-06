export const MODES = ["dark", "light"] as const;
export type Mode = (typeof MODES)[number];
export const DEFAULT_MODE: Mode = "dark";

export const THEMES = ["bladerunner", "void", "cyberpunk", "matrix", "bubblegum", "doom", "claude"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "bladerunner";

/** Short label shown in the theme cycler pill for each theme. */
export const THEME_LABELS: Record<Theme, string> = {
  bladerunner: "2049",
  void:        "VOID",
  cyberpunk:   "CYBER",
  matrix:      "NEO",
  bubblegum:   "GUM",
  doom:        "DOOM",
  claude:      "CLAUD",
};

/** localStorage keys shared by darkMode.ts and the inline anti-flash script. */
export const MODE_STORAGE_KEY = "theme";
export const THEME_STORAGE_KEY = "color-theme";

function isTheme(value: string | null): value is Theme {
  return (THEMES as readonly string[]).includes(value ?? "");
}

function isMode(value: string | null): value is Mode {
  return (MODES as readonly string[]).includes(value ?? "");
}

/** Read and validate the persisted mode + theme, falling back to defaults. */
export function resolveThemeState(storage: Pick<Storage, "getItem">): { mode: Mode; theme: Theme } {
  const savedMode = storage.getItem(MODE_STORAGE_KEY);
  const savedTheme = storage.getItem(THEME_STORAGE_KEY);
  return {
    mode: isMode(savedMode) ? savedMode : DEFAULT_MODE,
    theme: isTheme(savedTheme) ? savedTheme : DEFAULT_THEME,
  };
}

/**
 * Apply theme + mode to a document root.
 * Cyberpunk owns :root (dark by default) and uses .dark as its LIGHT override;
 * every other theme follows the normal convention (.dark = dark mode).
 */
export function applyThemeToRoot(root: HTMLElement, theme: Theme, mode: Mode): void {
  const needsDark = theme === "cyberpunk" ? mode === "light" : mode === "dark";
  root.classList.toggle("dark", needsDark);
  if (theme === "cyberpunk") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}
