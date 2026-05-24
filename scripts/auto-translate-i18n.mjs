#!/usr/bin/env node
/**
 * Auto-translate the i18n dictionary via MyMemory's free public API.
 *
 * Run once, commit the output, hand-edit for quality afterward.
 * Brand terms and interpolation placeholders are tokenized before the call
 * and restored after, so `${year}`, "OWCS", "Najdorf Esports", etc. don't
 * get mangled by the translator.
 *
 *   node scripts/auto-translate-i18n.mjs
 *
 * Writes src/i18n/zh-TW.ts and src/i18n/zh-CN.ts.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Source strings — mirror of src/i18n/en.ts. If you add a key there, add it
// here too and re-run the script.
// ---------------------------------------------------------------------------

const PLAIN = {
  'nav.home':    'Home',
  'nav.roster':  'Roster',
  'nav.matches': 'Matches',
  'nav.news':    'News',
  'nav.about':   'About',

  'footer.site':      'Site',
  'footer.follow':    'Follow',
  'footer.trademark': 'Overwatch and the Overwatch Champions Series are trademarks of Blizzard Entertainment, Inc.',

  'hero.subhead':       'OWCS PACIFIC 2026',
  'hero.tagline':       'Headed to OWCS Pacific Stage 2 on June 4.',
  'hero.matchSchedule': 'Match schedule',
  'hero.meetRoster':    'Meet the roster',

  'home.recentResults':  'Recent results',
  'home.recentEmpty':    'No completed matches yet. Stage 2 begins June 4.',
  'home.allMatches':     'All matches',
  'home.nextMatchLabel': 'Next match',
  'home.latest':         'Latest',
  'home.allNews':        'All news',
  'home.read':           'Read',

  'roster.eyebrow':            'Active roster · OWCS Pacific 2026',
  'roster.h1':                 'The Lineup',
  'roster.playersLabel':       'Players',
  'roster.regionLabel':        'Region',
  'roster.intro':              "Roster pulled from Liquipedia every six hours. Click a handle to open the player's Liquipedia page.",
  'roster.fullRoster':         'Full roster',
  'roster.attribution':        'Player data sourced from',
  'roster.attributionLicense': 'available under',
  'roster.attributionRefresh': 'Roster refreshes every 6 hours.',

  'about.eyebrow':        'About',
  'about.previously':     'Previously competing as Rankers in OWCS Pacific.',
  'about.contactHeading': 'Contact',
  'about.contactNote':    'For partnerships, press, or player inquiries, email the address above.',

  'live.liveNow':      'LIVE NOW',
  'live.startsIn':     'Starts in',
  'live.vs':           'vs',
  'live.watchNow':     'WATCH NOW',
  'live.openOnTwitch': 'Open on Twitch',

  'skipLink': 'Skip to main content',
};

// Template strings. Interpolation tokens like ${year} are tokenized before
// translation and restored after, so the translator sees stable sentinels.
const TEMPLATES = {
  'footer.foundedLine': 'Founded ${year} · ${region}',
  'footer.copyright':   '© ${year} ${name}. All rights reserved.',
  // Plural branching in hero.stats is preserved in code; we only translate
  // the "plural" form here. Singular vs plural English nuance doesn't carry
  // cleanly into Chinese anyway (it uses the same word for both).
  'hero.stats':         '${players} players across ${countries} countries.',
  'hero.record':        '${line} in Stage 1.',
  'hero.achievement':   '${placement} at ${event}.',
  'about.body':         'Najdorf Esports is a competitive Overwatch organization based in the ${region} region. We founded the org in ${year} and currently compete in OWCS Pacific. The Stage 2 main event runs June 4 through July 9, 2026. The name comes from the Najdorf Variation of the Sicilian Defence, an opening that wins by preparing one line deeper than the other side.',
};

// Terms preserved verbatim in the output (replaced with sentinels before the
// translator sees them, restored after). Sorted longest-first so multi-word
// terms match before their substrings.
const PRESERVE = [
  'OWCS PACIFIC 2026',
  'OWCS Pacific 2026',
  'OWCS Pacific',
  'Overwatch Champions Series',
  'Najdorf Esports',
  'Najdorf Variation',
  'Sicilian Defence',
  'Blizzard Entertainment, Inc.',
  'July 9, 2026',
  'Overwatch',
  'Liquipedia',
  'Blizzard',
  'Najdorf',
  'Rankers',
  'OWCS',
  'Stage 2',
  'Stage 1',
  'Pacific',
  'Twitch',
  'June 4',
];

// ---------------------------------------------------------------------------
// Translation transport
// ---------------------------------------------------------------------------

async function callMyMemory(text, langpair) {
  const u = new URL('https://api.mymemory.translated.net/get');
  u.searchParams.set('q', text);
  u.searchParams.set('langpair', langpair);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (!out) throw new Error(`MyMemory empty: ${JSON.stringify(data).slice(0, 200)}`);
  return out;
}

// Sentinels: short, all-caps, no punctuation. MyMemory leaves alphanumeric
// uppercase runs alone in our testing. The "Q" prefix is unusual enough in
// English source text to avoid collision; the trailing digits keep them
// individually addressable on restore.
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenize(text) {
  const tokens = [];
  let work = text;
  let i = 0;

  // 1) ${var} interpolations
  work = work.replace(/\$\{([^}]+)\}/g, (_m, name) => {
    const tok = `QQVAR${i}Q`;
    tokens.push({ tok, original: '${' + name + '}' });
    i++;
    return tok;
  });

  // 2) Preserve terms (longest first)
  for (const term of [...PRESERVE].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(escapeRegex(term), 'g');
    work = work.replace(re, () => {
      const tok = `QQTERM${i}Q`;
      tokens.push({ tok, original: term });
      i++;
      return tok;
    });
  }

  return { work, tokens };
}

function detokenize(text, tokens) {
  let result = text;
  for (const { tok, original } of tokens) {
    result = result.split(tok).join(original);
  }
  return result;
}

async function translate(text, langpair) {
  const { work, tokens } = tokenize(text);
  // If the tokenized form has nothing left to translate, return original.
  const strip = work.replace(/QQ(VAR|TERM)\d+Q/g, '').replace(/[\s.,!?·©]/g, '');
  if (!strip) return text;
  const raw = await callMyMemory(work, langpair);
  return detokenize(raw, tokens);
}

// ---------------------------------------------------------------------------
// Output file emitter
// ---------------------------------------------------------------------------

function escTs(s) {
  // Single-quoted string literal: backslash and single quote need escaping.
  // Keep template literals (backticks) used for templates below — escape
  // ${ separately so it doesn't get interpreted by the emitted TS.
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escTpl(s) {
  // For backtick-emitted template literals — preserve ${...}.
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
}

function emit(label, banner, dict) {
  const get = (k) => dict[k] ?? `[[MISSING:${k}]]`;
  const p = (k) => `'${escTs(get(k))}'`;
  const t = (k) => `\`${escTpl(get(k))}\``;

  return `/**
 * ${banner}
 * Auto-translated via MyMemory on ${new Date().toISOString().slice(0, 10)}.
 * Quality is best-effort. Brand terms (Najdorf Esports, Overwatch, OWCS,
 * Liquipedia, Twitch, etc.) are preserved in English. Native speakers
 * please review and PR fixes.
 */
