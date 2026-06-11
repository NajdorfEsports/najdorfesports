/**
 * Runtime schemas for the data layer. These are the SINGLE SOURCE OF TRUTH for
 * both the TypeScript types (via z.infer) and build-time validation. Every
 * data/*.json file is validated against these in loaders.ts / social.ts, so a
 * malformed Liquipedia fetch fails `astro build` with a precise message instead
 * of shipping a broken page or crashing at request time.
 *
 * One zod everywhere: the explicit 'zod' v4 dependency is the repo's single
 * zod source. Content collections (content.config.ts) import the same 'zod'
 * since Astro 6's content layer accepts Standard Schema validators (the old
 * v3/v4 split against astro:content's bundled zod is gone).
 *
 * This module imports ONLY 'zod', so the plain-Node fetch scripts can import it
 * directly (Node >= 22.18 strips the TS types at runtime).
 */
import { z } from 'zod';

/** Calendar date "YYYY-MM-DD" (birthDate, joinedDate, achievement.date). */
const isoDate = z
  .string()
  .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)), {
    message: 'must be an ISO calendar date "YYYY-MM-DD"',
  });

/** Full instant "YYYY-MM-DDTHH:MM[:SS[.mmm]]Z" (matches.date). Downstream code
 *  sorts on +new Date(date), so it must parse to a valid time. */
const isoInstant = z
  .string()
  .refine((s) => /^\d{4}-\d{2}-\d{2}T/.test(s) && !Number.isNaN(Date.parse(s)), {
    message: 'must be an ISO datetime, e.g. "2026-06-04T14:00:00Z"',
  });

export const RoleSchema = z.enum(['Tank', 'DPS', 'Support', 'Flex', 'Coach', 'Manager']);
export const RosterStatusSchema = z.enum(['active', 'dnp', 'inactive']);
export const MatchResultSchema = z.enum(['win', 'loss', 'tbd']);

// .strict() => a stray field from a Liquipedia layout change is a loud build
// failure, not silent drift.
export const RosterEntrySchema = z
  .object({
    handle: z.string().min(1),
    role: RoleSchema,
    altRoles: z.array(RoleSchema).optional(),
    country: z.string().min(1),
    countryCode: z
      .string()
      .regex(/^[a-z]{2}$/, 'ISO 3166-1 alpha-2, lowercase')
      .optional(),
    realName: z.string().optional(),
    birthDate: isoDate.optional(),
    photo: z.string().optional(),
    signatureHeroes: z.array(z.string().min(1)).optional(),
    twitter: z.url().optional(),
    twitch: z.url().optional(),
    bilibili: z.url().optional(),
    liquipediaUrl: z.url().optional(),
    status: RosterStatusSchema.optional(),
    statusNote: z.string().optional(),
    joinedDate: isoDate.optional(),
  })
  .strict();

export const MapScoreSchema = z
  .object({
    map: z.string().min(1),
    ourScore: z.number().int().nonnegative(),
    theirScore: z.number().int().nonnegative(),
  })
  .strict();

export const MatchEntrySchema = z
  .object({
    id: z.string().min(1),
    date: isoInstant,
    opponent: z.string().min(1),
    opponentLogo: z.string().optional(),
    tournament: z.string().min(1),
    format: z.string().min(1),
    streamUrl: z.url().optional(),
    vodUrl: z.url().optional(),
    liquipediaUrl: z.url().optional(),
    broadcastPeakViewers: z.number().int().nonnegative().optional(),
    result: MatchResultSchema,
    mapScores: z.array(MapScoreSchema).optional(),
    notes: z.string().optional(),
  })
  .strict();

export const AchievementSchema = z
  .object({
    id: z.string().min(1),
    date: isoDate,
    event: z.string().min(1),
    placement: z.string().min(1),
    prizeUsd: z.number().nonnegative().optional(),
    url: z.url().optional(),
  })
  .strict();

export const SponsorSchema = z
  .object({
    name: z.string().min(1),
    logo: z.string().min(1),
    url: z.url(),
    tier: z.enum(['primary', 'partner', 'community']).optional(),
  })
  .strict();

/** heroes.json / maps.json: { "Hero Name": "/heroes/slug.webp" }. */
export const IconMapSchema = z.record(
  z.string().min(1),
  z.string().regex(/^\/(heroes|maps)\/[a-z0-9-]+\.webp$/, 'must be /heroes|maps/<slug>.webp'),
);

export const SocialStatPlatformSchema = z.enum([
  'youtube',
  'tiktok',
  'instagram',
  'x',
  'discord',
  'twitch',
]);

export const SocialStatSchema = z
  .object({
    platform: SocialStatPlatformSchema,
    count: z.number().nullable(),
    secondary: z.record(z.string(), z.number()).optional(),
    liveViewers: z.number().nullable().optional(),
    isLive: z.boolean().optional(),
    updated: z.string().optional(),
    display: z.boolean().optional(),
  })
  .strict();

// Inferred types: Zod is the source of truth. site.ts / social.ts re-export
// these under the same names the rest of the codebase already imports.
export type Role = z.infer<typeof RoleSchema>;
export type RosterStatus = z.infer<typeof RosterStatusSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;
export type RosterEntry = z.infer<typeof RosterEntrySchema>;
export type MapScore = z.infer<typeof MapScoreSchema>;
export type MatchEntry = z.infer<typeof MatchEntrySchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Sponsor = z.infer<typeof SponsorSchema>;
export type SocialStat = z.infer<typeof SocialStatSchema>;

/** Build an actionable error from a Zod failure on a data file. */
export function formatDataError(file: string, err: z.ZodError): Error {
  const lines = err.issues.map((i) => {
    const idx = typeof i.path[0] === 'number' ? `entry [${i.path[0]}]` : 'entry';
    const field = i.path.slice(1).join('.') || '(root)';
    return `  - ${idx}, field "${field}": ${i.message} (${i.code})`;
  });
  return new Error(
    `[data] Validation failed for src/data/${file}:\n${lines.join('\n')}\n` +
      'Fix the data (or its *.manual.json override) and rebuild.',
  );
}

/**
 * Validate an auto array (full schema) plus a manual-override array (partial,
 * since manual files are partial overrides keyed by id). Throws a formatted
 * build error on failure. The caller runs mergeByKey, then re-validates the
 * merged result with `validateArray` (full schema) so a manual override cannot
 * push the merged object into an invalid state either.
 */
export function parseData<T>(
  schema: z.ZodType<T>,
  rawAuto: unknown,
  rawManual: unknown,
  label: string,
): { auto: T[]; manual: Partial<T>[] } {
  const autoArr = z.array(schema).safeParse(rawAuto);
  if (!autoArr.success) throw formatDataError(`${label}.json`, autoArr.error);
  const manualSchema = (schema as unknown as z.ZodObject).partial();
  const manualArr = z.array(manualSchema).safeParse(rawManual);
  if (!manualArr.success) throw formatDataError(`${label}.manual.json`, manualArr.error);
  return { auto: autoArr.data, manual: manualArr.data as Partial<T>[] };
}

/** Re-validate a merged array against the full schema. */
export function validateArray<T>(schema: z.ZodType<T>, data: unknown, label: string): T[] {
  const res = z.array(schema).safeParse(data);
  if (!res.success) throw formatDataError(label, res.error);
  return res.data;
}
