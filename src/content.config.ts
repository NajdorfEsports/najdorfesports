// One zod for the whole repo: Astro 6's content layer accepts Standard
// Schema validators, so collections use the same explicit zod v4 dependency
// as src/data/schemas.ts (the old astro:content z was a bundled zod v3 and
// had to stay isolated; that wall is gone).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

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
    /**
     * Importance ("severity") of the article, expressed as the chess piece
     * drawn on in its banner: pawn (least important) .. king (an org-defining,
     * direction-changing announcement). Drives PieceBanner.astro. Defaults to
     * `pawn` so a new post never has to think about it; set it deliberately
     * for anything that matters. Keep this in sync across an article's three
     * locale files so every language shows the same piece.
     */
    piece: z.enum(['pawn', 'knight', 'bishop', 'rook', 'queen', 'king']).default('pawn'),
  }),
});

/**
 * Weekly match highlights, published as vertical (9:16) YouTube Shorts on the
 * org channel. Each entry is one highlight. The system ships DORMANT: an entry
 * can exist with an empty `videoId`, which renders a clean "coming soon" state
 * (no Google contact, no broken embed). Filling in `videoId` is the single step
 * that takes a highlight live (the click-to-load nocookie player appears).
 *
 * No invented data: ship entries with real match context and an empty videoId
 * until the Short is actually published. `poster` is optional; without it the
 * player shows a branded placeholder rather than a broken image.
 */
const highlights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/highlights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      /** Related match id from src/data/matches.json (cross-reference). */
      matchId: z.string().optional(),
      /** Opponent label for display (e.g. "Team Secret"). */
      opponent: z.string().optional(),
      /** Self-hosted 9:16 poster, a path RELATIVE to this entry's file
       *  (e.g. ../../assets/highlights/<name>.webp) so it flows through
       *  astro:assets optimization. Optional: a missing poster falls back
       *  to a branded placeholder. NEVER a YouTube thumbnail URL (that
       *  would contact Google on load). */
      poster: image().optional(),
      /** YouTube video ID only (the part after watch?v= or youtu.be/), NOT a
       *  full URL. EMPTY until the Short is published -> "coming soon" state. */
      videoId: z.string().default(''),
      /** Frame shape. Vertical Shorts are "9/16" (default); landscape match
       *  highlights are "16/9" and render as a featured player above the grid. */
      aspect: z.enum(['9/16', '16/9']).default('9/16'),
      draft: z.boolean().default(false),
    }),
});

export const collections = { news, highlights };
