export const MODES = ["dark", "light"] as const;
export type Mode = (typeof MODES)[number];
export const DEFAULT_MODE: Mode = "dark";

export const THEMES = ["cyberpunk", "retro"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "cyberpunk";
