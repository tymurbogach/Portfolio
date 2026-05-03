import { positionIndicator } from "./navUtils";

function syncNavActive(): void {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll<HTMLElement>(".nav-link[data-active]").forEach((link) => {
    const href = (link.getAttribute("href") ?? "").replace(/\/$/, "") || "/";
    link.dataset.active = String(href === path);
  });
  positionIndicator(true);
}

document.addEventListener("astro:page-load", syncNavActive);
