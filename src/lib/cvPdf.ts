/*
 * CV PDFs come from the public repo tymurbogach/cv, published by cv-maker.
 * The site fetches them at request time, so a CV change needs no rebuild.
 * Each PDF is revalidated with its ETag at most once per FRESH_MS. If GitHub
 * fails, the last good copy keeps being served.
 */

export type CvLang = "EN" | "ES";

const BASE_URL =
  process.env.CV_PDF_BASE_URL ??
  "https://raw.githubusercontent.com/tymurbogach/cv/main";

const FRESH_MS = 5 * 60_000;
const TIMEOUT_MS = 5000;

interface CvEntry {
  body: ArrayBuffer;
  etag: string | null;
  checkedAt: number;
}

const cache = new Map<CvLang, CvEntry>();
const inflight = new Map<CvLang, Promise<CvEntry>>();

/** Test helper: drop every cached PDF. */
export function resetCvCache(): void {
  cache.clear();
  inflight.clear();
}

function isPdf(body: ArrayBuffer): boolean {
  return new TextDecoder().decode(body.slice(0, 5)) === "%PDF-";
}

async function revalidate(lang: CvLang): Promise<CvEntry> {
  const previous = cache.get(lang);
  const res = await fetch(`${BASE_URL}/TymurBogach_CV_${lang}.pdf`, {
    headers: previous?.etag ? { "If-None-Match": previous.etag } : {},
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (res.status === 304 && previous) {
    previous.checkedAt = Date.now();
    return previous;
  }
  if (!res.ok) throw new Error(`CV upstream answered ${res.status}`);

  const body = await res.arrayBuffer();
  if (!isPdf(body)) throw new Error("CV upstream did not return a PDF");

  const entry: CvEntry = {
    body,
    etag: res.headers.get("ETag"),
    checkedAt: Date.now(),
  };
  cache.set(lang, entry);
  return entry;
}

async function getEntry(lang: CvLang): Promise<CvEntry | null> {
  const cached = cache.get(lang);
  if (cached && Date.now() - cached.checkedAt < FRESH_MS) return cached;

  let pending = inflight.get(lang);
  if (!pending) {
    pending = revalidate(lang).finally(() => inflight.delete(lang));
    inflight.set(lang, pending);
  }

  try {
    return await pending;
  } catch (error) {
    console.warn(`CV ${lang}: ${(error as Error).message}`);
    return cached ?? null;
  }
}

export async function cvPdfResponse(lang: CvLang): Promise<Response> {
  const entry = await getEntry(lang);

  if (!entry) {
    return new Response("CV temporarily unavailable", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Response(entry.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="TymurBogach_CV_${lang}.pdf"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
