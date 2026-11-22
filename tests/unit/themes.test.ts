import { describe, expect, it } from "vitest";
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  MODES,
  MODE_STORAGE_KEY,
  THEMES,
  THEME_LABELS,
  THEME_STORAGE_KEY,
  applyThemeToRoot,
  resolveThemeState,
} from "../../src/lib/themes";

function fakeStorage(
  entries: Record<string, string>,
): Pick<Storage, "getItem"> {
  return { getItem: (key: string) => entries[key] ?? null };
}

function fakeRoot() {
  const attrs = new Map<string, string>();
  const toggles: string[] = [];
  return {
    attrs,
    toggles,
    classList: {
      toggle(cls: string, on: boolean) {
        toggles.push(`${cls}:${on}`);
      },
    },
    setAttribute(name: string, value: string) {
      attrs.set(name, value);
    },
    removeAttribute(name: string) {
      attrs.delete(name);
    },
  };
}

describe("resolveThemeState", () => {
  it("returns the defaults when nothing is stored", () => {
    const state = resolveThemeState(fakeStorage({}));
    expect(state.theme).toBe(DEFAULT_THEME);
    expect(state.mode).toBe(DEFAULT_MODE);
  });

  it("keeps a valid persisted theme and mode", () => {
    const state = resolveThemeState(
      fakeStorage({
        [THEME_STORAGE_KEY]: "matrix",
        [MODE_STORAGE_KEY]: "light",
      }),
    );
    expect(state.theme).toBe("matrix");
    expect(state.mode).toBe("light");
  });

  it("falls back to the defaults on unknown values", () => {
    const state = resolveThemeState(
      fakeStorage({
        [THEME_STORAGE_KEY]: "nope",
        [MODE_STORAGE_KEY]: "nope",
      }),
    );
    expect(state.theme).toBe(DEFAULT_THEME);
    expect(state.mode).toBe(DEFAULT_MODE);
  });
});

describe("applyThemeToRoot", () => {
  it("adds .dark and data-theme for a normal theme in dark mode", () => {
    const root = fakeRoot();
    applyThemeToRoot(root as unknown as HTMLElement, "matrix", "dark");
    expect(root.toggles).toContain("dark:true");
    expect(root.attrs.get("data-theme")).toBe("matrix");
  });

  it("removes .dark but keeps data-theme for a normal theme in light mode", () => {
    const root = fakeRoot();
    applyThemeToRoot(root as unknown as HTMLElement, "matrix", "light");
    expect(root.toggles).toContain("dark:false");
    expect(root.attrs.get("data-theme")).toBe("matrix");
  });

  it("uses .dark as the LIGHT override for cyberpunk", () => {
    const lightRoot = fakeRoot();
    applyThemeToRoot(lightRoot as unknown as HTMLElement, "cyberpunk", "light");
    expect(lightRoot.toggles).toContain("dark:true");
    expect(lightRoot.attrs.has("data-theme")).toBe(false);

    const darkRoot = fakeRoot();
    applyThemeToRoot(darkRoot as unknown as HTMLElement, "cyberpunk", "dark");
    expect(darkRoot.toggles).toContain("dark:false");
    expect(darkRoot.attrs.has("data-theme")).toBe(false);
  });
});

describe("theme registry", () => {
  it("declares a label for every theme", () => {
    for (const theme of THEMES) {
      expect(THEME_LABELS[theme].length).toBeGreaterThan(0);
    }
  });

  it("accepts only the two documented modes", () => {
    expect(MODES).toEqual(["dark", "light"]);
  });
});
