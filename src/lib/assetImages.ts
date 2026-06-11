import type { ImageMetadata } from 'astro';
import heroSlugs from '../data/heroes.json';
import mapSlugs from '../data/maps.json';

/**
 * Dynamic astro:assets lookups for images that are referenced by NAME from
 * data (signatureHeroes[], mapScores[].map, coach backdrops). The committed
 * name-to-slug JSON maps come from the Liquipedia fetchers; the globs pick
 * up whatever files exist under src/assets at build time, so a fetcher run
 * that adds a new image needs zero code changes (restart `astro dev`
 * locally; CI builds always see fresh files).
 *
 * Everything here is fail-soft: a JSON entry whose file vanished (or a
 * file with no JSON entry) resolves to undefined and the caller renders
 * its existing no-image fallback, exactly like the old public/ paths.
 *
 * Glob patterns must stay literal strings (a Vite requirement); never
 * interpolate a slug into the pattern.
 */
const heroGlob = import.meta.glob<{ default: ImageMetadata }>('/src/assets/heroes/*.webp', {
  eager: true,
});
const mapGlob = import.meta.glob<{ default: ImageMetadata }>('/src/assets/maps/*.webp', {
  eager: true,
});

/** '/src/assets/maps/kings-row.webp' -> 'kings-row'. Exported for tests. */
export function slugFromPath(path: string): string {
  return path.replace(/^.*\/([^/]+)\.\w+$/, '$1');
}

function indexBySlug(
  glob: Record<string, { default: ImageMetadata }>,
): Record<string, ImageMetadata> {
  return Object.fromEntries(Object.entries(glob).map(([p, m]) => [slugFromPath(p), m.default]));
}

/** slug -> optimizable image, straight from the filesystem glob. */
export const heroImagesBySlug: Record<string, ImageMetadata> = indexBySlug(heroGlob);
export const mapImagesBySlug: Record<string, ImageMetadata> = indexBySlug(mapGlob);

/**
 * Display name -> image via a name-to-slug map and a slug-to-image record.
 * Both injectable for tests; the exported convenience records below bind
 * the committed JSONs to the globs.
 */
export function imageForName(
  name: string | undefined,
  nameToSlug: Record<string, string>,
  bySlug: Record<string, ImageMetadata>,
): ImageMetadata | undefined {
  if (!name) return undefined;
  const slug = nameToSlug[name];
  return slug ? bySlug[slug] : undefined;
}

function joinByName(
  nameToSlug: Record<string, string>,
  bySlug: Record<string, ImageMetadata>,
): Record<string, ImageMetadata> {
  const out: Record<string, ImageMetadata> = {};
  for (const [name, slug] of Object.entries(nameToSlug)) {
    const image = bySlug[slug];
    if (image) out[name] = image;
  }
  return out;
}

/** Canonical display name -> image (drops entries whose file is missing). */
export const heroImagesByName: Record<string, ImageMetadata> = joinByName(
  heroSlugs as Record<string, string>,
  heroImagesBySlug,
);
export const mapImagesByName: Record<string, ImageMetadata> = joinByName(
  mapSlugs as Record<string, string>,
  mapImagesBySlug,
);
