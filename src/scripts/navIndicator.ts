function updateIndicator(instant = false): void {
  const nav = document.querySelector("nav") as HTMLElement | null;
  const indicator = document.getElementById("nav-indicator") as HTMLElement | null;
  const active = document.querySelector('.nav-link[data-active="true"]') as HTMLElement | null;
  if (!nav || !indicator || !active) return;
  if (instant) indicator.style.transition = "none";
  const navRect = nav.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  indicator.style.left = `${activeRect.left - navRect.left}px`;
  indicator.style.width = `${activeRect.width}px`;
  if (instant) {
    window.requestAnimationFrame(() => {
      indicator.style.transition = "";
    });
  }
}

function syncNavActive(): void {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll<HTMLElement>(".nav-link[data-active]").forEach((link) => {
    const href = (link.getAttribute("href") ?? "").replace(/\/$/, "") || "/";
    link.dataset.active = String(href === path);
  });
  updateIndicator(true);
}

document.addEventListener("astro:page-load", syncNavActive);
