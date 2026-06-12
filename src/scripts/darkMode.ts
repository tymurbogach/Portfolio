import type { TransitionBeforeSwapEvent } from "astro:transitions/client";

function getSystemMode(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyMode(mode: "dark" | "light"): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.getElementById("icon-sun")?.classList.toggle("hidden", mode !== "dark");
  document.getElementById("icon-moon")?.classList.toggle("hidden", mode === "dark");
}

function initDarkMode(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme") as "dark" | "light" | null;
  let current: "dark" | "light" = saved ?? getSystemMode();
  applyMode(current);

  const newBtn = btn.cloneNode(true) as HTMLElement;
  btn.parentNode?.replaceChild(newBtn, btn);

  newBtn.addEventListener("click", () => {
    current = current === "dark" ? "light" : "dark";
    applyMode(current);
    localStorage.setItem("theme", current);
  });
}

document.addEventListener("astro:page-load", initDarkMode);

document.addEventListener("astro:before-swap", (e) => {
  const event = e as TransitionBeforeSwapEvent;
  const saved = localStorage.getItem("theme");
  const mode = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  event.newDocument.documentElement.classList.toggle("dark", mode === "dark");
});
