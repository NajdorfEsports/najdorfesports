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
    /** "Our story" history subsection. Drawn from the rebrand + founder's-note
     *  news posts; factual, coexists with the voice-y Founder's Note. */
    historyHeading: 'Our story',
    history1:
      'Najdorf Esports is a new organization, not a rebrand of Rankers. On May 5, 2026, the org acquired the Rankers roster, carrying the core of the Stage 1 lineup forward into Stage 2 under new ownership and a new identity.',
    history2:
      'That Stage 1 run, a 3rd-place finish, was earned as Rankers, and we credit it that way. The coaching staff continued from Stage 1, joined by new signings for the Stage 2 main event, which runs June 4 through July 9, 2026.',
    /** Low-key legal disclosure, mirroring the Privacy Policy wording. */
    incorporationNote:
      'The legal entity behind the organization is being formalized; this notice will be updated to name the operating company once registration is complete.',
    contactHeading: 'Contact',
    contactNote: 'For partnerships, press, or player inquiries, email the address above.',
    partnerNote: 'Affiliate and sponsorship partnerships are managed through impact.com.',
    followHeading: 'Follow along',
  },

  /** Partners / Business inquiries page (/partners/). Honest, no inflation,
   *  no invented sponsor logos. */
  partners: {
    eyebrow: 'Partners',
    title: 'Partner with Najdorf Esports',
    intro:
      'Najdorf Esports is an independent Overwatch organization competing in OWCS Pacific. We acquired the Rankers roster ahead of Stage 2 and are building from there: a regional team playing on the official OWCS Pacific broadcast.',
    standing:
      'We are early, and we would rather be precise about that than oversell it. The roster placed 3rd in OWCS Pacific Stage 1 (as Rankers) and is in the Stage 2 main event now. What follows is what we can genuinely deliver at our current size.',
    offerHeading: 'What we offer',
    offerNote:
      'A new org with a growing audience, not a tier-one franchise. This is the inventory we can deliver today, and it grows as we do.',
    offerJersey: {
      title: 'Jersey and kit placement',
      body: 'Your mark on the team jersey and player kit worn on the OWCS Pacific broadcast and at LAN.',
    },
    offerBroadcast: {
      title: 'Broadcast and co-stream presence',
      body: 'Logo and mentions across our co-streams and content, once cleared by the league broadcast.',
    },
    offerDiscord: {
      title: 'Discord pinned placement',
      body: 'A pinned placement and mentions in our community Discord, where the team and fans gather between matches.',
    },
    offerLogo: {
      title: 'On-site logo placement',
      body: 'Your logo and link in the partners section of this website.',
    },
    offerSocial: {
      title: 'Social mentions',
      body: 'Tagged posts and shout-outs from the org X account around matches and announcements.',
    },
    foundingHeading: 'Founding partner slots are open',
    foundingBody:
      'We have no partners yet, and that is deliberate: the founding slots are open. We will not show placeholder logos or invented brands. If you want to be the first name on the jersey, talk to us.',
    affiliateNote:
      'Affiliate and sponsorship partnerships are managed through impact.com.',
    contactHeading: 'Get in touch',
    contactResponse: 'We aim to reply within 24 to 48 hours.',
    metaDescription:
      'Partnership and sponsorship inquiries for Najdorf Esports, an OWCS Pacific Overwatch organization. Founding partner slots are open.',
  },

  /** Press / Media kit page (/press/). Built but kept dormant (unlinked,
   *  noindex) until the owner is ready to surface it. */
  press: {
    eyebrow: 'Press',
    title: 'Press and media kit',
    intro:
      'Everything you need to write about or feature Najdorf Esports. For interviews or anything not covered here, email us at',
    assetsHeading: 'Brand assets',
    assetsNote:
      'Give the bishop logo clear space, do not recolor it (it is strictly black and white), and do not stretch or rotate it. The wordmark may be used in the brand blue, or in white on dark backgrounds.',
    downloadHeading: 'Logo files',
    colorsHeading: 'Brand colors',
    colorPrimary: 'Primary',
    colorSecondary: 'Secondary',
    colorBackground: 'Background',
    factHeading: 'Fact sheet',
    factOrg: 'Organization',
    factFounded: 'Founded',
    factRegion: 'Region',
    factGame: 'Game',
    factRoster: 'Roster',
    factResults: 'Notable results',
    teamHeading: 'Team',
    ownerRole: 'Owner',
    ownerBody:
      'Founder and operator. Najdorf Esports is independently owned and run under the organization name rather than a personal identity.',
    marksHeading: 'Fair use of our marks',
    marksBody:
      'You may use the Najdorf Esports name and logo to report on or reference the organization. Do not alter the logo, imply a partnership or endorsement we have not announced, or use our marks in a misleading way. Overwatch and OWCS marks belong to Blizzard Entertainment; see our Terms of Use.',
    metaDescription:
      'Press and media kit for Najdorf Esports: brand assets, fact sheet, and contact.',
  },
  community: {
    eyebrow: 'Join the community',
    headline: 'Travel with the team.',
    body: 'Two channels, no algorithm games. The Discord is where the squad hangs out between matches. X is where you catch the announcements first.',
    discordCta: 'Join the Discord',
    xCta: 'Follow on X',
    /** Count labels shown next to a channel's live number (e.g. "15 members").
     *  Currently unused (counts are hidden) but kept for the optional toggle. */
    members: 'members',
    followers: 'followers',
  },

  /** Weekly match highlights (vertical YouTube Shorts, click-to-load). */
  highlights: {
    eyebrow: 'Highlights',
    heading: 'Match highlights',
    /** Dormant state shown when a highlight has no video published yet. */
    comingSoon: 'Highlight coming soon',
    loadVideo: 'Play highlight',
    /** Mirrors the Twitch facade note: no Google contact until the click. */
    loadNote: 'Loading plays from YouTube and lets Google set its cookies.',
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
    /** Attributed broadcast-peak note on a match card. The number is the OWCS
        Pacific broadcast's peak concurrent viewers, not the org's own. */
    broadcastPeak: (n: string) => `${n} peak on OWCS Pacific`,
    tbd: 'TBD',
    win: 'W',
    loss: 'L',
  },

  /** Broadcast-reach highlight on the home page (BroadcastReach). The number is
      the OWCS Pacific broadcast's peak concurrent viewers for our biggest
      match, NOT the org's own channel; the copy attributes it to the broadcast. */
  reach: {
    eyebrow: 'Broadcast reach',
    peakLabel: 'peak concurrent viewers',
    context: (opponent: string) =>
      `On the OWCS Pacific broadcast of our match vs ${opponent}.`,
    cta: 'See the match',
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
    bilibili: 'Bilibili',
    liquipedia: 'Liquipedia',
    dnp: 'DNP',
    inactive: 'Inactive',
    /** Accessible alt text for a player's avatar art (Task I). `hero` is the
     *  signature character the avatar shows; omitted for the monogram/strip. */
    avatarAlt: (handle: string, role: string, hero?: string) =>
      hero ? `${handle}, ${role}, signature hero ${hero}` : `${handle}, ${role}`,
  },

  /** Individual player detail page (/roster/<handle>/). */
  playerPage: {
    backToRoster: 'Back to roster',
    heroPool: 'Hero pool',
    links: 'Links',
    realName: 'Real name',
    metaDescription: (handle: string, role: string) =>
      `${handle}, ${role} for Najdorf Esports in OWCS Pacific.`,
  },

  /** Attribution tag for results the roster earned under its former name,
   *  before Najdorf Esports acquired it (currently OWCS Pacific Stage 1 as
   *  Rankers). Shown next to those results so the org showcases the players'
   *  record without claiming the achievement. See competedAsFor in site.ts. */
  competedAs: (name: string) => `As ${name}`,

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
