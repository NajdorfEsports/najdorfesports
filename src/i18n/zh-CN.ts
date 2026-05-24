/**
 * Simplified Chinese translations. Every value is a TODO placeholder that
 * preserves the English source text — grep for `TODO_zhCN` to find them.
 * Hand-edit each one in place; do NOT machine-translate.
 */
import type { Strings } from './en';

export const zhCN: Strings = {
  nav: {
    home:    '{{TODO_zhCN: Home}}',
    roster:  '{{TODO_zhCN: Roster}}',
    matches: '{{TODO_zhCN: Matches}}',
    news:    '{{TODO_zhCN: News}}',
    about:   '{{TODO_zhCN: About}}',
  },
  footer: {
    site:        '{{TODO_zhCN: Site}}',
    follow:      '{{TODO_zhCN: Follow}}',
    foundedLine: (year, region) => `{{TODO_zhCN: Founded ${year} · ${region}}}`,
    trademark:
      '{{TODO_zhCN: Overwatch and the Overwatch Champions Series are trademarks of Blizzard Entertainment, Inc.}}',
    copyright: (year, name) => `{{TODO_zhCN: © ${year} ${name}. All rights reserved.}}`,
  },
  hero: {
    subhead: '{{TODO_zhCN: OWCS PACIFIC 2026}}',
    stats: (players, countries) =>
      `{{TODO_zhCN: ${players} players across ${countries} ${countries === 1 ? 'country' : 'countries'}.}}`,
    record:      (line) => `{{TODO_zhCN: ${line} in Stage 1.}}`,
    achievement: (placement, event) => `{{TODO_zhCN: ${placement} at ${event}.}}`,
    tagline:        '{{TODO_zhCN: Headed to OWCS Pacific Stage 2 on June 4.}}',
    matchSchedule:  '{{TODO_zhCN: Match schedule}}',
    meetRoster:     '{{TODO_zhCN: Meet the roster}}',
  },
  home: {
    recentResults:  '{{TODO_zhCN: Recent results}}',
    recentEmpty:    '{{TODO_zhCN: No completed matches yet. Stage 2 begins June 4.}}',
    allMatches:     '{{TODO_zhCN: All matches}}',
    nextMatchLabel: '{{TODO_zhCN: Next match}}',
    latest:         '{{TODO_zhCN: Latest}}',
    allNews:        '{{TODO_zhCN: All news}}',
    read:           '{{TODO_zhCN: Read}}',
  },
  roster: {
    eyebrow:      '{{TODO_zhCN: Active roster · OWCS Pacific 2026}}',
    h1:           '{{TODO_zhCN: The Lineup}}',
    playersLabel: '{{TODO_zhCN: Players}}',
    regionLabel:  '{{TODO_zhCN: Region}}',
    intro:
      "{{TODO_zhCN: Roster pulled from Liquipedia every six hours. Click a handle to open the player's Liquipedia page.}}",
    fullRoster:         '{{TODO_zhCN: Full roster}}',
    attribution:        '{{TODO_zhCN: Player data sourced from}}',
    attributionLicense: '{{TODO_zhCN: available under}}',
    attributionRefresh: '{{TODO_zhCN: Roster refreshes every 6 hours.}}',
  },
  about: {
    eyebrow: '{{TODO_zhCN: About}}',
    body: (year, region) =>
      `{{TODO_zhCN: Najdorf Esports is a competitive Overwatch organization based in the ${region} region. We founded the org in ${year} and currently compete in OWCS Pacific. The Stage 2 main event runs June 4 through July 9, 2026. The name comes from the Najdorf Variation of the Sicilian Defence, an opening that wins by preparing one line deeper than the other side.}}`,
    previously:     '{{TODO_zhCN: Previously competing as Rankers in OWCS Pacific.}}',
    contactHeading: '{{TODO_zhCN: Contact}}',
    contactNote:    '{{TODO_zhCN: For partnerships, press, or player inquiries, email the address above.}}',
  },
  skipLink: '{{TODO_zhCN: Skip to main content}}',
};
