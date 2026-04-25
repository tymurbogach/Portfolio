function initCvModal(): void {
  const btn = document.getElementById("cv-view-btn") as HTMLButtonElement | null;
  const modal = document.getElementById("cv-modal") as HTMLElement | null;
  const closeBtn = document.getElementById("cv-close-btn");
  const iframe = document.getElementById("cv-iframe") as HTMLIFrameElement | null;

  if (!btn || !modal || !closeBtn || !iframe) return;

  const cvUrl = btn.dataset.cvUrl ?? "/cv.pdf";

  function openModal(): void {
    iframe!.src = cvUrl;
    modal!.style.display = "block";
    modal!.dataset.open = "true";
    document.body.style.overflow = "hidden";
  }

  function closeModal(): void {
    modal!.style.display = "none";
    delete modal!.dataset.open;
    document.body.style.overflow = "";
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
  }, { signal: ac.signal });

  document.addEventListener("astro:before-preparation", () => {
    closeModal();
    ac.abort();
  }, { once: true });
}

document.addEventListener("astro:page-load", initCvModal);
