import { defineCollection, z } from 'astro:content';

const about = defineCollection({
    type: 'content',
    schema: z.object({
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
            image: z.string()
        }))
    })
});

export const collections = { about, projects };