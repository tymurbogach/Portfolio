import { getEntry, getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

// ═══════════════════════════════════════════════════════
// TIPOS — derivados de los schemas Zod en content.config.ts
// ═══════════════════════════════════════════════════════
export type SiteData    = CollectionEntry<"site">["data"];
export type ProfileData = CollectionEntry<"profile">["data"];
export type HomeData    = CollectionEntry<"home">["data"];
export type AboutData   = CollectionEntry<"about">["data"];
export type ResumeData  = CollectionEntry<"resume">["data"];
export type ContactData = CollectionEntry<"contact">["data"];
export type SocialLink  = CollectionEntry<"social">["data"][number];
export type Project     = CollectionEntry<"projects">;

// HeroData derivado de HomeData (no colección propia)
export type HeroData = HomeData["hero"];

// NavPage derivado de SiteData
export type NavPage = SiteData["pages"][number];

// NavPage enriquecida con sectionId calculado
export type LabeledSection = NavPage & { sectionId: string };

// ═══════════════════════════════════════════════════════
// HELPER INTERNO
// ═══════════════════════════════════════════════════════
async function fetchEntry<T>(collection: string, id: string): Promise<T> {
  const entry = await getEntry(collection as any, id);
  if (!entry) throw new Error(`[content] Missing entry: ${collection}/${id}`);
  return entry.data as T;
}

// ═══════════════════════════════════════════════════════
// FETCH FUNCTIONS
// ═══════════════════════════════════════════════════════
export const getSite       = () => fetchEntry<SiteData>   ("site",    "site");
export const getProfile    = () => fetchEntry<ProfileData>("profile", "profile");
export const getHomeData   = () => fetchEntry<HomeData>   ("home",    "data");
export const getAboutData  = () => fetchEntry<AboutData>  ("about",   "data");
export const getResumeData = () => fetchEntry<ResumeData> ("resume",  "data");
export const getContactData= () => fetchEntry<ContactData>("contact", "data");

// HeroData derivado de home — sin colección separada
export const getHeroData = async (): Promise<HeroData> =>
  (await getHomeData()).hero;

export async function getSocialLinks(): Promise<SocialLink[]> {
  return fetchEntry<SocialLink[]>("social", "data");
}

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection("projects");
  return entries.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

// ═══════════════════════════════════════════════════════
// HELPERS DE SECCIONES
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
