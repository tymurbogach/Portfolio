import { positionIndicator } from "./navUtils";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Sección cuyo top esté más abajo que el punto de referencia (scrollTop + 60px). */
function getActiveSection(scrollEl: HTMLElement): string {
  const sections = Array.from(
    scrollEl.querySelectorAll<HTMLElement>("section[id]")
  );
  const ref = scrollEl.scrollTop + 60;
  let active = sections[0]?.id ?? "home";
  for (const s of sections) {
    if (s.offsetTop <= ref) active = s.id;
  }
  return active;
}

/** Scroll el contenedor hasta la sección, respetando prefers-reduced-motion. */
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

/** Marca el enlace de nav correspondiente como activo y reposiciona el indicator. */
function setActiveNav(sectionId: string): void {
  const targetPath = sectionId === "home" ? "/" : `/${sectionId}`;
  document.querySelectorAll<HTMLElement>(".nav-link[data-active]").forEach((link) => {
    link.dataset.active = String(link.getAttribute("href") === targetPath);
  });
  positionIndicator();
}

function initSectionNav(): void {
  const scrollEl = document.getElementById("content-scroll") as HTMLElement | null;
  if (!scrollEl) return; // página sin DualMain scrollable, no aplica

  const ac = new AbortController();

  // ── Scroll inicial a la sección correspondiente a la URL ─────────────────
  const rawPath = window.location.pathname.replace(/\/$/, "") || "/";
  const initSection = rawPath === "/" ? "home" : rawPath.replace(/^\//, "");
  scrollToSection(scrollEl, initSection, "instant");
  setActiveNav(initSection);

  // ── Home section: fill viewport height (desktop only) ───────────────────
  const homeSection = document.getElementById("home");
  const isDesktop = () =>
    window.matchMedia("(min-width: 80rem)").matches ||
    window.matchMedia("(min-resolution: 1.4dppx) and (min-width: 60rem)").matches;
  const setHomeHeight = () => {
    if (!homeSection) return;
    homeSection.style.minHeight = isDesktop() ? `${scrollEl.clientHeight}px` : "";
  };
  setHomeHeight();
  window.addEventListener("resize", setHomeHeight, { signal: ac.signal });

  // ── Sincronización URL ↔ sección al scrollear ────────────────────────────
  let currentSection = initSection;
  let ticking = false;

  scrollEl.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const active = getActiveSection(scrollEl);
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

  // ── Intercept de clicks en la nav para scroll suave ──────────────────────
  document.querySelectorAll<HTMLAnchorElement>(".nav-link[href]").forEach((link) => {
    link.addEventListener(
      "click",
      (e) => {
        const href = link.getAttribute("href") ?? "";
        const targetId = href.replace(/^\//, "") || "home";
        if (!document.getElementById(targetId)) return; // sección ausente → nav normal

        e.preventDefault();
        currentSection = targetId;
        history.pushState(null, "", href);
        scrollToSection(scrollEl, targetId, "smooth");
        setActiveNav(targetId);
      },
      { signal: ac.signal }
    );
  });

  // ── data-scroll-target: Hero CTAs and any element that should trigger section scroll ──
  document.querySelectorAll<HTMLElement>("[data-scroll-target]").forEach((el) => {
    el.addEventListener(
      "click",
      () => {
        const targetId = el.getAttribute("data-scroll-target") ?? "";
        if (!targetId || !document.getElementById(targetId)) return;
        const href = targetId === "home" ? "/" : `/${targetId}`;
        currentSection = targetId;
        history.pushState(null, "", href);
        scrollToSection(scrollEl, targetId, "smooth");
        setActiveNav(targetId);
      },
      { signal: ac.signal }
    );
  });

  // ── Soporte popstate (botón atrás/adelante del navegador) ────────────────
  window.addEventListener(
    "popstate",
    () => {
      const path = window.location.pathname.replace(/\/$/, "") || "/";
      const sId = path === "/" ? "home" : path.replace(/^\//, "");
      if (document.getElementById(sId)) {
        currentSection = sId;
        scrollToSection(scrollEl, sId, "smooth");
        setActiveNav(sId);
      }
    },
    { signal: ac.signal }
  );

  // ── Limpieza al navegar fuera (SPA) ──────────────────────────────────────
  document.addEventListener("astro:before-preparation", () => ac.abort(), { once: true });
}

document.addEventListener("astro:page-load", initSectionNav);
