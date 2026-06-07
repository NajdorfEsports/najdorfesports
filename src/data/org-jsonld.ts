/**
 * SportsOrganization JSON-LD for the org identity node.
 *
 * `buildOrgJsonLd()` produces the canonical `@id` node emitted sitewide by
 * BaseLayout (minimal form) and, on the home + roster pages, an enriched form
 * that embeds the athlete roster and coach (`withRoster: true`). Both share the
 * same `@id` so Person / SportsEvent blocks elsewhere can reference the org.
 *
 * Everything is generated from existing site data (roster loader + the socials
 * config) so the structured data can never drift from what the site renders.
 */
import { site, sameAsUrls, type RosterEntry } from './site';
import { loadRoster } from './loaders';

export const ORG_ID = `${site.url}/#org`;

/**
 * Split a romanized "Surname Given-name" real name into schema.org name parts.
 * Liquipedia romanizes these players' Chinese/Korean names surname-first, so
 * the first token is the family name.
 */
export function splitName(real?: string): { givenName?: string; familyName?: string } {
  if (!real) return {};
  const parts = real.trim().split(/\s+/);
  if (parts.length < 2) return { givenName: parts[0] };
  return { familyName: parts[0], givenName: parts.slice(1).join(' ') };
}

/**
 * A Person node for a roster member. `withContext` adds the top-level
 * `@context` (for a standalone Person on a detail page); embedded athletes in
 * the org block omit it. `memberOf` links every Person back to the org `@id`.
 */
export function personNode(
  p: RosterEntry,
  opts: { withContext?: boolean } = {},
): Record<string, unknown> {
  const sameAs = [p.liquipediaUrl, p.twitter, p.twitch, p.bilibili].filter(
    (u): u is string => typeof u === 'string' && u.length > 0,
  );
  const names = splitName(p.realName);
  return {
    ...(opts.withContext ? { '@context': 'https://schema.org' } : {}),
    '@type': 'Person',
    name: p.handle,
    ...(names.givenName ? { givenName: names.givenName } : {}),
    ...(names.familyName ? { familyName: names.familyName } : {}),
    ...(p.country && p.country !== 'TBD' ? { nationality: p.country } : {}),
    jobTitle: p.role,
    memberOf: { '@id': ORG_ID },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

const PLAYER_ROLES = new Set(['Tank', 'DPS', 'Support', 'Flex']);

/**
 * The org node. `withRoster` adds the athlete array (players) and coach,
 * embedded as Person objects. Managers are intentionally excluded from the
 * athlete/coach fields (no schema.org slot fits them cleanly).
 */
export function buildOrgJsonLd(opts: { withRoster?: boolean } = {}): Record<string, unknown> {
  const sameAs = sameAsUrls();
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    '@id': ORG_ID,
    name: site.name,
    alternateName: site.shortName,
    url: `${site.url}/`,
    logo: `${site.url}/branding/og-default.png`,
    foundingDate: String(site.yearFounded),
    sport: 'Overwatch 2',
    areaServed: { '@type': 'Place', name: site.region },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
  if (!opts.withRoster) return base;

  const roster = loadRoster().filter((p) => p.status !== 'inactive');
  const athletes = roster.filter((p) => PLAYER_ROLES.has(p.role)).map((p) => personNode(p));
  const coaches = roster.filter((p) => p.role === 'Coach').map((p) => personNode(p));

  return {
    ...base,
    ...(athletes.length > 0 ? { athlete: athletes } : {}),
    ...(coaches.length === 1
      ? { coach: coaches[0] }
      : coaches.length > 1
        ? { coach: coaches }
        : {}),
  };
}
