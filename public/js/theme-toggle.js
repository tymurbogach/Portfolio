const THEMES = [
  "variant-1", "variant-2", "variant-3",
  "variant-4", "variant-5", "variant-6", "variant-7",
];

function applyTheme(theme) {
  const root = document.documentElement;
  THEMES.forEach(t => root.classList.remove(t));
  root.classList.add(theme);
}

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  let idx = THEMES.indexOf(saved);
  if (idx < 0) idx = 0;

  // Ensure correct theme is applied (in case classList was wiped)
  applyTheme(THEMES[idx]);

  btn.addEventListener("click", function () {
    idx = (idx + 1) % THEMES.length;
    applyTheme(THEMES[idx]);
    localStorage.setItem("theme", THEMES[idx]);
  });
}

document.addEventListener("astro:page-load", initThemeToggle);

// Apply theme to incoming document before ViewTransitions swap to prevent flash
document.addEventListener('astro:before-swap', (e) => {
  const saved = localStorage.getItem('theme');
  const valid = THEMES.includes(saved) ? saved : 'variant-1';
  THEMES.forEach(t => e.newDocument.documentElement.classList.remove(t));
  e.newDocument.documentElement.classList.add(valid);
});
