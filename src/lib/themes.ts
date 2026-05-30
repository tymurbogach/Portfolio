export const THEMES = [
  "theme-void",
  "theme-abyss",
  "theme-stone",
  "theme-ember",
  "theme-neon",
  "theme-ice",
  "theme-amber",
] as const;

export type Theme = (typeof THEMES)[number];
