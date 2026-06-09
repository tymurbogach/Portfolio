async function loadStats() {
  const counter = document.getElementById("visit-counter");
  if (!counter) return;

  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return;
    const { pageviews, visitors } = await res.json();

    const viewsEl = document.getElementById("stat-views");
    const visitorsEl = document.getElementById("stat-visitors");
    if (viewsEl) viewsEl.textContent = pageviews.toLocaleString();
    if (visitorsEl) visitorsEl.textContent = visitors.toLocaleString();

    counter.classList.remove("opacity-0");
  } catch {
    // Umami unavailable — counter stays hidden
  }
}

loadStats();
document.addEventListener("astro:page-load", loadStats);
