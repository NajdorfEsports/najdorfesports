export const site = {
  name: 'Najdorf Esports',
  shortName: 'Najdorf',
  url: 'https://najdorfesports.gg',
  contactEmail: 'owner@najdorfesports.gg',
  yearFounded: 2026,
  region: 'Pacific',
  description:
    'Najdorf Esports is a competitive Overwatch organization headquartered in the Pacific region, competing in OWCS Pacific.',
} as const;

export const owcs = {
  league: 'OWCS Pacific',
  stage: 'Stage 2',
  year: 2026,
  mainEventStart: '2026-06-04',
  mainEventEnd: '2026-07-09',
  badgeLine: 'Competing in OWCS Pacific Stage 2 — June 4 – July 9, 2026',
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

export interface RosterEntry {
  handle: string;
  role: Role;
  country: string;
  realName?: string;
  photo?: string;
  twitter?: string;
  twitch?: string;
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
