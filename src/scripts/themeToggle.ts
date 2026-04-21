const THEMES = [
  "variant-1", "variant-2", "variant-3",
  "variant-4", "variant-5", "variant-6", "variant-7",
] as const;

type Theme = (typeof THEMES)[number];

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  (THEMES as readonly string[]).forEach(t => root.classList.remove(t));
  root.classList.add(theme);
}

function initThemeToggle(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  let idx = THEMES.indexOf(saved as Theme);
  if (idx < 0) idx = 0;

  applyTheme(THEMES[idx]);

  btn.addEventListener("click", () => {
    idx = (idx + 1) % THEMES.length;
    applyTheme(THEMES[idx]);
    localStorage.setItem("theme", THEMES[idx]);
  });
}

document.addEventListener("astro:page-load", initThemeToggle);

document.addEventListener("astro:before-swap", (e) => {
  const event = e as Event & { newDocument: Document };
  const saved = localStorage.getItem("theme");
  const valid: Theme = THEMES.includes(saved as Theme) ? (saved as Theme) : "variant-1";
  (THEMES as readonly string[]).forEach(t => event.newDocument.documentElement.classList.remove(t));
  event.newDocument.documentElement.classList.add(valid);
});
