async function loadStats() {
  const el = document.getElementById("stat-visitors");
  if (!el) return;

  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return;
    const { visitors } = await res.json();
    el.textContent = `${visitors.toLocaleString()} visitors`;
    el.classList.remove("opacity-0");
  } catch {
    // Umami unavailable — stays hidden
  }
}

loadStats();
document.addEventListener("astro:page-load", loadStats);
