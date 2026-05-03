/** Repositions the nav indicator bar under the active nav link. */
export function positionIndicator(instant = false): void {
  const indicator = document.getElementById("nav-indicator") as HTMLElement | null;
  if (!indicator) return;
  const container = indicator.closest("div") as HTMLElement | null;
  const nav = container?.querySelector("nav") as HTMLElement | null;
  const active = nav?.querySelector<HTMLElement>('.nav-link[data-active="true"]');
  if (!container || !nav || !active) return;

  if (instant) indicator.style.transition = "none";

  const cr = container.getBoundingClientRect();
  const ar = active.getBoundingClientRect();
  indicator.style.left  = `${ar.left - cr.left}px`;
  indicator.style.width = `${ar.width}px`;

  if (instant) {
    requestAnimationFrame(() => {
      indicator.style.transition = "left 0.25s ease, width 0.25s ease";
    });
  }
}
