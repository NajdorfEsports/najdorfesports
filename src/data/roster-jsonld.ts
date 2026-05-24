/**
 * Person JSON-LD for the roster page. Locale-independent — the same block
 * is emitted at /roster/, /zh-TW/roster/, and /zh-CN/roster/. Each Person
 * references the SportsOrganization @id emitted by BaseLayout.
 */
import {
  mergeByKey,
  site,
  type RosterEntry,
} from './site';
import rosterAutoData from './roster.json';
import rosterManualData from './roster.manual.json';

const orgId = `${site.url}/#org`;

function splitName(real?: string): { givenName?: string; familyName?: string } {
  if (!real) return {};
  const parts = real.trim().split(/\s+/);
  if (parts.length < 2) return { givenName: parts[0] };
  // Most romanizations of Chinese names appear as "Surname Given-name".
  // Liquipedia uses that order for these players, so first token is family.
  return { familyName: parts[0], givenName: parts.slice(1).join(' ') };
}

export function buildRosterJsonLd(): Array<Record<string, unknown>> {
  const roster = mergeByKey(
    rosterAutoData as RosterEntry[],
    rosterManualData as RosterEntry[],
    'handle',
  );
  return roster.map((p) => {
    const sameAs = [
      p.liquipediaUrl,
      p.twitter,
      p.twitch,
    ].filter((u): u is string => typeof u === 'string' && u.length > 0);
    const names = splitName(p.realName);
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: p.handle,
      ...(names.givenName ? { givenName: names.givenName } : {}),
      ...(names.familyName ? { familyName: names.familyName } : {}),
      ...(p.country ? { nationality: p.country } : {}),
      jobTitle: p.role,
      memberOf: { '@id': orgId },
      ...(sameAs.length > 0 ? { sameAs } : {}),
    };
  });
}

export function rosterMetaCounts(): { headcount: number; countries: string[] } {
  const roster = mergeByKey(
    rosterAutoData as RosterEntry[],
    rosterManualData as RosterEntry[],
    'handle',
  );
  const headcount = roster.filter((p) => p.status !== 'inactive').length;
  const countries = Array.from(
    new Set(roster.map((p) => p.country).filter((c): c is string => !!c && c !== 'TBD')),
  ).sort();
  return { headcount, countries };
}
