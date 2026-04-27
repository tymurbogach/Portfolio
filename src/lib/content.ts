import { getEntry, getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

// ==========================================
// 1. TIPOS BASE
// ==========================================

export type NavPage = {
  path: string;
  label: string;
  icon: string;
  sectionLabel: string;
};

// Extendemos NavPage para la vista
export type LabeledSection = NavPage & {
  sectionId: string;
};

export type SiteData = {
  name: string;
  title: string;
  url: string;
  lang: string;
  description: string;
  ogImage: string;
  pageDescriptions: {
    home: string;
    about: string;
    resume: string;
    projects: string;
    contact: string;
  };
  pages: NavPage[]; // En teoría es un array
};

// ==========================================
// 2. TIPOS DE COLECCIONES
// ==========================================

export type ProfileData = CollectionEntry<"profile">["data"];
export type HomeData    = CollectionEntry<"home">["data"];
export type AboutData   = CollectionEntry<"about">["data"];
export type ResumeData  = CollectionEntry<"resume">["data"];
export type ContactData = CollectionEntry<"contact">["data"];
export type SocialLink  = CollectionEntry<"social">["data"][number];
export type Project     = CollectionEntry<"projects">;


// ==========================================
// 4. FETCH FUNCTIONS
// ==========================================

export async function getSite(): Promise<SiteData> {
  const entry = await getEntry("site", "site");
  if (!entry) throw new Error("Missing site data");
  return entry.data;
}

export async function getProfile(): Promise<ProfileData> {
  const entry = await getEntry("profile", "profile");
  if (!entry) throw new Error("Missing profile data");
  return entry.data;
}

export async function getHomeData(): Promise<HomeData> {
  const entry = await getEntry("home", "data");
  if (!entry) throw new Error("Missing home data");
  return entry.data;
}

export async function getAboutData(): Promise<AboutData> {
  const entry = await getEntry("about", "data");
  if (!entry) throw new Error("Missing about data");
  return entry.data;
}

export async function getResumeData(): Promise<ResumeData> {
  const entry = await getEntry("resume", "data");
  if (!entry) throw new Error("Missing resume data");
  return entry.data;
}

export async function getContactData(): Promise<ContactData> {
  const entry = await getEntry("contact", "data");
  if (!entry) throw new Error("Missing contact data");
  return entry.data;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const entry = await getEntry("social", "data");
  if (!entry) throw new Error("Missing social data");
  return entry.data as SocialLink[];
}

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection("projects");
  return entries.sort(
    (a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)
  );
}

// ==========================================
// 5. LÓGICA DE SECCIONES (Refactorizada)
// ==========================================

// 1. Helper infalible
export function getSectionId(path: any): string {
  // Forzamos a que sea string y si no existe devolvemos vacío
  const cleanPath = `${path ?? ""}`;
  return cleanPath.replace(/^\//, "");
}

// 2. Función de secciones ultra-segura
export function getLabeledSections(site: any): LabeledSection[] {
  // Si site o site.pages no existen, usamos un array vacío
  const pagesRaw = site?.pages || [];
  
  // Convertimos a array si es un objeto y aseguramos el tipo
  const pagesArray = (Array.isArray(pagesRaw) ? pagesRaw : Object.values(pagesRaw)) as NavPage[];

  return pagesArray
    .filter((page) => {
      const id = getSectionId(page?.path);
      return id !== "" && id !== "home";
    })
    .map((page) => ({
      ...page,
      sectionId: getSectionId(page.path)
    }));
}