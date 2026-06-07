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

// Fill these in as accounts are confirmed. Any URL left as 'TODO' will be
// filtered out by <SocialRow>, <CommunityCTA>, the footer, and the JSON-LD
// `sameAs` so nothing broken ships. `blurb` is the optional one-line CTA copy
// used by <CommunityCTA>.
//
// Three orthogonal flags decide where a channel surfaces. They default to the
// most common case so existing entries (Discord, X) need none of them:
//   - `display`   (default true): render as a chip in <SocialRow> (footer +
//                 About). Set false for a channel we want in structured-data
//                 sameAs but NOT shown as a visible link yet (the org Twitch).
//   - `community` (default false): include in the home "Join the community"
//                 band. Only Discord + X belong there (its copy says "two
//                 channels"), so they opt in explicitly.
//   - `sameAs`    (default true): feed the org JSON-LD `sameAs` identity list.
// A `url: 'TODO'` entry is dormant everywhere until its URL is filled in (e.g.
// YouTube): the moment a real URL lands, the footer link + sameAs entry appear
// automatically with no other change.
export const socials: ReadonlyArray<{
  name: 'Discord' | 'X' | 'Instagram' | 'Twitch' | 'YouTube';
  url: string;
  handle?: string;
  blurb?: string;
  display?: boolean;
  community?: boolean;
  sameAs?: boolean;
}> = [
  {
    name: 'Discord',
    url: 'https://discord.gg/7X2QbvUW3z',
    // Visible label MUST match the href: the discord.gg/najdorf vanity does not
    // resolve to our server, so we show the permanent invite code instead.
    handle: 'discord.gg/7X2QbvUW3z',
    blurb: 'Hang with the squad. Match chat, watch parties, and roster updates first.',
    community: true,
  },
  {
    name: 'X',
    url: 'https://x.com/najdorfesports',
    handle: '@najdorfesports',
    blurb: 'Roster moves, match results, and OWCS Pacific posts, straight from the org.',
    community: true,
  },
  {
    // Org-owned Twitch channel. Surfaced in the footer + About "Follow along"
    // chip row (display defaults true), the home "Join the community" band
    // (community: true), and the JSON-LD sameAs identity list.
    name: 'Twitch',
    url: 'https://www.twitch.tv/najdorfesports',
    handle: 'twitch.tv/najdorfesports',
    blurb: 'Live on match days, with co-streams and scrim VODs between fixtures.',
    community: true,
  },
  {
    // Org YouTube channel for match highlights and recaps. Same surfaces as
    // Twitch: footer + About chip row, the community band, and JSON-LD sameAs.
    name: 'YouTube',
    url: 'https://www.youtube.com/@NajdorfEsportsOW',
    handle: 'youtube.com/@NajdorfEsportsOW',
    blurb: 'Match highlights, recaps, and the squad\'s best plays.',
    community: true,
  },
  // Instagram intentionally omitted (out of scope per brand guidance).
];

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
  { name: 'OWCS Pacific (TH)', url: 'https://twitch.tv/ow_esports_th', language: 'Thai',     platform: 'twitch'  },
  { name: 'OWCS Pacific',      url: 'TODO',                            language: 'English',  platform: 'twitch'  },
  { name: 'OWCS Pacific',      url: 'TODO',                            language: 'Japanese', platform: 'twitch'  },
  { name: 'Overwatch Esports', url: 'TODO',                            language: 'VOD',      platform: 'youtube' },
];

/**
 * Keep only entries with a confirmed URL, dropping the `url: 'TODO'`
 * placeholders used by `socials` and `watchChannels`. Centralizes the filter
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
  return confirmed(socials).filter((s) => s.display !== false);
}

/** Channels surfaced in the home "Join the community" band (Discord + X). */
export function communitySocials() {
  return confirmed(socials).filter((s) => s.community === true);
}

/**
 * Single source for the org JSON-LD `sameAs` identity list: every confirmed
 * channel not opted out via `sameAs: false`. Discord + X + Twitch today; the
 * YouTube URL joins automatically once its `url` is filled in. The org's
 * Liquipedia page can be appended here when one is created.
 */
export function sameAsUrls(): string[] {
  return confirmed(socials)
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
