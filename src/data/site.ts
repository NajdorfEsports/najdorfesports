import { channels } from './channels';

export const site = {
  name: 'Najdorf Esports',
  shortName: 'Najdorf',
  url: 'https://najdorfesports.gg',
  contactEmail: 'owner@najdorfesports.gg',
  yearFounded: 2026,
  region: 'Pacific',
  description:
    'Najdorf Esports is an Overwatch organization based in the Pacific region. Competing in OWCS Pacific.',
} as const;

export const owcs = {
  league: 'OWCS Pacific',
  stage: 'Stage 2',
  year: 2026,
  mainEventStart: '2026-06-04',
  mainEventEnd: '2026-07-09',
  badgeLine: 'OWCS Pacific Stage 2 main event runs June 4 to July 9, 2026',
} as const;

/**
 * The roster competed under the name "Rankers" during OWCS Pacific 2026
 * Stage 1, before Najdorf Esports acquired them. Stage 1 was therefore not
 * earned under this org, so every surface that shows a Stage 1 result carries
 * an "As Rankers" attribution: we showcase the players' record without
 * claiming the achievement as the org's own. (Spelling is "Rankers" with an
 * S, matching Liquipedia's OWCS Pacific 2026 Stage 1 bracket.)
 *
 * `competedAsFor` returns the former name for any Stage 1 event/tournament
 * label, or null for everything else (Stage 2 onward renders with no tag).
 * Keyed off the "Stage 1" fragment so it survives Liquipedia label drift
 * ("Stage 1", "Stage 1 Regular Season", "Stage 1 Playoffs" all match);
 * the `\b` after the digit keeps "Stage 1" from matching a future "Stage 10".
 */
export const FORMER_ROSTER_NAME = 'Rankers';

export function competedAsFor(eventOrTournament: string | undefined): string | null {
  if (!eventOrTournament) return null;
  return /\bStage 1\b/.test(eventOrTournament) ? FORMER_ROSTER_NAME : null;
}

// The social channel registry is the single source of truth in ./channels.
// The displaySocials / communitySocials / sameAsUrls helpers below derive every
// social UI surface (footer, About row, community band, JSON-LD sameAs) from it.

/**
 * Official OWCS Pacific broadcast channels. Pulls into the <WatchHub />
 * on the home page so visitors landing outside the live-hero window
 * still see "where to watch." Same TODO-filter convention as socials:
 * unconfirmed channels stay TODO and don't render. The Thai broadcast
 * is sourced from match streamUrl entries already in matches.json.
 */
export interface WatchChannel {
  name: string;
  /** Set to 'TODO' to keep the entry out of the rendered hub. */
  url: string;
  /** Language label rendered as small chrome under the name. */
  language: string;
  /** Platform. Drives icon / styling. */
  platform: 'twitch' | 'youtube' | 'other';
}

export const watchChannels: ReadonlyArray<WatchChannel> = [
  {
    name: 'OWCS Pacific (TH)',
    url: 'https://twitch.tv/ow_esports_th',
    language: 'Thai',
    platform: 'twitch',
  },
  { name: 'OWCS Pacific', url: 'TODO', language: 'English', platform: 'twitch' },
  { name: 'OWCS Pacific', url: 'TODO', language: 'Japanese', platform: 'twitch' },
  { name: 'Overwatch Esports', url: 'TODO', language: 'VOD', platform: 'youtube' },
];

/**
 * Keep only entries with a confirmed URL, dropping the `url: 'TODO'`
 * placeholders used by the social `channels` and `watchChannels`. Centralizes the filter
 * so every consumer (SocialRow, CommunityCTA, WatchHub, and the JSON-LD
 * `sameAs` in BaseLayout) hides unconfirmed channels identically.
 */
export function confirmed<T extends { url: string }>(items: ReadonlyArray<T>): T[] {
  return items.filter((item) => Boolean(item.url) && item.url !== 'TODO');
}

/**
 * Channels rendered as visible chips in <SocialRow> (footer + About). Excludes
 * any `display: false` channel (the org Twitch, sameAs-only for now).
 */
export function displaySocials() {
  return confirmed(channels).filter((s) => s.display !== false);
}

/** Channels surfaced in the home "Join the community" band (Discord + X). */
export function communitySocials() {
  return confirmed(channels).filter((s) => s.community === true);
}

/**
 * Single source for the org JSON-LD `sameAs` identity list: every confirmed
 * channel not opted out via `sameAs: false`. Discord + X + Twitch today; the
 * YouTube URL joins automatically once its `url` is filled in. The org's
 * Liquipedia page can be appended here when one is created.
 */
export function sameAsUrls(): string[] {
  return confirmed(channels)
    .filter((s) => s.sameAs !== false)
    .map((s) => s.url);
}

// Data-layer types live in ./schemas (Zod-inferred: the single source of truth
// for both runtime validation and these types). Re-exported here so existing
// `import { type RosterEntry } from '.../site'` consumers keep working.
export type {
  Role,
  RosterStatus,
  MatchResult,
  RosterEntry,
  MapScore,
  MatchEntry,
  Achievement,
  Sponsor,
} from './schemas';
// Imported for this module's own use (ROLE_ORDER, hasDetailPage).
import type { Role, RosterStatus } from './schemas';

/**
 * Merge automatic (Liquipedia) data with manual overrides keyed by `idKey`.
 * Manual entries win on collision; auto-only entries are kept; manual-only
 * entries are appended. Used for roster (key: handle), matches (key: id),
 * achievements (key: id).
 *
 * Entries missing a usable `idKey` are skipped with a warning rather than
 * silently colliding in an `undefined` bucket. The realistic trigger is a
 * Liquipedia wikitext layout change that causes the fetcher to emit an
 * entry without its id/handle; without the guard, every such entry would
 * shadow the next one and only the last would survive.
 */
export function mergeByKey<T extends object>(
  auto: ReadonlyArray<T>,
  manual: ReadonlyArray<T>,
  idKey: keyof T,
): T[] {
  const isValidKey = (v: unknown): v is string | number =>
    (typeof v === 'string' && v.trim() !== '') || typeof v === 'number';
  const out = new Map<unknown, T>();
  for (const a of auto) {
    if (!isValidKey(a[idKey])) {
      console.warn(`[mergeByKey] auto entry missing "${String(idKey)}", skipping:`, a);
      continue;
    }
    out.set(a[idKey], a);
  }
  for (const m of manual) {
    if (!isValidKey(m[idKey])) {
      console.warn(`[mergeByKey] manual entry missing "${String(idKey)}", skipping:`, m);
      continue;
    }
    const existing = out.get(m[idKey]);
    out.set(m[idKey], existing ? { ...existing, ...m } : m);
  }
  return Array.from(out.values());
}

export const ROLE_ORDER: Record<Role, number> = {
  Tank: 0,
  DPS: 1,
  Support: 2,
  Flex: 3,
  Coach: 4,
  Manager: 5,
};

/**
 * URL slug for a player's detail page: lowercase, alphanumerics only. Mirrors
 * the normalization in `portraitPath` so a handle maps to one stable slug
 * everywhere. "Skel3d1rge" -> "skel3d1rge", "TiAmo" -> "tiamo".
 */
export function playerSlug(handle: string): string {
  return handle.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Whether a roster member gets an individual detail page. Players (Tank / DPS /
 * Support / Flex) and the coach do; managers do not (Phase 1 decision). Inactive
 * members are excluded so a benched/departed player has no orphan page.
 */
export function hasDetailPage(entry: { role: Role; status?: RosterStatus }): boolean {
  return entry.status !== 'inactive' && entry.role !== 'Manager';
}
