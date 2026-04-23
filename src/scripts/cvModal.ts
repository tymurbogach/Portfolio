function initCvModal(): void {
  const btn = document.getElementById("cv-view-btn");
  const modal = document.getElementById("cv-modal") as HTMLElement | null;
  const closeBtn = document.getElementById("cv-close-btn");
  const dlBtn = document.getElementById("cv-download-btn");
  const iframe = document.getElementById("cv-iframe") as HTMLIFrameElement | null;
  if (!btn || !modal || !closeBtn || !iframe) return;

  function openModal(): void {
    if (!iframe || !modal) return;
    // Carga el iframe solo la primera vez (evita recargas innecesarias)
    if (!iframe.src || iframe.src === window.location.href) {
      iframe.src = iframe.dataset.src ?? "";
    }
    modal.style.display = "block";
    modal.dataset.open = "true";
    document.body.style.overflow = "hidden"; // bloquea scroll de fondo
  }

  function closeModal(): void {
    if (!modal) return;
    modal.style.display = "none";
    delete modal.dataset.open;
    document.body.style.overflow = ""; // restaura scroll
  }

  // AbortController permite limpiar todos los listeners al navegar
  const ac = new AbortController();

  btn.addEventListener("click", openModal, { signal: ac.signal });
  closeBtn.addEventListener("click", closeModal, { signal: ac.signal });

  // Clic en el fondo oscuro del overlay → cierra
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  }, { signal: ac.signal });

  // Atajos de teclado: Escape cierra, D descarga
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "none") return;
    if (e.key === "Escape") closeModal();
    if (e.key === "d" || e.key === "D") dlBtn?.click();
  }, { signal: ac.signal });

  // Al iniciar una navegación SPA, cierra el modal y cancela los listeners
  document.addEventListener("astro:before-preparation", () => {
    closeModal();
    ac.abort();
  }, { once: true });
}

document.addEventListener("astro:page-load", initCvModal);
