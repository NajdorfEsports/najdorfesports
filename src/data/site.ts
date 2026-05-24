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
// filtered out by <SocialRow> so nothing broken ships.
export const socials: ReadonlyArray<{ name: string; url: string; handle?: string }> = [
  { name: 'X',         url: 'TODO', handle: '@najdorfesports' },
  { name: 'Instagram', url: 'TODO', handle: '@najdorfesports' },
  { name: 'Twitch',    url: 'TODO', handle: 'najdorfesports' },
  { name: 'YouTube',   url: 'TODO', handle: '@najdorfesports' },
  { name: 'Discord',   url: 'TODO' },
];

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
  streamUrl?: string;
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
 */
export function mergeByKey<T extends Record<string, unknown>>(
  auto: ReadonlyArray<T>,
  manual: ReadonlyArray<T>,
  idKey: keyof T,
): T[] {
  const out = new Map<unknown, T>();
  for (const a of auto) out.set(a[idKey], a);
  for (const m of manual) {
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
