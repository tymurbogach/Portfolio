import { defineCollection, z } from 'astro:content';

const about = defineCollection({
    type: 'content',
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
    type: 'content',
    schema: z.object({
        projects: z.array(z.object({
            title: z.string(),
            description: z.string(),
            link: z.string().optional(),
            image: z.string(),
            tags: z.array(z.string()).optional()
        }))
    })
});

const site = defineCollection({
    type: 'data',
    schema: z.any() // We will let the schema be loose or define specific shapes via z.any() for simplicity, or we can use z.union of different schemas. Using z.any() to hold the generic site configs.
});

export const collections = { about, projects, site };