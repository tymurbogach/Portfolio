export const MODES = ["dark", "light"] as const;
export type Mode = (typeof MODES)[number];
export const DEFAULT_MODE: Mode = "dark";
