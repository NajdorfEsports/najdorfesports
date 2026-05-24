/**
 * Traditional Chinese translations. Every value is a TODO placeholder that
 * preserves the English source text — grep for `TODO_zhTW` to find them.
 * Hand-edit each one in place; do NOT machine-translate.
 */
import type { Strings } from './en';

export const zhTW: Strings = {
  nav: {
    home:    '{{TODO_zhTW: Home}}',
    roster:  '{{TODO_zhTW: Roster}}',
    matches: '{{TODO_zhTW: Matches}}',
    news:    '{{TODO_zhTW: News}}',
    about:   '{{TODO_zhTW: About}}',
  },
  footer: {
    site:        '{{TODO_zhTW: Site}}',
    follow:      '{{TODO_zhTW: Follow}}',
    foundedLine: (year, region) => `{{TODO_zhTW: Founded ${year} · ${region}}}`,
    trademark:
      '{{TODO_zhTW: Overwatch and the Overwatch Champions Series are trademarks of Blizzard Entertainment, Inc.}}',
    copyright: (year, name) => `{{TODO_zhTW: © ${year} ${name}. All rights reserved.}}`,
  },
  hero: {
    subhead: '{{TODO_zhTW: OWCS PACIFIC 2026}}',
    stats: (players, countries) =>
      `{{TODO_zhTW: ${players} players across ${countries} ${countries === 1 ? 'country' : 'countries'}.}}`,
    record:      (line) => `{{TODO_zhTW: ${line} in Stage 1.}}`,
    achievement: (placement, event) => `{{TODO_zhTW: ${placement} at ${event}.}}`,
    tagline:        '{{TODO_zhTW: Headed to OWCS Pacific Stage 2 on June 4.}}',
    matchSchedule:  '{{TODO_zhTW: Match schedule}}',
    meetRoster:     '{{TODO_zhTW: Meet the roster}}',
  },
  home: {
    recentResults:  '{{TODO_zhTW: Recent results}}',
    recentEmpty:    '{{TODO_zhTW: No completed matches yet. Stage 2 begins June 4.}}',
    allMatches:     '{{TODO_zhTW: All matches}}',
    nextMatchLabel: '{{TODO_zhTW: Next match}}',
    latest:         '{{TODO_zhTW: Latest}}',
    allNews:        '{{TODO_zhTW: All news}}',
    read:           '{{TODO_zhTW: Read}}',
  },
  roster: {
    eyebrow:      '{{TODO_zhTW: Active roster · OWCS Pacific 2026}}',
    h1:           '{{TODO_zhTW: The Lineup}}',
    playersLabel: '{{TODO_zhTW: Players}}',
    regionLabel:  '{{TODO_zhTW: Region}}',
    intro:
      "{{TODO_zhTW: Roster pulled from Liquipedia every six hours. Click a handle to open the player's Liquipedia page.}}",
    fullRoster:           '{{TODO_zhTW: Full roster}}',
    attribution:          '{{TODO_zhTW: Player data sourced from}}',
    attributionLicense:   '{{TODO_zhTW: available under}}',
    attributionRefresh:   '{{TODO_zhTW: Roster refreshes every 6 hours.}}',
  },
  about: {
    eyebrow: '{{TODO_zhTW: About}}',
    body: (year, region) =>
      `{{TODO_zhTW: Najdorf Esports is a competitive Overwatch organization based in the ${region} region. We founded the org in ${year} and currently compete in OWCS Pacific. The Stage 2 main event runs June 4 through July 9, 2026. The name comes from the Najdorf Variation of the Sicilian Defence, an opening that wins by preparing one line deeper than the other side.}}`,
    previously:     '{{TODO_zhTW: Previously competing as Rankers in OWCS Pacific.}}',
    contactHeading: '{{TODO_zhTW: Contact}}',
    contactNote:    '{{TODO_zhTW: For partnerships, press, or player inquiries, email the address above.}}',
  },
  live: {
    liveNow:      '{{TODO_zhTW: LIVE NOW}}',
    startsIn:     '{{TODO_zhTW: Starts in}}',
    vs:           '{{TODO_zhTW: vs}}',
    watchNow:     '{{TODO_zhTW: WATCH NOW}}',
    openOnTwitch: '{{TODO_zhTW: Open on Twitch}}',
  },
  skipLink: '{{TODO_zhTW: Skip to main content}}',
};
