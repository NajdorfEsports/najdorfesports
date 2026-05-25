import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    author: z.string().default('Najdorf Esports'),
    draft: z.boolean().default(false),
    /**
     * Optional editorial controls for the typographic cover rendered on
     * the article hero + news-index cards. `eyebrow` is the small
     * uppercase label above the title ("Brand", "Match Report", etc.);
     * `tone` flips the cover accent, primary (default), secondary, or
     * split (gradient between both).
     */
    eyebrow: z.string().optional(),
    tone: z.enum(['primary', 'secondary', 'split']).default('primary'),
  }),
});

export const collections = { news };
