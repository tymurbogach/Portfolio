// Posiciona el indicador bajo el enlace activo.
// instant=true desactiva la transición para la carga inicial (sin animación rara)
function updateIndicator(instant = false): void {
  const indicator = document.getElementById("nav-indicator") as HTMLElement | null;
  if (!indicator) return;

  // Busca el div contenedor (padre del nav), no el nav en sí
  const container = indicator.closest("div") as HTMLElement | null;
  const nav = container?.querySelector("nav") as HTMLElement | null;
  const active = nav?.querySelector('.nav-link[data-active="true"]') as HTMLElement | null;
  if (!container || !nav || !active) return;

  if (instant) indicator.style.transition = "none";

  const containerRect = container.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  indicator.style.left = `${activeRect.left - containerRect.left}px`;
  indicator.style.width = `${activeRect.width}px`;

  if (instant) {
    window.requestAnimationFrame(() => {
      indicator.style.transition = "left 0.25s ease, width 0.25s ease";
    });
  }
}

// Compara la ruta actual con el href de cada enlace y marca el activo
function syncNavActive(): void {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  document.querySelectorAll<HTMLElement>(".nav-link[data-active]").forEach((link) => {
    const href = (link.getAttribute("href") ?? "").replace(/\/$/, "") || "/";
    link.dataset.active = String(href === path);
  });

  updateIndicator(true);
}

document.addEventListener("astro:page-load", syncNavActive);

