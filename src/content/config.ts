import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const about = defineCollection({
    type: 'data',
    schema: z.object({
        location: z.object({
            label: z.string()
        }).optional(),
        quote: z.object({
            text: z.string(),
            author: z.string()
        }).optional(),
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

const techSkill = z.object({
    slug: z.string(),
    color: z.string(),
    label: z.string()
});

const resume = defineCollection({
    type: 'data',
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
    type: 'data',
    schema: z.object({
        email: z.string().email(),
        location: z.string(),
        statusStr: z.string(),
        statusActive: z.boolean(),
        cv_link: z.string().url(),
        cv_preview: z.string().url(),
        formSubject: z.string()
    })
});

const social = defineCollection({
    type: 'data',
    schema: z.array(z.object({
        name: z.string(),
        url: z.string().url(),
        icon: z.string()
    }))
});

const home = defineCollection({
    type: 'data',
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
    type: 'data',
    schema: z.object({
        name: z.string(),
        nameDisplay: z.string(),
        role: z.string()
    })
});

const navPage = z.object({
    path: z.string(),
    label: z.string(),
    icon: z.string(),
    sectionLabel: z.string()
});

const site = defineCollection({
    type: 'data',
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
        pages: z.array(navPage)
    })
});

export const collections = { about, projects, resume, contact, social, home, site, profile };
