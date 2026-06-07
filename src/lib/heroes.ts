import heroIcons from '../data/heroes.json';

const defaultHeroMap = heroIcons as Record<string, string>;

export interface ResolvedHero {
  name: string;
  iconUrl: string;
}

/**
 * Resolve signature-hero names to icon URLs, dropping any name without a known
 * icon (no broken images, no monogram clutter). `limit` caps the result (the
 * card backdrop uses 4). `map` is injectable for deterministic tests; it
 * defaults to the committed heroes.json. The `.filter(Boolean)` narrowing keeps
 * this clean even under noUncheckedIndexedAccess.
 */
export function resolveHeroIcons(
  names: ReadonlyArray<string> | undefined,
  limit?: number,
  map: Record<string, string> = defaultHeroMap,
): ResolvedHero[] {
  const out = (names ?? [])
    .map((name) => ({ name, iconUrl: map[name] }))
    .filter((h): h is ResolvedHero => Boolean(h.iconUrl));
  return typeof limit === 'number' ? out.slice(0, limit) : out;
}

/** First resolvable hero icon URL (for an avatar fallback), or undefined. */
export function firstHeroIcon(
  names: ReadonlyArray<string> | undefined,
  map: Record<string, string> = defaultHeroMap,
): string | undefined {
  return resolveHeroIcons(names, undefined, map)[0]?.iconUrl;
}
