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

// Fill these in as accounts are confirmed. Any URL left as 'TODO' will be
// filtered out by <SocialRow> and <CommunityCTA> so nothing broken ships.
// `blurb` is the optional one-line CTA copy used by <CommunityCTA>.
export const socials: ReadonlyArray<{
  name: 'Discord' | 'X' | 'Instagram' | 'Twitch' | 'YouTube';
  url: string;
  handle?: string;
  blurb?: string;
}> = [
  {
    name: 'Discord',
    url: 'https://discord.gg/7X2QbvUW3z',
    handle: 'discord.gg/najdorf',
    blurb: 'Hang with the squad. Match chat, watch parties, and roster updates first.',
  },
  {
    name: 'X',
    url: 'https://x.com/najdorfesports',
    handle: '@najdorfesports',
    blurb: 'Roster moves, match results, and OWCS Pacific posts, straight from the org.',
  },
  // Instagram / Twitch / YouTube intentionally omitted. The org is on
  // Discord + X for now. Add new entries here when fresh channels launch.
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

export type Role = 'Tank' | 'DPS' | 'Support' | 'Flex' | 'Coach' | 'Manager';

export type RosterStatus = 'active' | 'dnp' | 'inactive';

export interface RosterEntry {
  handle: string;
  role: Role;
  /** Additional roles for flex players (e.g., Tank + DPS). */
  altRoles?: Role[];
  /** Human-readable country name (e.g., "Hong Kong"). */
  country: string;
  /** ISO 3166-1 alpha-2 (lowercase). Drives the flag rendering. */
  countryCode?: string;
  /** Display name. Prefer the romanized Latin form over native script. */
  realName?: string;
  /** ISO date "YYYY-MM-DD". Drives the age display. */
  birthDate?: string;
  /** Local path under /roster/ or an absolute URL. Wins over hero collage. */
  photo?: string;
  /**
   * Signature heroes in priority order. When `photo` is absent, the avatar
   * renders a collage of these hero icons. Hero names use the canonical
   * Liquipedia spelling (e.g., "Soldier: 76", "Wrecking Ball").
   */
  signatureHeroes?: string[];
  twitter?: string;
  twitch?: string;
  liquipediaUrl?: string;
  status?: RosterStatus;
  /** Free-form note shown as a small badge ("DNP · Stage 1", "Sub", etc.). */
  statusNote?: string;
  /** ISO date string. */
  joinedDate?: string;
}

export interface Achievement {
  id: string;
  /** ISO date of the event (use the start date if multi-day). */
  date: string;
  /** Tournament or event name. */
  event: string;
  /** "1st", "2nd", "3rd-4th", "Top 8", etc. */
  placement: string;
  /** Optional prize money in USD. */
  prizeUsd?: number;
  /** Optional outbound link (Liquipedia tournament page). */
  url?: string;
}

export type MatchResult = 'win' | 'loss' | 'tbd';

export interface MapScore {
  map: string;
  ourScore: number;
  theirScore: number;
}

export interface MatchEntry {
  id: string;
  date: string;
  opponent: string;
  opponentLogo?: string;
  tournament: string;
  format: string;
  /** Live broadcast channel for upcoming matches (e.g., twitch.tv/foo). */
  streamUrl?: string;
  /**
   * Direct link to the saved VOD of this specific match (Twitch /videos/N,
   * YouTube watch URL, etc.). Optional. When set, past-match cards prefer
   * this over the channel link. When absent, past matches fall back to
   * the channel's /videos page so the user lands on the VOD list rather
   * than the (potentially live) channel root.
   */
  vodUrl?: string;
  /** Liquipedia tournament/bracket page that lists this match. */
  liquipediaUrl?: string;
  result: MatchResult;
  mapScores?: MapScore[];
  notes?: string;
}

export interface Sponsor {
  name: string;
  logo: string;
  url: string;
  tier?: 'primary' | 'partner' | 'community';
}

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
