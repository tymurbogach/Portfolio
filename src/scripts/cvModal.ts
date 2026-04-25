function initCvModal(): void {
  const btn = document.getElementById("cv-view-btn");
  const modal = document.getElementById("cv-modal") as HTMLElement | null;
  const closeBtn = document.getElementById("cv-close-btn");
  const dlBtn = document.getElementById("cv-download-btn") as HTMLAnchorElement | null;
  const iframe = document.getElementById("cv-iframe") as HTMLIFrameElement | null;

  if (!btn || !modal || !closeBtn || !iframe) return;

  const PDF_URL = "/cv.pdf"; // 🔥 TU NUEVO ENDPOINT

  function openModal(): void {
    if (!iframe || !modal) return;

    // 🔥 Carga SIEMPRE tu PDF dinámico
    iframe.src = PDF_URL;

    modal.style.display = "block";
    modal.dataset.open = "true";
    document.body.style.overflow = "hidden";
  }

  function closeModal(): void {
    if (!modal) return;

    modal.style.display = "none";
    delete modal.dataset.open;
    document.body.style.overflow = "";
  }

  // 🔥 Botón descargar
  if (dlBtn) {
    dlBtn.href = PDF_URL;
    dlBtn.setAttribute("download", "CV_Tymur_Bogach.pdf");
  }

  const ac = new AbortController();

  btn.addEventListener("click", openModal, { signal: ac.signal });
  closeBtn.addEventListener("click", closeModal, { signal: ac.signal });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  }, { signal: ac.signal });

  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "none") return;

    if (e.key === "Escape") closeModal();
    if (e.key.toLowerCase() === "d") dlBtn?.click();
  }, { signal: ac.signal });

  document.addEventListener("astro:before-preparation", () => {
    closeModal();
    ac.abort();
  }, { once: true });
}

document.addEventListener("astro:page-load", initCvModal);