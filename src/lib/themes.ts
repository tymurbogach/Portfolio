export const THEMES = [
  "theme-void",
  "theme-dracula",
  "theme-nord",
  "theme-gruvbox",
  "theme-solarized",
] as const;

export type Theme = (typeof THEMES)[number];
