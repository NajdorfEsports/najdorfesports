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

/** First resolvable hero image (for an avatar fallback), or undefined. */
export function firstHeroImage(
  names: ReadonlyArray<string> | undefined,
  map: Record<string, ImageMetadata> = heroImagesByName,
): ImageMetadata | undefined {
  return resolveHeroIcons(names, undefined, map)[0]?.image;
}
