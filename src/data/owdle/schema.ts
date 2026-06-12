/**
 * Runtime schemas for the OWdle hero dataset, mirroring the crossword's
 * schema.ts pattern: one zod (the explicit v4 dep), strict objects, loud
 * failures. The fetch script validates before writing heroes.json and
 * heroes.test.ts re-validates the committed file, so a bad fetch or a
 * hand-edit typo fails CI instead of shipping a broken game.
 *
 * Imports ONLY 'zod' (plus the local types), so the plain-Node fetcher
 * can import it directly (Node >= 22.18 strips TS types at runtime).
 */
import { z } from 'zod';

export const HeroRoleSchema = z.enum(['tank', 'damage', 'support']);

export const HeroSubRoleSchema = z.enum([
  'bruiser',
  'flanker',
  'initiator',
  'medic',
  'recon',
  'sharpshooter',
  'specialist',
  'stalwart',
  'survivor',
  'tactician',
]);

export const HeroGenderSchema = z.enum(['female', 'male', 'non-binary', 'none']);

export const HeroAttackTypeSchema = z.enum(['hitscan', 'projectile', 'beam', 'melee']);

export const HeroRegionTagSchema = z.enum([
  'africa',
  'asia',
  'europe',
  'middle-east',
  'north-america',
  'south-america',
  'oceania',
  'space',
]);

const isoDate = z
  .string()
  .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)), {
    message: 'must be an ISO calendar date "YYYY-MM-DD"',
  });

export const OwdleHeroSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'id must be a lowercase slug'),
    name: z.string().min(2),
    aliases: z.array(z.string().regex(/^[a-z0-9 .:-]+$/, 'aliases are plain lowercase')),
    role: HeroRoleSchema,
    subRole: HeroSubRoleSchema,
    gender: HeroGenderSchema,
    nationality: z.string().min(2),
    regionTags: z.array(HeroRegionTagSchema).min(1),
    baseHp: z.number().int().min(100).max(1200),
    attackType: z.array(HeroAttackTypeSchema).min(1),
    releaseYear: z.number().int().min(2016).max(2100),
    releaseDate: isoDate.optional(),
    needsVerification: z.boolean(),
    sourceNote: z.string().min(1),
    source: z
      .object({
        overfastKey: z.string().optional(),
        overfastLocation: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export const OwdleHeroesSchema = z
  .array(OwdleHeroSchema)
  .min(40)
  .refine((heroes) => new Set(heroes.map((h) => h.id)).size === heroes.length, {
    message: 'duplicate hero id',
  });

/** Curated overlay entries: per-hero hand-maintained facts. Heroes absent
 *  from OverFast (announced, not yet released) carry the base fields too. */
export const CuratedHeroSchema = z
  .object({
    gender: HeroGenderSchema,
    nationality: z.string().min(2),
    regionTags: z.array(HeroRegionTagSchema).min(1),
    attackType: z.array(HeroAttackTypeSchema).min(1),
    releaseYear: z.number().int().min(2016).max(2100),
    releaseDate: isoDate.optional(),
    aliases: z.array(z.string()),
    needsVerification: z.boolean(),
    sourceNote: z.string().min(1),
    name: z.string().optional(),
    role: HeroRoleSchema.optional(),
    subRole: HeroSubRoleSchema.optional(),
    baseHp: z.number().int().optional(),
  })
  .strict();

export const CuratedOverlaySchema = z.record(z.string(), CuratedHeroSchema);
