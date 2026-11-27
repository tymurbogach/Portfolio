import { defineMiddleware } from "astro:middleware";
import { CSP_HEADER } from "./lib/security";

/*
 * Security headers for every SSR response. Prerendered pages are served as
 * static files by the node adapter and bypass this hook; Layout.astro embeds
 * the CSP meta equivalent for them.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  // CSP only in production: the dev toolbar injects inline tooling that a
  // strict CSP would break.
  // PDFs skip the CSP: it adds nothing to a document with no scripts, and a
  // strict default-src can stop browsers from rendering the built-in viewer.
  const isPdf = response.headers.get("Content-Type") === "application/pdf";
  if (import.meta.env.PROD && !isPdf) {
    response.headers.set("Content-Security-Policy", CSP_HEADER);
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  return response;
});