import type { Strings } from './en';

export const ${label}: Strings = {
  nav: {
    home:    ${p('nav.home')},
    roster:  ${p('nav.roster')},
    matches: ${p('nav.matches')},
    news:    ${p('nav.news')},
    about:   ${p('nav.about')},
  },
  footer: {
    site:        ${p('footer.site')},
    follow:      ${p('footer.follow')},
    foundedLine: (year, region) => ${t('footer.foundedLine')},
    trademark:   ${p('footer.trademark')},
    copyright:   (year, name) => ${t('footer.copyright')},
  },
  hero: {
    subhead: ${p('hero.subhead')},
    stats: (players, countries) => ${t('hero.stats')},
    record: (line) => ${t('hero.record')},
    achievement: (placement, event) => ${t('hero.achievement')},
    tagline:        ${p('hero.tagline')},
    matchSchedule:  ${p('hero.matchSchedule')},
    meetRoster:     ${p('hero.meetRoster')},
  },
  home: {
    recentResults:  ${p('home.recentResults')},
    recentEmpty:    ${p('home.recentEmpty')},
    allMatches:     ${p('home.allMatches')},
    nextMatchLabel: ${p('home.nextMatchLabel')},
    latest:         ${p('home.latest')},
    allNews:        ${p('home.allNews')},
    read:           ${p('home.read')},
  },
  roster: {
    eyebrow:            ${p('roster.eyebrow')},
    h1:                 ${p('roster.h1')},
    playersLabel:       ${p('roster.playersLabel')},
    regionLabel:        ${p('roster.regionLabel')},
    intro:              ${p('roster.intro')},
    fullRoster:         ${p('roster.fullRoster')},
    attribution:        ${p('roster.attribution')},
    attributionLicense: ${p('roster.attributionLicense')},
    attributionRefresh: ${p('roster.attributionRefresh')},
  },
  about: {
    eyebrow:        ${p('about.eyebrow')},
    body: (year, region) => ${t('about.body')},
    previously:     ${p('about.previously')},
    contactHeading: ${p('about.contactHeading')},
    contactNote:    ${p('about.contactNote')},
  },
  live: {
    liveNow:      ${p('live.liveNow')},
    startsIn:     ${p('live.startsIn')},
    vs:           ${p('live.vs')},
    watchNow:     ${p('live.watchNow')},
    openOnTwitch: ${p('live.openOnTwitch')},
  },
  skipLink: ${p('skipLink')},
};
`;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

const LANGS = [
  { langpair: 'en|zh-TW', file: 'src/i18n/zh-TW.ts', label: 'zhTW', banner: 'Traditional Chinese (zh-TW).' },
  { langpair: 'en|zh-CN', file: 'src/i18n/zh-CN.ts', label: 'zhCN', banner: 'Simplified Chinese (zh-CN).' },
];

async function buildDict(langpair) {
  const dict = {};
  const all = { ...PLAIN, ...TEMPLATES };
  let n = 0;
  const total = Object.keys(all).length;
  for (const [k, v] of Object.entries(all)) {
    n++;
    process.stderr.write(`  [${langpair}] ${n}/${total} ${k} ... `);
    try {
      const out = await translate(v, langpair);
      dict[k] = out;
      process.stderr.write(`✓\n`);
    } catch (e) {
      process.stderr.write(`✗ ${e.message}\n`);
      dict[k] = v; // fall back to English so the file still compiles
    }
    // MyMemory anonymous tier: stay polite, ~5 req/s
    await new Promise(r => setTimeout(r, 250));
  }
  return dict;
}

async function main() {
  for (const lang of LANGS) {
    console.error(`\nTranslating ${lang.langpair} →`);
    const dict = await buildDict(lang.langpair);
    const out = emit(lang.label, lang.banner, dict);
    const path = resolve(ROOT, lang.file);
    await writeFile(path, out, 'utf8');
    console.error(`  wrote ${path}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
