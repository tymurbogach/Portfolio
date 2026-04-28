import { getEntry, getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

// ==========================================
// TIPOS DERIVADOS DE LOS SCHEMAS ZOD
// Siempre sincronizados con content.config.ts
// ==========================================
export type SiteData    = CollectionEntry<"site">["data"];
export type ProfileData = CollectionEntry<"profile">["data"];
export type HomeData    = CollectionEntry<"home">["data"];
export type AboutData   = CollectionEntry<"about">["data"];
export type ResumeData  = CollectionEntry<"resume">["data"];
export type ContactData = CollectionEntry<"contact">["data"];
export type SocialLink  = CollectionEntry<"social">["data"][number];
export type Project     = CollectionEntry<"projects">;

// Tipo derivado de SiteData — no duplicar la definición
export type NavPage = SiteData["pages"][number];

// NavPage enriquecida con sectionId calculado
export type LabeledSection = NavPage & { sectionId: string };

// ==========================================
// HELPER INTERNO
// Centraliza el fetch y el manejo de errores
// ==========================================
async function fetchEntry<T>(collection: string, id: string): Promise<T> {
  const entry = await getEntry(collection as any, id);
  if (!entry) throw new Error(`[content] Missing entry: ${collection}/${id}`);
  return entry.data as T;
}

// ==========================================
// FETCH FUNCTIONS
// Cada función es un wrapper tipado de fetchEntry
// ==========================================

// id = key del objeto en site.json → "site"
export const getSite        = () => fetchEntry<SiteData>   ("site",    "site");

// id = key del objeto en profile.json → "profile"
export const getProfile     = () => fetchEntry<ProfileData>("profile", "profile");

// id = key del objeto en cada data.json → "data"
export const getHomeData    = () => fetchEntry<HomeData>   ("home",    "data");
export const getAboutData   = () => fetchEntry<AboutData>  ("about",   "data");
export const getResumeData  = () => fetchEntry<ResumeData> ("resume",  "data");
export const getContactData = () => fetchEntry<ContactData>("contact", "data");

// social/data.json → el valor de "data" ES el array directamente
export async function getSocialLinks(): Promise<SocialLink[]> {
  return fetchEntry<SocialLink[]>("social", "data");
}

// projects usa getCollection porque son múltiples entradas via glob
export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection("projects");
  return entries.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

// ==========================================
// HELPERS DE SECCIONES
// ==========================================

// Extrae el id limpio de un path: "/about" → "about"
export function getSectionId(path: string): string {
  return path.replace(/^\//, "");
}

// Filtra home y construye LabeledSection[] desde site.pages
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