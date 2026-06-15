import type { ImageMetadata } from 'astro';
import { heroImagesByName } from './assetImages';

export interface ResolvedHero {
  name: string;
  image: ImageMetadata;
}

/**
 * Resolve signature-hero names to optimizable images, dropping any name
 * without a known image (no broken images, no monogram clutter). `limit`
 * caps the result (the card backdrop uses 4). `map` is injectable for
 * deterministic tests; it defaults to the committed heroes.json joined
 * with the src/assets/heroes glob. The `.filter(Boolean)` narrowing keeps
 * this clean even under noUncheckedIndexedAccess.
 */
export function resolveHeroIcons(
  names: ReadonlyArray<string> | undefined,
  limit?: number,
  map: Record<string, ImageMetadata> = heroImagesByName,
): ResolvedHero[] {
  const out = (names ?? [])
    .map((name) => ({ name, image: map[name] }))
    .filter((h): h is ResolvedHero => Boolean(h.image));
  return typeof limit === 'number' ? out.slice(0, limit) : out;
}

/**
 * Horizontal focal point (percent) for a hero's signature render, used as the
 * object-position X when a card crops that render into its strip. Most official
 * renders frame the character near horizontal center, so 50% is the default;
 * only renders whose head sits clearly off to one side need an entry. Zarya's
 * particle cannon pulls her body left and her face to ~a third in, Kiriko
 * stands to the left of her fox spirit, Hazard leans to the right, and Illari's
 * figure sits far right of her oversized gun (a centered crop lands on the gun
 * and misses her entirely). Keyed by display name to match `signatureHeroes`; a
 * new hero with no entry simply crops from center, which is right for the
 * common case.
 */
const HERO_FOCUS_X: Record<string, number> = {
  Zarya: 34,
  Kiriko: 34,
  Hazard: 56,
  Illari: 63,
};

export function heroFocusX(name: string): number {
  return HERO_FOCUS_X[name] ?? 50;
}

/** First resolvable hero image (for an avatar fallback), or undefined. */
export function firstHeroImage(
  names: ReadonlyArray<string> | undefined,
  map: Record<string, ImageMetadata> = heroImagesByName,
): ImageMetadata | undefined {
  return resolveHeroIcons(names, undefined, map)[0]?.image;
}
