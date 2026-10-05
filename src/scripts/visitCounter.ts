async function loadStats(signal: AbortSignal): Promise<void> {
  const valueEl = document.getElementById("stat-visitors");
  const meterEl = document.getElementById("visitors-meter");
  if (!valueEl || !meterEl) return;

  try {
    const res = await fetch("/api/stats", { signal });
    if (!res.ok) return;
    const { visitors } = (await res.json()) as { visitors?: number };
    if (typeof visitors !== "number") return;
    valueEl.textContent = visitors.toLocaleString();
    meterEl.classList.remove("opacity-0");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    // Umami unavailable — stays hidden
  }
}

function initVisitCounter(): void {
  const controller = new AbortController();
  void loadStats(controller.signal);

  document.addEventListener(
    "astro:before-preparation",
    () => controller.abort(),
    { once: true },
  );
}

document.addEventListener("astro:page-load", initVisitCounter);
