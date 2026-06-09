const MAX_ROWS = 4;

function calcRowsHeight(grid: HTMLElement, rows: number): number {
  const prev = grid.style.maxHeight;
  grid.style.maxHeight = "none";

  const items = [...grid.children] as HTMLElement[];
  const containerTop = grid.getBoundingClientRect().top;
  let rowCount = 0;
  let prevTop = -1;
  let maxBottom = 0;

  for (const item of items) {
    const rect = item.getBoundingClientRect();
    const relTop = Math.round(rect.top - containerTop);
    if (relTop > prevTop) {
      rowCount++;
      prevTop = relTop;
    }
    if (rowCount > rows) break;
    maxBottom = Math.max(maxBottom, rect.bottom - containerTop);
  }

  grid.style.maxHeight = prev;
  return maxBottom;
}

function initResumeToggles() {
  const cleanups: (() => void)[] = [];

  document.querySelectorAll<HTMLElement>(".resume-section").forEach((section) => {
    const grid    = section.querySelector<HTMLElement>(".resume-grid");
    const btn     = section.querySelector<HTMLButtonElement>(".resume-toggle");
    const labelEl = btn?.querySelector<HTMLElement>(".resume-toggle-label");
    const wordEl  = btn?.querySelector<HTMLElement>(".resume-toggle-word");
    if (!grid || !btn) return;

    const ac = new AbortController();
    let collapsedHeight = 0;

    const applyCollapsed = () => {
      collapsedHeight = calcRowsHeight(grid, MAX_ROWS);
      if (collapsedHeight > 0) grid.style.maxHeight = `${collapsedHeight}px`;
    };

    const update = () => {
      if (btn.getAttribute("aria-expanded") === "true") return;
      applyCollapsed();
      const overflows = grid.scrollHeight > grid.clientHeight + 2;
      if (overflows) {
        btn.classList.remove("hidden");
        btn.classList.add("flex");
      } else {
        btn.classList.add("hidden");
        btn.classList.remove("flex");
      }
      if (labelEl) {
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
        grid.classList.remove("is-expanded");
        btn.setAttribute("aria-expanded", "false");
        if (wordEl) wordEl.textContent = "more";
        update();
      } else {
        grid.style.maxHeight = "none";
        grid.classList.add("is-expanded");
        btn.setAttribute("aria-expanded", "true");
        if (labelEl) labelEl.textContent = "−";
        if (wordEl)  wordEl.textContent  = "less";
        btn.classList.remove("hidden");
        btn.classList.add("flex");
      }
    }, { signal: ac.signal });

    const ro = new ResizeObserver(() => {
      if (btn.getAttribute("aria-expanded") !== "true") update();
    });
    ro.observe(grid);
    update();

    cleanups.push(() => { ac.abort(); ro.disconnect(); });
  });

  document.addEventListener("astro:before-preparation", () => {
    cleanups.forEach(fn => fn());
  }, { once: true });
}

document.addEventListener("astro:page-load", initResumeToggles);
