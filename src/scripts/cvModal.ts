function initCvModal() {
  const modal    = document.getElementById("cv-modal") as HTMLElement | null;
  const backdrop = document.getElementById("cv-modal-backdrop") as HTMLElement | null;
  const panel    = document.getElementById("cv-modal-panel") as HTMLElement | null;
  const iframe   = document.getElementById("cv-modal-iframe") as HTMLIFrameElement | null;
  const closeBtn = document.getElementById("cv-modal-close") as HTMLButtonElement | null;
  const dlLink   = document.getElementById("cv-modal-download") as HTMLAnchorElement | null;

  if (!modal || !backdrop || !panel || !iframe || !closeBtn) return;

  const ac = new AbortController();
  const { signal } = ac;

  function open(src: string) {
    if (!iframe!.src || !iframe!.src.endsWith(src)) {
      iframe!.src = src;
      if (dlLink) dlLink.href = src;
    }
    modal!.style.pointerEvents = "auto";
    modal!.dataset.open = "true";
    backdrop!.style.opacity = "1";
    panel!.style.transform = "scale(1)";
    panel!.style.opacity   = "1";
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal!.dataset.open = "false";
    backdrop!.style.opacity = "0";
    panel!.style.transform = "scale(0.95)";
    panel!.style.opacity   = "0";
    document.body.style.overflow = "";
    setTimeout(() => {
      if (modal!.dataset.open === "false") {
        modal!.style.pointerEvents = "none";
      }
    }, 300);
  }

  document.querySelectorAll<HTMLElement>(".cv-modal-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      const src = trigger.dataset.src ?? "";
      if (src) open(src);
    }, { signal });
  });

  closeBtn.addEventListener("click", close, { signal });

  backdrop.addEventListener("click", close, { signal });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal!.dataset.open === "true") close();
  }, { signal });

  document.addEventListener("astro:before-preparation", () => {
    ac.abort();
    close();
  }, { once: true });
}

initCvModal();
document.addEventListener("astro:page-load", initCvModal);
