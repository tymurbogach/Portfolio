/*
 * Live local time for the operator card (ProfilePanel).
 * Renders "14:32 GMT+2" in the timezone provided via data-tz and
 * re-renders on every minute boundary.
 */

function formatTime(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")} ${get("timeZoneName")}`;
}

function initLocalTime(): void {
  const el = document.getElementById("local-time");
  const tz = el?.dataset.tz;
  if (!el || !tz) return;

  let intervalId: ReturnType<typeof setInterval> | undefined;

  const render = () => {
    try {
      el.textContent = formatTime(tz);
    } catch {
      // Invalid timezone — leave the element empty rather than crash
      clearInterval(intervalId);
    }
  };

  render();

  // Align updates to the minute boundary, then tick every 60 s.
  const msToNextMinute = 60_000 - (Date.now() % 60_000);
  const timeoutId = setTimeout(() => {
    render();
    intervalId = setInterval(render, 60_000);
  }, msToNextMinute);

  document.addEventListener(
    "astro:before-preparation",
    () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    },
    { once: true },
  );
}

document.addEventListener("astro:page-load", initLocalTime);
