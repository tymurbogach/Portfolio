function initResumeToggles() {
  const cleanups: (() => void)[] = [];

  document.querySelectorAll<HTMLElement>(".resume-section").forEach((section) => {
    const grid    = section.querySelector<HTMLElement>(".resume-grid");
    const btn     = section.querySelector<HTMLButtonElement>(".resume-toggle");
    const labelEl = btn?.querySelector<HTMLElement>(".resume-toggle-label");
    const wordEl  = btn?.querySelector<HTMLElement>(".resume-toggle-word");
    if (!grid || !btn) return;

    const ac = new AbortController();

    const update = () => {
      const overflows = grid.scrollHeight > grid.clientHeight + 2;
      btn.classList.toggle("hidden", !overflows && btn.getAttribute("aria-expanded") !== "true");
      if (labelEl && btn.getAttribute("aria-expanded") !== "true") {
        const gridBottom = grid.getBoundingClientRect().bottom;
        const hidden = [...grid.children].filter(
          (el) => el.getBoundingClientRect().top >= gridBottom - 2
        ).length;
        labelEl.textContent = hidden > 0 ? `+${hidden}` : "";
      }
    };

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (expanded) {
        grid.style.maxHeight = "";
        btn.setAttribute("aria-expanded", "false");
        if (wordEl) wordEl.textContent = "more";
        update();
      } else {
        grid.style.maxHeight = "none";
        btn.setAttribute("aria-expanded", "true");
        if (labelEl) labelEl.textContent = "−";
        if (wordEl)  wordEl.textContent  = "less";
        btn.classList.remove("hidden");
      }
    }, { signal: ac.signal });

    const ro = new ResizeObserver(update);
    ro.observe(grid);
    update();

    cleanups.push(() => { ac.abort(); ro.disconnect(); });
  });

  document.addEventListener("astro:before-preparation", () => {
    cleanups.forEach(fn => fn());
  }, { once: true });
}

document.addEventListener("astro:page-load", initResumeToggles);
