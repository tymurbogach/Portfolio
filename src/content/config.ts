import { defineCollection, z } from 'astro:content';

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
    type: 'data',
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

const resume = defineCollection({ type: 'data', schema: z.any() });
const contact = defineCollection({ type: 'data', schema: z.any() });
const social = defineCollection({ type: 'data', schema: z.any() });
const home = defineCollection({ type: 'data', schema: z.any() });

export const collections = { about, projects, resume, contact, social, home };