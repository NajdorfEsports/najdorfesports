/**
 * English baseline. Other locale files mirror this shape so the type checker
 * keeps every translation in sync. Add a key here first, then add the same
 * key to zh-TW.ts and zh-CN.ts (with the TODO_zh* placeholder format).
 */
export const en = {
  nav: {
    home: 'Home',
    roster: 'Roster',
    matches: 'Matches',
    news: 'News',
    about: 'About',
  },
  footer: {
    site: 'Site',
    follow: 'Follow',
    foundedLine: (year: number, region: string) => `Founded ${year} · ${region}`,
    trademark:
      'Overwatch and the Overwatch Champions Series are trademarks of Blizzard Entertainment, Inc.',
    copyright: (year: number, name: string) => `© ${year} ${name}. All rights reserved.`,
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
    stats: (players: number, countries: number) =>
      `${players} players across ${countries} ${countries === 1 ? 'country' : 'countries'}.`,
    record: (line: string) => `${line} in Stage 1.`,
    achievement: (placement: string, event: string) => `${placement} at ${event}.`,
    tagline: 'Headed to OWCS Pacific Stage 2 on June 4.',
    matchSchedule: 'Match schedule',
    meetRoster: 'Meet the roster',
  },
  home: {
    recentResults: 'Recent results',
    recentEmpty: 'No completed matches yet. Stage 2 begins June 4.',
    allMatches: 'All matches',
    nextMatchLabel: 'Next match',
    latest: 'Latest',
    allNews: 'All news',
    read: 'Read',
  },
  roster: {
    eyebrow: 'Active roster · OWCS Pacific 2026',
    h1: 'The Lineup',
    playersLabel: 'Players',
    regionLabel: 'Region',
    intro:
      "Roster pulled from Liquipedia every six hours. Click a handle to open the player's Liquipedia page.",
    fullRoster: 'Full roster',
    attribution: 'Player data sourced from',
    attributionLicense: 'available under',
    attributionRefresh: 'Roster refreshes every 6 hours.',
  },
  about: {
    eyebrow: 'About',
    body: (year: number, region: string) =>
      `Najdorf Esports is a competitive Overwatch organization based in the ${region} region. We founded the org in ${year} and currently compete in OWCS Pacific. The Stage 2 main event runs June 4 through July 9, 2026. The name comes from the Najdorf Variation of the Sicilian Defence, an opening that wins by preparing one line deeper than the other side.`,
    previously: 'Previously competing as Rankers in OWCS Pacific.',
    contactHeading: 'Contact',
    contactNote: 'For partnerships, press, or player inquiries, email the address above.',
  },
  skipLink: 'Skip to main content',
} as const;

export type Strings = typeof en;
