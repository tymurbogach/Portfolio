/* Astro 6 content collections — cada colección usa file() o glob() loader.
   Para datos de una sola entrada, el JSON está envuelto en {id: data}
   de forma que getEntry(collection, id) sigue funcionando igual. */

import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const techSkill = z.object({
  slug: z.string(),
  color: z.string(),
  label: z.string()
});

const about = defineCollection({
  loader: file('src/content/about/data.json'),
  schema: z.object({
    location: z.object({ label: z.string() }).optional(),
    quote: z.object({ text: z.string(), author: z.string() }).optional(),
    journey: z.array(z.object({
      year: z.string(),
      event: z.string(),
      detail: z.string(),
      active: z.boolean()
    })),
    education: z.array(z.object({
      years: z.string(),
      title: z.string(),
      sub: z.string()
    })),
    hobbies: z.array(z.object({
      icon: z.string(),
      label: z.string()
    }))
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    link: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    order: z.number().optional()
  })
});

const resume = defineCollection({
  loader: file('src/content/resume/data.json'),
  schema: z.object({
    frontend: z.array(techSkill),
    backend: z.array(techSkill),
    homelab: z.array(techSkill),
    languages: z.array(z.object({
      flag: z.string(),
      lang: z.string(),
      level: z.enum(['native', 'fluent', 'intermediate', 'basic'])
    }))
  })
});

const contact = defineCollection({
  loader: file('src/content/contact/data.json'),
  schema: z.object({
    email: z.string().email(),
    location: z.string(),
    statusStr: z.string(),
    statusActive: z.boolean(),
    cv_link: z.string(),
    cv_preview: z.string(),
    formSubject: z.string()
  })
});

const social = defineCollection({
  loader: file('src/content/social/data.json'),
  schema: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    icon: z.string()
  }))
});

const home = defineCollection({
  loader: file('src/content/home/data.json'),
  schema: z.object({
    hero: z.object({
      title1: z.string(),
      title2: z.string(),
      subtitle1: z.string(),
      subtitle2: z.string()
    }),
    stats: z.array(z.object({
      n: z.string(),
      label: z.string()
    })),
    techStrip: z.string(),
    cta: z.object({
      primary: z.string(),
      primaryHref: z.string(),
      secondary: z.string(),
      secondaryHref: z.string()
    })
  })
});

const profile = defineCollection({
  loader: file('src/content/profile/profile.json'),
  schema: z.object({
    name: z.string(),
    nameDisplay: z.string(),
    role: z.string()
  })
});

const site = defineCollection({
  loader: file('src/content/site/site.json'),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    url: z.string().url(),
    lang: z.string(),
    description: z.string(),
    ogImage: z.string(),
    pageDescriptions: z.object({
      home: z.string(),
      about: z.string(),
      resume: z.string(),
      projects: z.string(),
      contact: z.string()
    }),
    pages: z.array(z.object({
      path: z.string(),
      label: z.string(),
      icon: z.string(),
      sectionLabel: z.string()
    }))
  })
});

export const collections = { about, projects, resume, contact, social, home, site, profile };
