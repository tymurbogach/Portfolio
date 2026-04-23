// ═══════════════════════════════════════════════════════
// SISTEMA DE TEMAS DINÁMICO (SIMPLIFICADO)
// Detecta automáticamente clases theme-*
// ═══════════════════════════════════════════════════════

// Obtiene todos los themes desde el CSS aplicado al <html>
function getThemes(): string[] {
  return Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules);
      } catch {
        return [];
      }
    })
    .flatMap(rule => {
      if (rule instanceof CSSStyleRule) {
        const match = rule.selectorText?.match(/:root\.(theme-[\w-]+)/);
        return match ? [match[1]] : [];
      }
      return [];
    })
    // elimina duplicados
    .filter((v, i, arr) => arr.indexOf(v) === i);
}

// Aplica tema
function applyTheme(theme: string) {
  const root = document.documentElement;

  root.classList.forEach(cls => {
    if (cls.startsWith("theme-")) root.classList.remove(cls);
  });

  root.classList.add(theme);
}

// Init
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const THEMES = getThemes();

  let idx = THEMES.indexOf(localStorage.getItem("theme") || "");
  if (idx < 0) idx = 0;

  applyTheme(THEMES[idx]);

  const newBtn = btn.cloneNode(true);
  btn.parentNode?.replaceChild(newBtn, btn);

  newBtn.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();

    idx = (idx + 1) % THEMES.length;
    const theme = THEMES[idx];

    applyTheme(theme);
    localStorage.setItem("theme", theme);
  });
}

// Eventos Astro
document.addEventListener("astro:page-load", initThemeToggle);

document.addEventListener("astro:before-swap", (e) => {
  const event = e as any;
  const saved = localStorage.getItem("theme") || "theme-void";

  event.newDocument.documentElement.classList.forEach((cls: string) => {
    if (cls.startsWith("theme-")) {
      event.newDocument.documentElement.classList.remove(cls);
    }
  });

  event.newDocument.documentElement.classList.add(saved);
});