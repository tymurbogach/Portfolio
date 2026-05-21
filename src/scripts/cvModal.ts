function initCvModal(): void {
  const triggers = document.querySelectorAll<HTMLButtonElement>("[data-cv-trigger]");
  const modal    = document.getElementById("cv-modal") as HTMLElement | null;
  const closeBtn = document.getElementById("cv-close-btn");
  const dlBtn    = document.getElementById("cv-download-btn") as HTMLAnchorElement | null;
  const iframe   = document.getElementById("cv-iframe") as HTMLIFrameElement | null;

  if (!triggers.length || !modal || !closeBtn || !iframe) return;

  function openModal(url: string, filename: string): void {
    iframe!.src = url;
    if (dlBtn) { dlBtn.href = url; dlBtn.download = filename; }
    modal!.style.display = "block";
    modal!.dataset.open  = "true";
    document.body.style.overflow = "hidden";
  }

  function closeModal(): void {
    modal!.style.display = "none";
    delete modal!.dataset.open;
    iframe!.src = "";
    document.body.style.overflow = "";
  }

  const ac = new AbortController();

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const url      = btn.dataset.cvUrl      ?? "/cv.pdf";
      const filename = btn.dataset.cvFilename ?? "Tymur_Bogach_CV.pdf";
      openModal(url, filename);
    }, { signal: ac.signal });
  });

  closeBtn.addEventListener("click", closeModal, { signal: ac.signal });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  }, { signal: ac.signal });

  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "none") return;
    if (e.key === "Escape") closeModal();
  }, { signal: ac.signal });

  document.addEventListener("astro:before-preparation", () => {
    closeModal();
    ac.abort();
  }, { once: true });
}

document.addEventListener("astro:page-load", initCvModal);
