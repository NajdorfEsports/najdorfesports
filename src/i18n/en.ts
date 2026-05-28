/**
 * English baseline. Other locale files mirror this shape so the type checker
 * keeps every translation in sync. Add a key here first, then add the same
 * key to zh-TW.ts and zh-CN.ts.
 */
import type { Role } from '../data/site';

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
    /** Minimal data credit required by Liquipedia's CC BY-SA 3.0 license. */
    dataCredit: 'Data: Liquipedia · CC BY-SA 3.0',
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
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

  /** News index + article chrome. Article bodies are per-locale markdown
   *  in src/content/news; these are the surrounding labels. */
  news: {
    eyebrow: 'News',
    heading: 'From the team',
    backToAll: 'All news',
    metaDescription: 'Announcements, brand updates, and match reports from Najdorf Esports.',
  },
  roster: {
    eyebrow: 'Active roster · OWCS Pacific 2026',
    h1: 'The Lineup',
    playersLabel: 'Players',
    regionLabel: 'Region',
    fullRoster: 'Full roster',
    /** Stat-strip labels on the home hero. countryLabel is the singular
     *  form (1 country), countriesLabel the plural. */
    countryLabel: 'Country',
    countriesLabel: 'Countries',
    recordLabel: 'Record',
  },
  about: {
    eyebrow: 'About',
    body: (year: number, region: string) =>
      `Najdorf Esports is a competitive Overwatch organization based in the ${region} region. We founded the org in ${year} and currently compete in OWCS Pacific. The Stage 2 main event runs June 4 through July 9, 2026. The name comes from the Najdorf Variation of the Sicilian Defence, an opening that wins by preparing one line deeper than the other side.`,
    previously: 'Several of our Stage 2 players competed for Rankers in OWCS Pacific Stage 1.',
    contactHeading: 'Contact',
    contactNote: 'For partnerships, press, or player inquiries, email the address above.',
    followHeading: 'Follow along',
  },
  community: {
    eyebrow: 'Join the community',
    headline: 'Travel with the team.',
    body: 'Two channels, no algorithm games. The Discord is where the squad hangs out between matches. X is where you catch the announcements first.',
    discordCta: 'Join the Discord',
    xCta: 'Follow on X',
  },
  live: {
    liveNow: 'LIVE NOW',
    startsIn: 'Starts in',
    vs: 'vs',
    watchNow: 'WATCH NOW',
    openOnTwitch: 'Open on Twitch',
    /** Facade button: Twitch iframe only loads after a deliberate click,
     *  so visitors who never click never trigger Twitch's cookies. */
    loadPlayer: 'Load Twitch player',
    loadPlayerNote: 'Loading sets Twitch\'s own cookies on your device.',
  },

  /** Display names for roles. Kept short, used on player cards and roster strip. */
  roles: {
    Tank: 'Tank',
    DPS: 'DPS',
    Support: 'Support',
    Flex: 'Flex',
    Coach: 'Coach',
    Manager: 'Manager',
  } as Record<Role, string>,

  /** Region label, separate from `roster.regionLabel` because this is the value
   *  rather than the label. e.g. site.region = 'Pacific'. */
  regions: {
    Pacific: 'Pacific',
  } as Record<string, string>,

  /** OWCS tournament status badge that sits at the top of every page hero. */
  owcsBadge: {
    liveLabel: 'Live',
    badgeLine: (startMonthDay: string, endMonthDayYear: string) =>
      `OWCS Pacific Stage 2 main event runs ${startMonthDay} to ${endMonthDayYear}`,
    descriptor: 'OWCS Pacific · Stage 2 · 2026',
  },

  /** Roster strip on the home page (the horizontal player row). */
  rosterStrip: {
    activeRoster: 'Active roster',
    countLine: (players: number, countries: number, coaches: number) => {
      const parts = [
        `${players} ${players === 1 ? 'player' : 'players'}`,
        `${countries} ${countries === 1 ? 'country' : 'countries'}`,
      ];
      if (coaches > 0) parts.push(`${coaches} ${coaches === 1 ? 'coach' : 'coaches'}`);
      return parts.join(' · ');
    },
    fullRoster: 'Full roster',
  },

  /** Achievement strip below the hero. */
  achievement: {
    recentResults: 'Recent results',
    /** Section landmark label. */
    ariaLabel: 'Achievements',
    /** Per-row label for the placement medallion. */
    placementLabel: (placement: string) => `Placement: ${placement}`,
  },

  /** "Where to watch" band (WatchHub) on the home page. */
  watch: {
    eyebrow: 'Where to watch',
    heading: 'Official OWCS Pacific broadcasts',
    cardAriaLabel: (name: string, language: string, platform: string) =>
      `${name}, ${language} broadcast on ${platform}`,
  },

  /** Next match countdown card. */
  nextMatch: {
    eyebrow: (tournament: string) => `Next match · ${tournament}`,
    vs: (opponent: string) => `vs ${opponent}`,
    eyebrowEmpty: 'Next match',
    placeholderHeadline: 'OWCS Pacific Stage 2 · June 4, 2026',
    placeholderBody:
      'Match schedule will be published here as soon as the bracket is finalized.',
    watchLive: 'Watch live',
    days: 'Days',
    hours: 'Hours',
    min: 'Min',
    sec: 'Sec',
  },

  /** Per-match card on /matches and recent-results items. */
  match: {
    vs: (opponent: string) => `vs ${opponent}`,
    watch: 'Watch',
    watchVod: 'Watch VOD',
    tbd: 'TBD',
    win: 'W',
    loss: 'L',
  },

  /** /matches page chrome (header, stat strip, attribution). */
  matches: {
    metaDescription: (league: string) =>
      `Upcoming matches and recent results for Najdorf Esports in ${league}.`,
    eyebrow: (league: string, year: number) => `Schedule · ${league} ${year}`,
    upcoming: 'Upcoming',
    recordLabel: 'Record',
    record: (wins: number, losses: number) => `${wins}W – ${losses}L`,
    pastResults: 'Past Results',
    /** Attribution sentence with two inline links; rendered as
     *  before + <Liquipedia> + between + <CC BY-SA 3.0> + after. */
    attribution: {
      before: 'Match data sourced from ',
      between: ', available under ',
      after: '. Schedule refreshes weekly.',
    },
  },

  /** Empty-state copy on /matches when a section has no fixtures yet. */
  matchEmpty: {
    upcoming: (league: string, stage: string, startDate: string) =>
      `No upcoming matches yet. ${league} ${stage} main event begins ${startDate}.`,
    past: (stage: string) =>
      `No completed matches yet. ${stage} results will appear here once the main event begins.`,
  },

  /** Top-of-page marquee. */
  ticker: {
    upcoming: (date: string, opponent: string, tournament: string) =>
      `${date} · vs ${opponent} · ${tournament}`,
    win: (opponent: string, tournament: string) => `W vs ${opponent} · ${tournament}`,
    loss: (opponent: string, tournament: string) => `L vs ${opponent} · ${tournament}`,
    tbd: (opponent: string, tournament: string) => `vs ${opponent} · ${tournament}`,
    fallback: 'OWCS Pacific Stage 2 main event begins June 4, 2026.',
    ariaLabel: 'Match ticker',
  },

  /** Player card details. */
  player: {
    twitter: 'Twitter',
    twitch: 'Twitch',
    dnp: 'DNP',
    inactive: 'Inactive',
  },

  skipLink: 'Skip to main content',
} as const;

/**
 * Recursively widen literal string types to `string` while preserving
 * function signatures. Without this, `as const` on `en` makes `Strings`
 * carry English literal values (`'Home'` instead of `string`), and
 * zh-TW.ts / zh-CN.ts get rejected for "not assignable to 'Home'".
 * Functions are passed through unchanged so callers keep their typed args.
 */
type Widen<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends string
    ? string
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type Strings = Widen<typeof en>;
