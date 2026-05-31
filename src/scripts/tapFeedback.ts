/** Apply a CSS animation class, then remove it when done. */
function animate(el: HTMLElement, cls: string): void {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  const cleanup = () => el.classList.remove(cls);
  el.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 1100);
}

function setup(ac: AbortController): void {
  // Pending state for deferred elements (fired on touchend, cancelled on scroll)
  let pendingEl:  HTMLElement | null = null;
  let pendingCls: string | null = null;
  let startX = 0;
  let startY = 0;
  const SCROLL_THRESHOLD = 10; // px — cancel if finger moved this much

  function cancel() { pendingEl = null; pendingCls = null; }

  document.addEventListener(
    "touchstart",
    (e) => {
      cancel();
      const el = (e.target as Element).closest<HTMLElement>(
        "a, button, [role='button']"
      );
      if (!el) return;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;

      const isNavLink   = el.classList.contains("nav-link");
      const inNavPanel  = !!el.closest(".nav-panel");
      const isActionBtn = el.classList.contains("btn-primary") ||
                          el.classList.contains("btn-ghost");

      if (isNavLink) {
        // NavBar links have data-active; NameCard nav-link does not
        if (el.hasAttribute("data-active")) {
          if (el.dataset.active === "true") return;
          animate(el, "nav-tap-pressed"); // immediate — nav is fixed, never scrolls
        } else {
          // NameCard: uses separate animation so text snaps to letter-color
          // before bg fades — avoids near-black text on dark bg ("fade to black")
          animate(el, "namecard-tap-pressed");
        }
      } else if (inNavPanel) {
        // SocialLinks, bot button — inside nav-panel (fixed, not scrollable)
        animate(el, "nav-tap-pressed"); // immediate
      } else if (isActionBtn) {
        // btn-primary / btn-ghost: CSS :active handles visual feedback instantly
        return;
      } else {
        // ProjectCards, mobile FAB, misc — defer to touchend so scroll doesn't trigger dim
        pendingEl  = el;
        pendingCls = "tap-pressed";
      }
    },
    { passive: true, signal: ac.signal }
  );

  // Cancel deferred animation if finger moves (user is scrolling, not tapping)
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!pendingEl) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > SCROLL_THRESHOLD || dy > SCROLL_THRESHOLD) cancel();
    },
    { passive: true, signal: ac.signal }
  );

  // Fire deferred animation only if no scroll happened
  document.addEventListener("touchend",   () => { if (pendingEl && pendingCls) animate(pendingEl, pendingCls); cancel(); }, { signal: ac.signal });
  document.addEventListener("touchcancel", cancel, { signal: ac.signal });
}

document.addEventListener("astro:page-load", () => {
  const ac = new AbortController();
  setup(ac);
  document.addEventListener("astro:before-preparation", () => ac.abort(), {
    once: true,
  });
});
