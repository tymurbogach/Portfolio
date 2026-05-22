function initTapFeedback(ac: AbortController) {
  document.addEventListener(
    "touchstart",
    (e) => {
      const target = (e.target as Element).closest<HTMLElement>(
        "a, button, [role='button']"
      );
      if (!target || target.classList.contains("nav-link")) return;

      target.classList.remove("tap-active");
      void target.offsetWidth;
      target.classList.add("tap-active");
      target.addEventListener(
        "animationend",
        () => target.classList.remove("tap-active"),
        { once: true }
      );
    },
    { passive: true, signal: ac.signal }
  );
}

document.addEventListener("astro:page-load", () => {
  const ac = new AbortController();
  initTapFeedback(ac);
  document.addEventListener("astro:before-preparation", () => ac.abort(), {
    once: true,
  });
});
