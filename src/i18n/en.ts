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
    coaching: 'Coaching',
    games: 'Games',
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
    subhead: 'OWCS PACIFIC · STAGE 2 · 2026',
    achievement: (placement: string, event: string) => `${placement} at ${event}.`,
    tagline: 'Now competing in the Stage 2 main event.',
    matchSchedule: 'Match schedule',
    meetRoster: 'Meet the roster',
  },
  home: {
    recentResults: 'Recent results',
    recentEmpty: 'No completed matches yet. Stage 2 begins June 4.',
    allMatches: 'All matches',
    nextMatchLabel: 'Next match',
    matchCenterHeading: 'Match center',
    latest: 'Latest',
    allNews: 'All news',
    read: 'Read',
  },

  /** Per-page <title> / meta description, localized. The home and about pages
   *  use `exactTitle` in BaseLayout, so homeTitle / aboutTitle are the full
   *  <title> with no site-name suffix. */
  pageMeta: {
    homeTitle: 'Najdorf Esports | OWCS Pacific Overwatch Team',
    homeDescription:
      'Najdorf Esports is an Overwatch organization based in the Pacific region. Competing in OWCS Pacific.',
    aboutTitle: 'About Najdorf Esports',
    aboutDescription:
      'Najdorf Esports is an Overwatch organization competing in OWCS Asia Pacific. Read our story and partner with us.',
    coachingTitle: 'Overwatch Coaching',
    coachingDescription:
      'Book one-on-one Overwatch coaching with brysonbtw from the Najdorf Esports OWCS Pacific roster. Single sessions and multi-session packs, paid securely at booking.',
    rosterDescription: (headcount: number, countries: string[]) =>
      `The Najdorf Esports active OWCS Pacific roster. ${headcount} players across ${countries.join(', ')}.`,
    gamesTitle: 'Games',
    gamesDescription:
      'Daily Overwatch games from Najdorf Esports: a free daily mini crossword in three difficulties and OWdle, a daily hero-guessing game.',
    crosswordTitle: 'Daily Overwatch Mini Crossword',
    crosswordDescription:
      'A free daily Overwatch mini crossword from Najdorf Esports. Three difficulties, new puzzles at midnight Eastern, no ads, no tracking.',
    owdleTitle: 'OWdle: Daily Overwatch Hero Guessing Game',
    owdleDescription:
      'Guess the secret Overwatch hero from attribute clues: role, origin, HP, attack type, and more. A free daily game from Najdorf Esports, no ads, no tracking.',
    gambitTitle: 'Gambit: Daily Survivor Roguelite',
    gambitDescription:
      'Gambit is a free chess-motif survivor roguelite from Najdorf Esports. Outlast the swarm, level up, and build your run. A new seeded daily, no ads, no tracking.',
  },

  /** News index + article chrome. Article bodies are per-locale markdown
   *  in src/content/news; these are the surrounding labels. */
  news: {
    eyebrow: 'News',
    heading: 'From the team',
    backToAll: 'All news',
    metaDescription:
      'Announcements, roster moves, and match recaps from Najdorf Esports, the Overwatch organization competing in OWCS Pacific. Read the latest from the org.',
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
    /** Hero line under the wordmark H1 (which renders site.name). */
    heroTagline: 'Disciplined aggression in OWCS Pacific.',
    storyHeading: 'Our story',
    story1:
      "Najdorf Esports is an Overwatch esports organization competing in the Overwatch Champions Series (OWCS) Asia Pacific. We take our name from the Najdorf Variation of the Sicilian Defense, one of chess's sharpest openings: built on deep preparation, always seeking the initiative, and willing to attack from a position most players would only defend. That is how we approach Overwatch.",
    story2:
      "We entered OWCS Pacific by acquiring the roster that had competed as Rankers, ahead of Stage 2 of the 2026 season. Competing as Rankers, that roster won the OWCS 2026 Pacific Stage 1 Open Qualifier. Stage 2 is the team's first competition under the Najdorf name, and the start of a long-term presence we intend to build one stage at a time.",
    teamHeading: 'The team',
    teamBody:
      'Our roster brings together players from across the region, including Hong Kong, Taiwan, Korea, and China, backed by dedicated coaching and management.',
    /** CTA into the data-driven roster route; no player names are hardcoded here. */
    rosterLink: 'See the current roster',
    partnersHeading: 'Partnerships',
    partners1:
      'Najdorf Esports is building a lasting presence in OWCS Pacific, and we welcome partners who want to grow with us. Our core players come from Hong Kong, Taiwan, and mainland China, which positions us to reach Cantonese and Mandarin speaking Overwatch fans, an audience the regional broadcast does not currently serve in their own language. For a brand that wants to connect with Chinese speaking esports communities in Asia Pacific, that is an opportunity few organizations can offer.',
    partners2:
      'We can work with partners on brand visibility across our channels, content collaboration with our players, and activations built around the OWCS season. If you would like to explore a partnership, we would be glad to talk.',
    contactHeading: 'Contact',
    /** Rendered as "{contactLabel} {email}"; the colon lives in the string so
     *  each locale controls its own punctuation (full-width in zh). */
    contactLabel: 'Partnerships & Press:',
  },

  /** Coaching page (/coaching/). Per-coach facts and prose (bio, region note)
   *  live in src/data/coaching.ts; this is the shared page chrome. Booking is
   *  handled by embedded Cal.com bookers (no accounts, no backend). */
  coaching: {
    hero: {
      eyebrow: 'Coaching',
      heading: 'Overwatch Coaching with Najdorf Esports',
      subheading:
        'Train one-on-one with a competitor from our OWCS Asia Pacific roster. Learn the positioning, habits, and decisions that win games.',
      cta: 'Meet the coaches',
    },
    /** Aria labels for the hero's chess-promotion stepper controls. */
    promo: {
      prev: 'Previous piece',
      next: 'Next piece',
    },
    browse: {
      heading: 'Meet the coaches',
      lede: 'Pick a coach, choose how you want to pay, then book your first session.',
      viewSessions: 'View sessions',
      filtersLabel: 'Filter coaches',
      filterRole: 'Role',
      filterLanguage: 'Language',
      filterHero: 'Hero',
      allRoles: 'All roles',
      allLanguages: 'All languages',
      allHeroes: 'All heroes',
      noMatch: 'No coaches match these filters yet. More coaches are joining.',
      coachAria: (name: string, role: string) => `${name}, ${role}`,
    },
    coach: {
      specialtiesLabel: 'Signature heroes',
      languagesLabel: 'Languages',
      langCantonese: 'Cantonese',
      langMandarin: 'Mandarin',
    },
    booking: {
      heading: (name: string) => `Book with ${name}`,
      paymentHeading: 'How do you want to pay?',
      paymentStep: 'Step 1',
      sessionsHeading: 'Choose your sessions',
      sessionsStep: 'Step 2',
      payCard: 'Pay by card',
      payPaypal: 'Pay with PayPal',
      comingSoon: 'Coming soon',
    },
    offerings: {
      book: 'Book',
      securedNote:
        'Payment is processed securely by card or PayPal at booking. We never see your payment details.',
      packNote:
        'Packs are paid once at booking. You book the first session now. You arrange the remaining sessions with your coach on Discord.',
      durationLabel: (sessions: number, minutes: number) =>
        sessions === 1 ? `${minutes} min` : `${sessions} x ${minutes} min`,
      items: {
        single: {
          title: 'Single Session',
          blurb: 'One 60-minute coaching session. Book a time and pay $15.',
          badge: '',
        },
        pack2: {
          title: '2-Session Pack',
          blurb: 'Two 60-minute sessions for $25 ($12.50 each).',
          badge: 'Save $5',
        },
        pack4: {
          title: '4-Session Pack',
          blurb: 'Four 60-minute sessions for $50 ($12.50 each).',
          badge: 'Save $10',
        },
      },
    },
    how: {
      heading: 'How it works',
      step1Title: 'Choose and book',
      step1Body:
        'Pick a coach and how you want to pay, then choose an open time for your first session.',
      step2Title: 'Pay securely',
      step2Body: 'Pay securely by card or PayPal. A pack is paid once, in full, at booking.',
      step3Title: 'Connect on Discord',
      step3Body:
        'Enter your Discord handle at checkout. We pass it to your coach, who adds you on Discord to set up your session. For packs, you arrange your remaining sessions, and any rescheduling, directly with your coach there.',
      step4Title: 'Share feedback',
      step4Body:
        'After your session, we send a short private feedback request by email so we can keep improving the coaching.',
    },
    faq: {
      heading: 'FAQ',
      q1: 'How do pack sessions work?',
      a1: 'You pay once for the full pack at booking. You book your first session through the calendar. After that, you arrange your remaining sessions directly with your coach on Discord.',
      q2: 'How do I join my session?',
      a2: 'After your booking is confirmed, we pass your Discord handle to your coach, who adds you on Discord to arrange the session. Enter your Discord handle at checkout so your coach can reach you.',
      q3: 'How do I pay, and is it secure?',
      a3: 'You can pay by card or with PayPal at booking. Payment is processed securely by the provider, and we never see your payment details.',
      q4: 'What do I need?',
      a4: 'An Overwatch account and a Discord account. It also helps to bring a recent replay of a close loss, since those are the best games to learn from.',
      q5: 'Can I reschedule?',
      a5: 'Yes. Rescheduling is arranged directly between you and your coach on Discord, so just give your coach as much notice as you can.',
      q6: 'What languages are available?',
      a6: 'Coaching is available in Cantonese and Mandarin.',
      q7: 'What is your refund policy?',
      a7: 'Sessions are prepaid and non-refundable. If you cannot make your time, you can reschedule at no cost: just give your coach as much notice as you can on Discord.',
    },
    help: {
      text: 'Questions before you book?',
      discordCta: 'Ask us on Discord',
      emailIntro: 'Prefer email? Reach us at',
    },
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
    statsNote: (asOf: string) =>
      `Figures from OWCS Pacific 2026, as of ${asOf}. Any broadcast viewership shown is the OWCS Pacific broadcast's reach, not our own channel.`,
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
      'Give the bishop logo clear space and do not stretch, rotate, or recolor it: use the full-color mark (a black bishop with brand-blue accents) on light backgrounds, and the white-and-blue variant on dark ones. The wordmark may be used in the brand blue, or in white on dark backgrounds.',
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
    body: 'No algorithm games, just the squad. Hang out in Discord between matches, catch announcements first on X, and watch the games and highlights on Twitch and YouTube.',
    discordCta: 'Join the Discord',
    xCta: 'Follow on X',
    twitchCta: 'Watch on Twitch',
    youtubeCta: 'Subscribe on YouTube',
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
    /** Companion cards beside a lone Short so the rail reads curated. */
    placeholderTitle: 'More film on the way',
    placeholderBody: (opponent: string, date: string) =>
      `Highlights from ${opponent} land here after match day, ${date}.`,
    placeholderBodyEmpty: 'Highlights from the next series land here after match day.',
    subscribeCta: 'Subscribe on YouTube',
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
    loadPlayerNote: "Loading sets Twitch's own cookies on your device.",
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
    placeholderBody: 'Match schedule will be published here as soon as the bracket is finalized.',
    watchLive: 'Watch live',
    days: 'Days',
    hours: 'Hours',
    min: 'Min',
    sec: 'Sec',
    yourTimezone: 'Your timezone',
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
    /** Disclosure label for the per-map score table on a match card. */
    mapByMap: 'Map by map',
  },

  /** Broadcast-reach highlight on the home page (BroadcastReach). The number is
      the OWCS Pacific broadcast's peak concurrent viewers for our biggest
      match, NOT the org's own channel; the copy attributes it to the broadcast. */
  reach: {
    eyebrow: 'Broadcast reach',
    peakLabel: 'peak concurrent viewers',
    context: (opponent: string) => `On the OWCS Pacific broadcast of our match vs ${opponent}.`,
    cta: 'See the match',
  },

  /** Sponsor-facing "by the numbers" strip (StatStrip) on About + Partners.
   *  All figures are real or derived (see lib/derived-stats.ts). */
  statStrip: {
    byTheNumbers: 'By the numbers',
    players: 'Players',
    countries: 'Countries',
    winRate: 'Win rate',
    matchesPlayed: 'Matches played',
    peakViewers: 'Peak viewers',
  },

  /** Founding-partners invite shown on the home page in place of the (still
   *  empty) sponsor wall. Public-facing; no fake logos, just an open call. */
  sponsorInvite: {
    eyebrow: 'Partners',
    heading: 'Founding partner slots are open',
    body: 'No logos here yet, and that is deliberate. Be the first brand on the jersey as we build through OWCS Pacific.',
    cta: 'Partner with us',
  },

  /** /matches page chrome (header, stat strip, attribution). */
  matches: {
    metaDescription: (league: string) =>
      `Upcoming ${league} Stage 2 matches and recent results for Najdorf Esports. Full schedule with map scores, opponents, and where to watch each series live.`,
    eyebrow: (league: string, year: number) => `Schedule · ${league} ${year}`,
    upcoming: 'Upcoming',
    recordLabel: 'Record',
    /** Label above the recent-form W/L pills in the /matches header. */
    formLabel: 'Recent form',
    record: (wins: number, losses: number) => `${wins}W – ${losses}L`,
    /** Split variant of `record` for the /matches header stat, where the
     *  wins half renders in brand blue and the losses half in loss red.
     *  recordJoin is the separator between the halves. Keep the three
     *  pieces concatenated identical to `record`. */
    recordWins: (wins: number) => `${wins}W`,
    recordLosses: (losses: number) => `${losses}L`,
    recordJoin: ' – ',
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

  /** Top-of-page marquee. The stream is organized into rubric-led groups
   *  (current stage results, that stage's upcoming matches, then earlier
   *  stages); the stage context lives in the rubric once, so items stay
   *  short. */
  ticker: {
    /** Rubric introducing a stage's results group, e.g. "Stage 2 results · 2-0".
     *  `record` is omitted while the stage has no decided matches. */
    results: (stage: string, record?: string) =>
      `${stage ? `${stage} results` : 'Results'}${record ? ` · ${record}` : ''}`,
    /** Rubric introducing a stage's upcoming matches, e.g. "Up next · Stage 2". */
    upNext: (stage: string) => (stage ? `Up next · ${stage}` : 'Up next'),
    upcoming: (date: string, opponent: string) => `${date} · vs ${opponent}`,
    /** Result item body; the W/L map-score badge is rendered separately. */
    result: (opponent: string, date: string) => `${opponent} · ${date}`,
    /** Past match Liquipedia has not scored yet. */
    tbd: (opponent: string, date: string) => `vs ${opponent} · ${date}`,
    /** Boxed result marker, e.g. "W 3-1"; bare "W" when map data is missing. */
    winBadge: (score?: string) => (score ? `W ${score}` : 'W'),
    lossBadge: (score?: string) => (score ? `L ${score}` : 'L'),
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
    /** Label under the branded header's role-signature chess piece. */
    signature: 'Signature',
    links: 'Links',
    realName: 'Real name',
    /** Derived team-stats panel. The note is the honesty rule made visible:
     *  Liquipedia carries team results only, never per-player appearances. */
    teamRecordHeading: 'Team record',
    teamRecordNote:
      'Najdorf Esports team results in OWCS Pacific 2026. Individual match appearances are not tracked.',
    recentMatchesHeading: 'Recent matches',
    mapRecordHeading: 'Map record',
    statsEmpty: 'No completed matches yet.',
    playedLabel: 'Played',
    streakLabel: 'Form',
    metaDescription: (handle: string, role: string) =>
      `${handle}, ${role} for Najdorf Esports in OWCS Pacific.`,
  },

  /** /games/ hub and the daily mini crossword (/games/crossword/). The
   *  crossword engine reads these via data attributes rendered by
   *  CrosswordPageBody; everything stays server-rendered and localized. */
  games: {
    hub: {
      eyebrow: 'Games',
      heading: 'Games',
      sub: 'Daily games from the org. Free, no ads, nothing tracked.',
      crosswordTitle: 'Daily Mini Crossword',
      crosswordDesc:
        'A bite-size Overwatch crossword: heroes, maps, callouts, and esports history. Three difficulties, a fresh grid every day.',
      crosswordCta: "Play today's puzzle",
      newDaily: 'New puzzle daily',
      owdleTitle: 'OWdle',
      owdleDesc:
        'Guess the secret Overwatch hero. Every guess grades seven attributes, from role and origin to HP and release year. One hero a day, same for everyone.',
      owdleCta: "Guess today's hero",
      newHeroDaily: 'New hero daily',
      gambitTitle: 'Gambit',
      gambitDesc:
        'A chess-motif survivor roguelite. Outlast the swarm on the board, level up, and build your run. One seeded daily, the same for everyone.',
      gambitCta: 'Start a run',
      newDailyRun: 'New run daily',
    },
    crossword: {
      eyebrow: 'Daily game',
      heading: 'Overwatch Mini Crossword',
      intro: 'A new Overwatch-themed mini every day. Pick a difficulty and fill the grid.',
      difficultyLabel: 'Difficulty',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      easyDesc: 'Casual fan',
      mediumDesc: 'Dedicated player',
      hardDesc: 'Esports deep cuts',
      acrossLabel: 'Across',
      downLabel: 'Down',
      checkLabel: 'Check',
      checkLetter: 'Check letter',
      checkWord: 'Check word',
      checkPuzzle: 'Check puzzle',
      revealLabel: 'Reveal',
      revealLetter: 'Reveal letter',
      revealWord: 'Reveal word',
      revealPuzzle: 'Reveal puzzle',
      clearLabel: 'Clear grid',
      shareLabel: 'Share result',
      shareCopied: 'Copied to clipboard',
      nextPuzzleLabel: 'Next puzzle in',
      timerLabel: 'Time',
      completeHeading: 'Solved!',
      completeBody: (time: string) => `You finished today's puzzle in ${time}.`,
      completeAssisted: 'Solved with a few reveals. Tomorrow, clean sweep.',
      statsHeading: 'Your stats',
      statsPlayed: 'Played',
      statsWon: 'Solved',
      statsStreak: 'Streak',
      statsMaxStreak: 'Best streak',
      statsBestTime: 'Best time',
      statsNote: 'Stats are stored only in this browser and never leave your device.',
      noJsNotice:
        'The interactive puzzle needs JavaScript. The grid, clues, and your progress all run right here in your browser; nothing is sent anywhere.',
      loadError: "Today's puzzle could not be loaded. Refresh to try again.",
      noPuzzle: 'No puzzle is published for today yet. Check back soon.',
      /** Shown on zh pages while clue text is English-only (pending native
       *  review of the translated clue corpus). */
      zhClueNotice: 'Clues are currently in English. Localized clues are in the works.',
      howToHeading: 'How to play',
      howTo1:
        'Tap a square and type. Arrow keys move around the grid, Tab jumps to the next clue, Enter switches between Across and Down.',
      howTo2:
        'Stuck? Check marks wrong letters; Reveal fills them in. Solve without reveals for a clean share grid.',
      howTo3: 'A new puzzle for each difficulty lands daily at midnight US Eastern time.',
      ariaGrid: 'Crossword grid',
      ariaKeyboard: 'On-screen keyboard',
      ariaBackspace: 'Delete letter',
    },
    owdle: {
      eyebrow: 'Daily game',
      heading: 'OWdle',
      intro:
        'One secret Overwatch hero a day, the same for everyone. Type a guess and every column tells you how close you are.',
      /** Shown on zh pages while hero names and origins render in English
       *  (same holding pattern as the crossword's English clues). */
      zhValuesNotice: 'Hero names and origins are shown in English for now.',
      inputLabel: 'Guess a hero',
      inputPlaceholder: 'Type a hero name',
      guessButton: 'Guess',
      suggestionsLabel: 'Hero suggestions',
      unknownHero: 'Pick a hero from the suggestions.',
      colHero: 'Hero',
      colRole: 'Role',
      colSubRole: 'Sub-role',
      colGender: 'Gender',
      colOrigin: 'Origin',
      colHp: 'HP',
      colAttack: 'Attack type',
      colYear: 'Year',
      roleValues: { tank: 'Tank', damage: 'Damage', support: 'Support' },
      subRoleValues: {
        bruiser: 'Bruiser',
        flanker: 'Flanker',
        initiator: 'Initiator',
        medic: 'Medic',
        recon: 'Recon',
        sharpshooter: 'Sharpshooter',
        specialist: 'Specialist',
        stalwart: 'Stalwart',
        survivor: 'Survivor',
        tactician: 'Tactician',
      },
      genderValues: { female: 'Female', male: 'Male', 'non-binary': 'Non-binary', none: 'None' },
      attackValues: { hitscan: 'Hitscan', projectile: 'Projectile', beam: 'Beam', melee: 'Melee' },
      legendHeading: 'How to read the grid',
      legendExact: 'Exact match',
      legendPartial: 'Close: some overlap, or within 25 HP / 1 year',
      legendMiss: 'No match',
      legendHigher: 'The answer is higher or later',
      legendLower: 'The answer is lower or earlier',
      winHeading: 'Got it!',
      winBody: (hero: string, count: string) => `The hero was ${hero}. Solved in ${count} guesses.`,
      winBodyOne: (hero: string) => `The hero was ${hero}. First try!`,
      fitToggle: 'Fit to screen',
      shareLabel: 'Share result',
      shareCopied: 'Copied to clipboard',
      puzzleLabel: 'Puzzle',
      nextHeroLabel: 'Next hero in',
      yesterdayLabel: "Yesterday's hero",
      statsHeading: 'Your stats',
      statsPlayed: 'Played',
      statsWon: 'Solved',
      statsStreak: 'Streak',
      statsMaxStreak: 'Best streak',
      statsNote: 'Stats are stored only in this browser and never leave your device.',
      distHeading: 'Guess distribution',
      noJsNotice:
        'The interactive game needs JavaScript. Guesses, stats, and the daily hero all run right here in your browser; nothing is sent anywhere.',
      howToHeading: 'How to play',
      howTo1:
        'Type a hero name and guess. Each guess fills a row: green is an exact match, orange is close, red is a miss.',
      howTo2:
        'Orange on Origin means the same part of the world; on HP or Year it means within 25 HP or one year. Arrows point toward the answer: up means higher or later, down means lower or earlier.',
      howTo3: 'Guesses are unlimited. A new hero lands daily at midnight US Eastern time.',
      howTo4: 'Win streaks and stats stay on this device; share posts only colored squares.',
      ariaBoard: 'Guess results grid',
      ariaSolvedBoard: 'Solved board',
      disclaimer:
        'This is an unofficial fan-made game. It is not affiliated with, endorsed by, or sponsored by Blizzard Entertainment. Overwatch is a trademark of Blizzard Entertainment, Inc. All hero names and related facts are the property of their respective owners.',
      dataCredit: 'Hero data via the community OverFast API, with hand-curated additions.',
    },

    /** /games/gambit/, the chess-motif survivor roguelite. The engine
     *  (src/scripts/gambit.ts) reads the upgrade name+desc map and a few
     *  dynamic labels via data-l10n; the rest is server-rendered here. All
     *  original: no Blizzard-derived names, art, or content. */
    gambit: {
      eyebrow: 'Daily game',
      heading: 'Gambit',
      intro:
        'A chess-motif survivor roguelite. Outlast the swarm on the board, level up, and build your run. One seeded daily, the same for everyone.',
      noJsNotice:
        'This game needs JavaScript. It runs entirely in your browser; nothing is sent anywhere, and only your best time and upgrades are saved on this device.',
      controlsHint:
        'Move with WASD or the arrow keys. On touch, drag anywhere to move. Your weapons fire on their own; collect more as you level.',
      playLabel: 'Start run',
      retryLabel: 'Play again',
      backLabel: 'Back',
      dailyLabel: 'Daily run',
      bestLabel: 'Best',
      noBest: 'None yet',
      standardLabel: 'Casual mode',
      standardHint:
        'Off: the pure daily run, the same fair challenge for everyone. On: a casual run that uses your permanent upgrades.',
      currencyLabel: 'Shards',
      shopHeading: 'Permanent upgrades',
      shopHint:
        'Spend shards from runs. These apply only in Casual mode; the daily run is always pure.',
      buyLabel: 'Buy',
      maxedLabel: 'Maxed',
      pauseLabel: 'Pause',
      resumeLabel: 'Resume',
      pausedHeading: 'Paused',
      giveUpLabel: 'End run',
      stats: {
        time: 'Time',
        level: 'Level',
        weapons: 'Weapons',
        upgrades: 'Upgrades',
        evolutions: 'Evolutions',
        ready: 'Ready!',
        none: 'None yet',
      },
      levelUpHeading: 'Level up',
      levelUpSub: 'Choose one',
      hudLevel: 'Lv',
      hudKills: 'Kills',
      overHeading: 'Run over',
      survivedLabel: 'Survived',
      levelReachedLabel: 'Level reached',
      killsLabel: 'Defeated',
      earnedLabel: 'Shards earned',
      newBest: 'New best time!',
      victoryLabel: 'Victory',
      nextLabel: 'Next daily in',
      heroLabel: 'Hero',
      heroLocked: 'Win a run to unlock',
      zoomInLabel: 'Zoom in',
      zoomOutLabel: 'Zoom out',
      fullscreenLabel: 'Fullscreen',
      reaperWarning: 'The Queen approaches',
      endlessTag: 'Endless',
      winHeading: 'You survived!',
      winBody: 'You reached the 10-minute mark. Keep going into endless, or finish here.',
      continueLabel: 'Keep going',
      finishLabel: 'Finish run',
      unlockHeading: 'New hero unlocked',
      howToHeading: 'How to play',
      howTo1: 'Move to dodge. Your weapons auto-fire on their own. Survive as long as you can.',
      howTo2:
        'Defeated foes drop shards of experience. Collect them to level up, then take a new weapon, level one you own, or pick an upgrade to shape your build.',
      howTo3:
        'Difficulty climbs the whole run, so a strong upgrade buys time, not safety. A new seeded run lands daily at midnight US Eastern.',
      howTo4:
        'Best time and permanent upgrades are stored only in this browser and never leave your device.',
      disclaimer:
        'Gambit is an original game made by Najdorf Esports. It is not affiliated with, endorsed by, or based on any other game; all names, characters, and art are original.',
      newWeaponTag: 'New weapon',
      evolutionTag: 'Evolution',
      levelTag: 'Lv {n} → {m}',
      weapons: {
        bolt: { name: 'The Bolt', desc: 'A precise bolt at the nearest foe.' },
        volley: { name: 'Battery', desc: 'A ring of bolts fired in every direction.' },
        carousel: { name: 'Carousel', desc: 'Orbiting blades that shred anything they touch.' },
        gambit: { name: "Knight's Gambit", desc: 'A piercing lance fired the way you move.' },
        sanctum: { name: "Bishop's Sanctum", desc: 'A field that steadily burns nearby foes.' },
        oracle: { name: 'Oracle', desc: 'Homing bolts that chase down stragglers.' },
        lance: { name: 'Lance', desc: 'An unstoppable railgun fired the way you move.' },
        communion: { name: 'Communion', desc: 'A burning field that heals you on every kill.' },
      },
      evolutions: {
        evoLance: {
          name: 'Lance',
          desc: 'Evolve the Bolt with Piercing: an unstoppable directional railgun.',
        },
        evoCommunion: {
          name: 'Communion',
          desc: 'Evolve the Sanctum with Mending: the field now heals on every kill.',
        },
      },
      upgrades: {
        damage: { name: 'Might', desc: 'All weapons deal more damage.' },
        firerate: { name: 'Quickening', desc: 'All weapons fire more often.' },
        multishot: { name: 'Multishot', desc: 'Projectile weapons fire one more shot.' },
        pierce: { name: 'Piercing', desc: 'Projectiles pass through one more foe.' },
        area: { name: 'Heavy Shot', desc: 'Bigger projectiles, splash, and wider area weapons.' },
        crit: { name: 'Keen Eye', desc: 'A chance to land critical hits for big extra damage.' },
        wrath: { name: 'Wrath', desc: 'Critical hits deal even more damage.' },
        velocity: { name: 'True Flight', desc: 'Projectiles travel faster.' },
        swift: { name: 'Fleet Step', desc: 'Move faster.' },
        magnet: { name: 'Wider Reach', desc: 'Draw in shards from farther away.' },
        fortify: { name: 'Reinforce', desc: 'Raise maximum health and heal.' },
        regen: {
          name: 'Mending',
          desc: 'Recover health, but only in a cleared pocket while still.',
        },
        armor: { name: 'Plating', desc: 'Reduce the damage of every hit you take.' },
        evasion: { name: 'Evasion', desc: 'A chance to dodge an incoming hit entirely.' },
        revival: {
          name: 'Second Life',
          desc: 'Once per run, cheat death and revive at half health.',
        },
      },
      powerups: {
        might: { name: 'Might', desc: 'Begin every run with more damage.' },
        vigor: { name: 'Vigor', desc: 'Begin every run with more health.' },
        haste: { name: 'Haste', desc: 'Begin every run moving faster.' },
        greed: { name: 'Greed', desc: 'Begin every run drawing shards from farther.' },
      },
      heroes: {
        bishop: {
          name: 'Bishop',
          desc: 'A precise long-range striker and a true glass cannon: heavy crits and the longest reach, but no way to heal. Keep moving and pick the swarm off from a safe distance.',
        },
        knight: {
          name: 'Knight',
          desc: 'Fast and aggressive: he opens with the Gambit lance fired the way you move, attacks quickly, and heals on every kill. Dive in, point your body at the swarm, and keep killing. Win a run to unlock.',
        },
      },
    },
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
