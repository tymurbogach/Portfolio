import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

// ═══════════════════════════════════════════════════════
// REUSABLE SCHEMAS
// ═══════════════════════════════════════════════════════
const techSkill = z.object({
  slug:  z.string(),
  color: z.string(),
  label: z.string(),
});

const navPage = z.object({
  path:         z.string(),
  label:        z.string(),
  icon:         z.string(),
  sectionLabel: z.string(),
});

const cta = z.object({
  primary:       z.string(),
  primaryHref:   z.string(),
  secondary:     z.string(),
  secondaryHref: z.string(),
});

// ═══════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════

// getEntry("site", "site")
const site = defineCollection({
  loader: file('src/content/site/site.json'),
  schema: z.object({
    name:        z.string(),
    url:         z.url(),
    lang:        z.string(),
    description: z.string(),
    pageDescriptions: z.object({
      home:     z.string(),
      about:    z.string(),
      resume:   z.string(),
      projects: z.string(),
      contact:  z.string(),
    }),
    pages:   z.array(navPage),
  }),
});

// getEntry("profile", "profile")
const profile = defineCollection({
  loader: file('src/content/profile/profile.json'),
  schema: z.object({
    nameDisplay: z.string(),
    role:        z.string(),
    focus:       z.string(),
    timezone:    z.string(),
  }),
});

// getEntry("home", "data")
// Contains hero (title, subtitle, CTAs)
const home = defineCollection({
  loader: file('src/content/home/data.json'),
  schema: z.object({
    hero: z.object({
      title1:    z.string(),
      title2:    z.string(),
      subtitle1: z.string(),
      subtitle2: z.string(),
      comment:   z.string(),
      cta,
    }),
  }),
});

// getEntry("about", "data")
const about = defineCollection({
  loader: file('src/content/about/data.json'),
  schema: z.object({
    journey:  z.array(z.object({
      year:   z.string(),
      event:  z.string(),
      detail: z.string(),
      active: z.boolean(),
    })),
    education: z.array(z.object({
      years: z.string(),
      title: z.string(),
      sub:   z.string(),
    })),
    hobbies: z.array(z.object({
      icon:   z.string(),
      label:  z.string(),
      detail: z.string().optional(),
    })),
  }),
});

// getEntry("resume", "data")
const resume = defineCollection({
  loader: file('src/content/resume/data.json'),
  schema: z.object({
    frontend:     z.array(techSkill),
    backend:      z.array(techSkill),
    homelab:      z.array(techSkill),
    ai:           z.array(techSkill).optional(),
    languages:    z.array(z.object({
      flag:  z.string(),
      lang:  z.string(),
      level: z.enum(['native', 'fluent', 'intermediate', 'basic']),
    })),
  }),
});

// getEntry("contact", "data")
const contact = defineCollection({
  loader: file('src/content/contact/data.json'),
  schema: z.object({
    intro:        z.string().optional(),
    email:        z.email(),
    location:     z.string(),
    statusStr:    z.string(),
    statusActive: z.boolean(),
    cv_url:       z.string(),
    cv_url_es:    z.string(),
    formSubject:  z.string(),
    // Web3Forms access key — public by design (it ships in the HTML anyway)
    web3formsKey: z.string(),
  }),
});

// getEntry("social", "data") → the value IS the array itself
const social = defineCollection({
  loader: file('src/content/social/data.json'),
  schema: z.array(z.object({
    name: z.string(),
    url:  z.url(),
    icon: z.string(),
  })),
});

// getCollection("projects") → multiple entries via glob
// image: local file (optimized at build via astro:assets) or remote URL (as-is)
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title:       z.string(),
    description: z.string(),
    image:       image().or(z.url()).optional(),
    link:        z.url().optional(),
    type:        z.enum(["demo", "source"]).optional(),
    tags:        z.array(z.string()).optional(),
    /** Contexto de la ficha: "2025" y "full stack" → "2025 · full stack" */
    year:        z.string().optional(),
    role:        z.string().optional(),
    order:       z.number().optional(),
  }),
});

export const collections = {
  site, profile, home, about, resume, contact, social, projects,
};
