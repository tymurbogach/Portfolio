/**
 * Aligns the INK of the name and the role in the header lockup, and guarantees
 * the title is never cut on the right.
 *
 * Both rows are laid out with `justify-content: space-between`, which aligns
 * glyph boxes. Boxes include side bearings, and bearings differ per letter and
 * per theme font (H vs G). This script measures the real ink of the first and
 * last letter of each row and pulls the row out by that amount, so the ink
 * touches the same left and right edge in every theme.
 *
 * The pull-out (or an oversize font) can push row content past the card, and
 * the fixed mobile header clips at its own bounds (`overflow: clip`). After
 * aligning, the lockup font shrinks proportionally until every row's content
 * fits inside its card, so the title is never cut on the right. When everything
 * fits (the common case) the loop exits at once and nothing changes.
 */
const CARDS = ".name-card";
const MAX_ITER = 10;
const MIN_FONT_PX = 10;
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

function alignInk(row: HTMLElement) {
  const spans = row.querySelectorAll<HTMLElement>(":scope > span:not(.gap)");
  const first = spans[0];
  const last = spans[spans.length - 1];
  if (!first || !last) return;
  const a = ink(first, first.textContent?.trim() ?? "");
  const b = ink(last, last.textContent?.trim() ?? "");
  if (!a || !b) return;
  row.style.marginLeft = `${(-a.left).toFixed(2)}px`;
  row.style.marginRight = `${(-b.right).toFixed(2)}px`;
}

function fitCard(
  card: HTMLElement,
  lockup: HTMLElement,
  rows: HTMLElement[],
) {
  let font = parseFloat(getComputedStyle(lockup).fontSize);
  if (!Number.isFinite(font) || font <= 0) return;
  for (let i = 0; i < MAX_ITER && font > MIN_FONT_PX; i++) {
    const cardRect = card.getBoundingClientRect();
    if (cardRect.width <= 0) return;
    let need = 0;
    for (const row of rows) {
      const box = row.getBoundingClientRect();
      // Content can extend past the row box (flex overflow); the visible
      // right edge is whichever reaches further. On the left, the ink
      // margins already widen the box itself, so the box covers it.
      const extent = Math.max(box.right, box.left + row.scrollWidth);
      need = Math.max(
        need,
        extent - cardRect.left,
        cardRect.right - box.left,
      );
    }
    if (need <= cardRect.width) return;
    font = Math.max(MIN_FONT_PX, (font * cardRect.width) / need);
    lockup.style.fontSize = `${font.toFixed(2)}px`;
  }
}

function apply() {
  frame = 0;
  for (const card of document.querySelectorAll<HTMLElement>(CARDS)) {
    const lockup = card.querySelector<HTMLElement>(".lockup");
    if (!lockup) continue;
    const rows = [...lockup.querySelectorAll<HTMLElement>(".name, .role")];
    if (rows.length === 0) continue;
    // Reset: back to CSS sizing before measuring.
    lockup.style.fontSize = "";
    for (const row of rows) {
      row.style.marginLeft = "";
      row.style.marginRight = "";
    }
    if (card.clientWidth <= 0) continue; // hidden card (other breakpoint)
    for (const row of rows) alignInk(row);
    fitCard(card, lockup, rows);
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
