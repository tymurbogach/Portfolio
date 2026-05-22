function setup(ac: AbortController): void {
  document.addEventListener(
    "touchstart",
    (e) => {
      const el = (e.target as Element).closest<HTMLElement>(
        "a, button, [role='button']"
      );
      if (!el) return;

      const isNav = el.classList.contains("nav-link");

      // Skip active nav link — already highlighted, no feedback needed
      if (isNav && el.dataset.active === "true") return;

      const cls = isNav ? "nav-tap-pressed" : "tap-pressed";
      el.classList.remove(cls);
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add(cls);
      el.addEventListener("animationend", () => el.classList.remove(cls), {
        once: true,
      });
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
