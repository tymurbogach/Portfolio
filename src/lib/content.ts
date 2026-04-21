import { getEntry, getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type SiteData = CollectionEntry<'site'>['data'];
export type ProfileData = CollectionEntry<'profile'>['data'];
export type HomeData = CollectionEntry<'home'>['data'];
export type AboutData = CollectionEntry<'about'>['data'];
export type ResumeData = CollectionEntry<'resume'>['data'];
export type ContactData = CollectionEntry<'contact'>['data'];
export type SocialLink = CollectionEntry<'social'>['data'][number];
export type Project = CollectionEntry<'projects'>;


export async function getSite(): Promise<SiteData> { return (await getEntry('site', 'site'))!.data; }
export async function getProfile(): Promise<ProfileData> { return (await getEntry('profile', 'profile'))!.data; }
export async function getHomeData(): Promise<HomeData> { return (await getEntry('home', 'data'))!.data; }
export async function getAboutData(): Promise<AboutData> { return (await getEntry('about', 'data'))!.data; }
export async function getResumeData(): Promise<ResumeData> { return (await getEntry('resume', 'data'))!.data; }
export async function getContactData(): Promise<ContactData> { return (await getEntry('contact', 'data'))!.data; }
export async function getSocialLinks(): Promise<SocialLink[]> { return (await getEntry('social', 'data'))!.data; }

export async function getProjects(): Promise<Project[]> {
    const entries = await getCollection('projects');
    return entries.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

