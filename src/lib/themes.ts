export const MODES = ["dark", "light"] as const;
export type Mode = (typeof MODES)[number];
export const DEFAULT_MODE: Mode = "dark";

export const THEMES = ["cyberpunk", "bubblegum", "doom", "retro", "elegant", "candyland", "darkmatter"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "cyberpunk";
