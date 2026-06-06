/**
 * Roster-related JSON-LD + meta helpers.
 *
 * The roster PAGE no longer emits a flat Person[] array: it now renders the
 * enriched SportsOrganization block (`buildOrgJsonLd({ withRoster: true })`),
 * which embeds the athletes as Person objects. Per-player DETAIL pages emit a
 * single standalone Person via `buildPlayerJsonLd`. `rosterMetaCounts` feeds
 * the roster page's meta description.
 */
import { type RosterEntry } from './site';
import { loadRoster } from './loaders';
import { personNode } from './org-jsonld';

/** Standalone Person node (with @context) for a player's detail page. */
export function buildPlayerJsonLd(player: RosterEntry): Record<string, unknown> {
  return personNode(player, { withContext: true });
}

export function rosterMetaCounts(): { headcount: number; countries: string[] } {
  const roster = loadRoster();
  const headcount = roster.filter((p) => p.status !== 'inactive').length;
  const countries = Array.from(
    new Set(roster.map((p) => p.country).filter((c): c is string => !!c && c !== 'TBD')),
  ).sort();
  return { headcount, countries };
}
