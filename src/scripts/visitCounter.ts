async function loadStats() {
  const el = document.getElementById("stat-visitors");
  if (!el) return;

  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return;
    const { visitors } = (await res.json()) as { visitors?: number };
    if (typeof visitors !== "number") return;
    el.textContent = `${visitors.toLocaleString()} visitors`;
    el.classList.remove("opacity-0");
  } catch {
    // Umami unavailable — stays hidden
  }
}

// astro:page-load also fires on the initial load, so a single listener suffices.
document.addEventListener("astro:page-load", loadStats);
