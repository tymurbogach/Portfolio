/*
 * One CSP source, two delivery channels:
 * - middleware.ts sets it as a response header (SSR routes: the APIs).
 * - Layout.astro embeds it as <meta http-equiv> (prerendered pages, which
 *   the node adapter serves as static files, bypassing middleware).
 * frame-ancestors is header-only by spec, so the meta variant drops it;
 * edge protection (frame-ancestors, HSTS) belongs to the reverse proxy.
 */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline' for scripts: the anti-flash theme script (is:inline with
  // define:vars) changes on every build, so hashes are not stable.
  "script-src 'self' 'unsafe-inline' https://analytics.nastymur.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // img-src https: is broad on purpose: project cards embed README images
  // from arbitrary GitHub raw/camo hosts.
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.web3forms.com https://analytics.nastymur.com",
  "form-action 'self' https://api.web3forms.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
];

export const CSP_HEADER = CSP_DIRECTIVES.join("; ");

/** Meta CSP: frame-ancestors is ignored in <meta>, so leave it to the edge. */
export const CSP_META = CSP_DIRECTIVES.filter(
  (directive) => !directive.startsWith("frame-ancestors"),
).join("; ");
