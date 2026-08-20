/*
 * Fake-SPA navigation: the site is one page with all sections; this script keeps
 * URL ↔ section in sync (scroll spy + smooth scroll + popstate) and owns the
 * nav indicator bar under the active link.
 */

// Must match --breakpoint-laptop and the laptop-scaled @variant in global.css.
const LAPTOP_MQ = "(min-width: 80rem)";
const LAPTOP_SCALED_MQ = "(min-resolution: 1.4dppx) and (min-width: 60rem)";

/* transform y no left/width: left y width son propiedades de layout y animarlas
   durante el smooth scroll repinta el viewport entero. Debe coincidir con la
   clase inicial de .nav-indicator en NavBar.astro. */
const INDICATOR_TRANSITION = "transform 0.25s ease";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readScrollOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset").trim();
  return parseInt(raw, 10) || 60;
}

/*
 * Repositions the nav indicator bar under the active nav link.
 *
 * NavBar se renderiza dos veces (header móvil + esquina de escritorio), así que
 * hay dos barras y solo una está visible en cada breakpoint: se recorren todas y
 * se salta la que mide 0 (su NavBar está oculta).
 */
function positionIndicator(instant = false): void {
  document.querySelectorAll<HTMLElement>(".nav-indicator").forEach((indicator) => {
    const container = indicator.parentElement;
    const active = container?.querySelector<HTMLElement>('.nav-link[data-active="true"]');
    if (!container || !active) return;

    const cr = container.getBoundingClientRect();
    if (cr.width === 0) return; // NavBar oculta en este breakpoint

    if (instant) indicator.style.transition = "none";

    const ar = active.getBoundingClientRect();
    // La barra mide el 100% del contenedor y se coloca con transform: el gradiente
    // escalado uniformemente se ve igual que pintado sobre el ancho final.
    indicator.style.transform =
      `translate3d(${ar.left - cr.left}px, 0, 0) scaleX(${ar.width / cr.width})`;

    if (instant) {
      requestAnimationFrame(() => {
        indicator.style.transition = INDICATOR_TRANSITION;
      });
    }
  });
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

/*
 * Posiciones de las secciones, medidas fuera del frame de scroll.
 * Leer offsetTop (o getComputedStyle) dentro del listener obliga a un layout
 * síncrono en CADA frame del scroll; con la caché el handler no toca layout.
 * Se re-mide en resize y cuando cambia el alto de cualquier sección
 * (fuentes, imágenes, los show-more de Resume).
 */
type SectionOffset = { id: string; top: number };

/** Section whose top sits above the reference point (scrollTop + scroll-offset). */
function getActiveSection(scrollTop: number, offsets: SectionOffset[], scrollOffset: number): string {
  const ref = scrollTop + scrollOffset;
  let active = offsets[0]?.id ?? "home";
  for (const s of offsets) {
    if (s.top <= ref) active = s.id;
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

  // ── Medidas cacheadas: el handler de scroll no debe tocar layout ─────────
  const sectionEls = Array.from(scrollEl.querySelectorAll<HTMLElement>("section[id]"));
  let scrollOffset = readScrollOffset();
  let offsets: SectionOffset[] = [];
  const measure = () => {
    offsets = sectionEls.map((s) => ({ id: s.id, top: s.offsetTop }));
  };
  measure();

  // Re-medir cuando cambia el alto de una sección (fuentes, imágenes, show-more).
  const ro = new ResizeObserver(measure);
  sectionEls.forEach((s) => ro.observe(s));

  window.addEventListener("resize", () => {
    setHomeHeight();
    scrollOffset = readScrollOffset();
    measure();
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
          const active = getActiveSection(scrollEl.scrollTop, offsets, scrollOffset);
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

  document.addEventListener("astro:before-preparation", () => {
    ro.disconnect();
    ac.abort();
  }, { once: true });
}

document.addEventListener("astro:page-load", initSectionNav);
