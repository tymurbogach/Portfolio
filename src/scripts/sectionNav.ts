/*
 * Fake-SPA navigation: the site is one page with all sections; this script keeps
 * URL ↔ section in sync (scroll spy + smooth scroll + popstate) and owns the
 * nav indicator bar under the active link.
 */

// Must match --breakpoint-laptop and the laptop-scaled @variant in global.css.
const LAPTOP_MQ = "(min-width: 80rem)";
const LAPTOP_SCALED_MQ = "(min-resolution: 1.4dppx) and (min-width: 60rem)";

const INDICATOR_TRANSITION = "left 0.25s ease, width 0.25s ease";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset").trim();
  return parseInt(raw, 10) || 60;
}

/** Repositions the nav indicator bar under the active nav link. */
function positionIndicator(instant = false): void {
  const indicator = document.getElementById("nav-indicator");
  if (!indicator) return;
  const container = indicator.closest("div");
  const nav = container?.querySelector("nav");
  const active = nav?.querySelector<HTMLElement>('.nav-link[data-active="true"]');
  if (!container || !nav || !active) return;

  if (instant) indicator.style.transition = "none";

  const cr = container.getBoundingClientRect();
  const ar = active.getBoundingClientRect();
  indicator.style.left  = `${ar.left - cr.left}px`;
  indicator.style.width = `${ar.width}px`;

  if (instant) {
    requestAnimationFrame(() => {
      indicator.style.transition = INDICATOR_TRANSITION;
    });
  }
}

/** Marks the nav link matching the section as active and repositions the indicator. */
function setActiveNav(sectionId: string, instant = false): void {
  const targetPath = sectionId === "home" ? "/" : `/${sectionId}`;
  document.querySelectorAll<HTMLElement>(".nav-link[data-active]").forEach((link) => {
    const href = (link.getAttribute("href") ?? "").replace(/\/$/, "") || "/";
    link.dataset.active = String(href === targetPath);
  });
  positionIndicator(instant);
}

/** Section id derived from a pathname ("/" → "home", "/about" → "about"). */
function sectionFromPath(pathname: string): string {
  const path = pathname.replace(/\/$/, "") || "/";
  return path === "/" ? "home" : path.replace(/^\//, "");
}

/** Section whose top sits above the reference point (scrollTop + scroll-offset). */
function getActiveSection(scrollEl: HTMLElement): string {
  const sections = Array.from(scrollEl.querySelectorAll<HTMLElement>("section[id]"));
  const ref = scrollEl.scrollTop + getScrollOffset();
  let active = sections[0]?.id ?? "home";
  for (const s of sections) {
    if (s.offsetTop <= ref) active = s.id;
  }
  return active;
}

/** Scrolls the container to the section, honoring prefers-reduced-motion. */
function scrollToSection(
  scrollEl: HTMLElement,
  sectionId: string,
  behavior: ScrollBehavior = "smooth"
): void {
  const section = document.getElementById(sectionId);
  if (!section) return;
  scrollEl.scrollTo({
    top: section.offsetTop,
    behavior: prefersReducedMotion() ? "instant" : behavior,
  });
}

function initSectionNav(): void {
  const initSection = sectionFromPath(window.location.pathname);
  setActiveNav(initSection, true);

  const scrollEl = document.getElementById("content-scroll");
  if (!scrollEl) return; // page without a scrollable DualMain — active link is already set

  const ac = new AbortController();

  scrollToSection(scrollEl, initSection, "instant");

  // ── Home section: fill viewport height (desktop only) ───────────────────
  const homeSection = document.getElementById("home");
  const isDesktop = () =>
    window.matchMedia(LAPTOP_MQ).matches || window.matchMedia(LAPTOP_SCALED_MQ).matches;
  const setHomeHeight = () => {
    if (!homeSection) return;
    homeSection.style.minHeight = isDesktop() ? `${scrollEl.clientHeight}px` : "";
  };
  setHomeHeight();
  window.addEventListener("resize", () => {
    setHomeHeight();
    positionIndicator(true); // keep the indicator aligned after layout shifts
  }, { signal: ac.signal });

  // ── URL ↔ section sync while scrolling ───────────────────────────────────
  let currentSection = initSection;
  let lockedTarget: string | null = null; // set during smooth scroll to prevent revert
  let ticking = false;

  scrollEl.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const active = getActiveSection(scrollEl);
          if (lockedTarget) {
            if (active === lockedTarget) lockedTarget = null; // arrived at target
            else { ticking = false; return; }                  // still scrolling, skip
          }
          if (active !== currentSection) {
            currentSection = active;
            const url = active === "home" ? "/" : `/${active}`;
            history.replaceState(null, "", url);
            setActiveNav(active);
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { signal: ac.signal }
  );

  const navigateTo = (targetId: string, href: string, push: boolean): void => {
    if (!document.getElementById(targetId)) return;
    lockedTarget = targetId;
    currentSection = targetId;
    if (push) history.pushState(null, "", href);
    else history.replaceState(null, "", href);
    scrollToSection(scrollEl, targetId, "smooth");
    setActiveNav(targetId);
  };

  // ── Intercept nav clicks for smooth in-page scroll ────────────────────────
  document.querySelectorAll<HTMLAnchorElement>(".nav-link[href]").forEach((link) => {
    link.addEventListener(
      "click",
      (e) => {
        const href = link.getAttribute("href") ?? "";
        const targetId = href.replace(/^\//, "") || "home";
        e.preventDefault();
        navigateTo(targetId, href, true);
      },
      { signal: ac.signal }
    );
  });

  // ── data-scroll-target: Hero CTAs and any element that triggers section scroll ──
  document.querySelectorAll<HTMLElement>("[data-scroll-target]").forEach((el) => {
    el.addEventListener(
      "click",
      () => {
        const targetId = el.getAttribute("data-scroll-target") ?? "";
        if (!targetId) return;
        const href = targetId === "home" ? "/" : `/${targetId}`;
        navigateTo(targetId, href, true);
      },
      { signal: ac.signal }
    );
  });

  // ── popstate (browser back/forward) ───────────────────────────────────────
  window.addEventListener(
    "popstate",
    () => {
      const sId = sectionFromPath(window.location.pathname);
      if (document.getElementById(sId)) {
        currentSection = sId;
        scrollToSection(scrollEl, sId, "smooth");
        setActiveNav(sId);
      }
    },
    { signal: ac.signal }
  );

  document.addEventListener("astro:before-preparation", () => ac.abort(), { once: true });
}

document.addEventListener("astro:page-load", initSectionNav);
