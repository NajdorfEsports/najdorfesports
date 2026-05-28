import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
  // Custom generateId: the glob loader's default uses `data.slug` as the entry
  // id when a `slug` field exists. Our three locale variants of an article
  // share ONE slug, so the default would collapse them to a single id and only
  // the last-read file would survive. Key off the file path instead so every
  // locale file is a distinct entry (e.g. `2026-05-origin`, `2026-05-origin.zh-TW`).
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/news',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    author: z.string().default('Najdorf Esports'),
    draft: z.boolean().default(false),
    /**
     * Localization. `slug` is the shared URL key across locales: the same
     * article in en / zh-TW / zh-CN carries the SAME slug, so the language
     * switcher and hreflang alternates line up. `locale` says which language
     * THIS file is. The English file's slug equals its old filename base, so
     * existing `/news/<slug>/` URLs and `news-<slug>.png` OG cards keep
     * working unchanged. Translations live in sibling files named
     * `<base>.zh-TW.md` / `<base>.zh-CN.md` with the same slug.
     *
     * Every article should ship all three locales. A missing translation is
     * handled soft (the switcher falls back to that locale's news index, and
     * the localized home shows fewer posts) rather than 404-ing.
     */
    slug: z.string(),
    locale: z.enum(['en', 'zh-TW', 'zh-CN']).default('en'),
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
