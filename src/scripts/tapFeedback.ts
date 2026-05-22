/** Apply a CSS animation class, then remove it when done. */
function animate(el: HTMLElement, cls: string): void {
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add(cls);
  const cleanup = () => el.classList.remove(cls);
  el.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 1100); // fallback — animationend unreliable on mobile
}

function setup(ac: AbortController): void {
  document.addEventListener(
    "touchstart",
    (e) => {
      const el = (e.target as Element).closest<HTMLElement>(
        "a, button, [role='button']"
      );
      if (!el) return;

      const isRealNav = el.classList.contains("nav-link") && el.hasAttribute("data-active");

      if (isRealNav) {
        // Nav links: <a> is the visual cell — skip if already active, flash bg otherwise
        if (el.dataset.active === "true") return;
        animate(el, "nav-tap-pressed");
      } else if (el.classList.contains("nav-link")) {
        // NameCard: nav-link but no data-active — bg lives on inner <div>, not <a>
        // Applying nav-tap-pressed to <a> would be invisible; target the inner div instead
        const inner = el.querySelector<HTMLElement>(":scope > div");
        animate(inner ?? el, "nav-tap-pressed");
      } else {
        animate(el, "tap-pressed");
      }
    },
    { passive: true, signal: ac.signal }
  );
}

document.addEventListener("astro:page-load", () => {
  const ac = new AbortController();
  setup(ac);
  document.addEventListener("astro:before-preparation", () => ac.abort(), {
    once: true,
  });
});
