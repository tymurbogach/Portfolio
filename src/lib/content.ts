import { getEntry, getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

// ═══════════════════════════════════════════════════════
// TYPES — derived from the Zod schemas in content.config.ts
// ═══════════════════════════════════════════════════════
export type SiteData    = CollectionEntry<"site">["data"];
export type ProfileData = CollectionEntry<"profile">["data"];
export type HomeData    = CollectionEntry<"home">["data"];
export type AboutData   = CollectionEntry<"about">["data"];
export type ResumeData  = CollectionEntry<"resume">["data"];
export type ContactData = CollectionEntry<"contact">["data"];
export type SocialLink  = CollectionEntry<"social">["data"][number];
export type Project     = CollectionEntry<"projects">;

// HeroData derived from HomeData (no collection of its own)
export type HeroData = HomeData["hero"];

// NavPage derived from SiteData
export type NavPage = SiteData["pages"][number];

// NavPage enriched with computed sectionId
export type LabeledSection = NavPage & { sectionId: string };

// ═══════════════════════════════════════════════════════
// INTERNAL HELPER
// ═══════════════════════════════════════════════════════
// Single-entry collections (file() loader) — the return type is
// inferred from the schema, no casts.
type SingletonCollection = "site" | "profile" | "home" | "about" | "resume" | "contact" | "social";

async function fetchEntry<C extends SingletonCollection>(
  collection: C,
  id: string,
): Promise<CollectionEntry<C>["data"]> {
  const entry = await getEntry(collection, id);
  if (!entry) throw new Error(`[content] Missing entry: ${collection}/${id}`);
  return entry.data;
}

// ═══════════════════════════════════════════════════════
// FETCH FUNCTIONS
// ═══════════════════════════════════════════════════════
export const getSite        = () => fetchEntry("site",    "site");
export const getProfile     = () => fetchEntry("profile", "profile");
export const getHomeData    = () => fetchEntry("home",    "data");
export const getAboutData   = () => fetchEntry("about",   "data");
export const getResumeData  = () => fetchEntry("resume",  "data");
export const getContactData = () => fetchEntry("contact", "data");

// HeroData derived from home — no separate collection
export const getHeroData = async (): Promise<HeroData> =>
  (await getHomeData()).hero;

export const getSocialLinks = (): Promise<SocialLink[]> => fetchEntry("social", "data");

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection("projects");
  return entries.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

// ═══════════════════════════════════════════════════════
// SECTION HELPERS
// ═══════════════════════════════════════════════════════
export function getSectionId(path: string): string {
  return path.replace(/^\//, "");
}

export function getLabeledSections(site: SiteData): LabeledSection[] {
  return site.pages
    .filter((page) => {
      const id = getSectionId(page.path);
      return id !== "" && id !== "home";
    })
    .map((page) => ({
      ...page,
      sectionId: getSectionId(page.path),
    }));
}
