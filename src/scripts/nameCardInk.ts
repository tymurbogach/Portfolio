/**
 * Aligns the INK of the name and the role in the header lockup.
 *
 * Both rows are laid out with `justify-content: space-between`, which aligns
 * glyph boxes. Boxes include side bearings, and bearings differ per letter and
 * per theme font (H vs G). This script measures the real ink of the first and
 * last letter of each row and pulls the row out by that amount, so the ink
 * touches the same left and right edge in every theme.
 */
const ROWS = ".name-card .name, .name-card .role";
let frame = 0;
let ctx: CanvasRenderingContext2D | null = null;

function ink(el: HTMLElement, char: string) {
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText(char);
  return {
    left: -m.actualBoundingBoxLeft,
    right: m.width - m.actualBoundingBoxRight,
  };
}

function apply() {
  frame = 0;
  for (const row of document.querySelectorAll<HTMLElement>(ROWS)) {
    const spans = row.querySelectorAll<HTMLElement>(":scope > span:not(.gap)");
    const first = spans[0];
    const last = spans[spans.length - 1];
    if (!first || !last) continue;
    const a = ink(first, first.textContent?.trim() ?? "");
    const b = ink(last, last.textContent?.trim() ?? "");
    if (!a || !b) continue;
    row.style.marginLeft = `${(-a.left).toFixed(2)}px`;
    row.style.marginRight = `${(-b.right).toFixed(2)}px`;
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(apply);
}

if (!(window as unknown as { __nameCardInk?: boolean }).__nameCardInk) {
  (window as unknown as { __nameCardInk?: boolean }).__nameCardInk = true;
  schedule();
  void document.fonts.ready.then(schedule);
  document.fonts.addEventListener("loadingdone", schedule);
  document.addEventListener("astro:page-load", schedule);
  window.addEventListener("resize", schedule);
  // Theme or mode change: swaps the font families.
  new MutationObserver(schedule).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });
}
