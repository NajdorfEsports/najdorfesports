#!/usr/bin/env node
/*
 * fetch-liquipedia.mjs
 *
 * Pulls roster, achievements, and OWCS match data from Liquipedia. Writes:
 *
 *   src/data/roster.json        — active player list (handle, role, country)
 *   src/data/matches.json       — upcoming + recent matches involving our team
 *   src/data/achievements.json  — tournament placements
 *
 * Each output is merged at render time with a sibling *.manual.json that wins
 * on key collision, so manual corrections always survive a Liquipedia refresh.
 *
 * COMPLIANCE WITH LIQUIPEDIA TERMS OF USE
 * ---------------------------------------
 * Liquipedia content is licensed under CC BY-SA 3.0 and the API is governed by
 * https://liquipedia.net/api-terms-of-use. We comply with those terms here by:
 *
 *   1. Setting a descriptive User-Agent that identifies this site and provides
 *      a contact address. The default fetch UA is BANNED by Liquipedia.
 *   2. Requesting gzip-encoded responses via Accept-Encoding.
 *   3. Honoring rate limits: action=parse at most once per 30 seconds; any
 *      non-parse follow-up at most once per 2 seconds.
 *   4. Attributing Liquipedia and the CC BY-SA 3.0 license on the pages that
 *      display the data (see src/pages/matches.astro, src/pages/roster.astro).
 *
 * Every output is FAIL-SOFT: on any HTTP error, parse error, or empty result,
 * the corresponding output file is left untouched. The site never deploys
 * with empty data because of a single failed API call.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'src', 'data');
const MATCHES_PATH = join(DATA, 'matches.json');
const ROSTER_PATH = join(DATA, 'roster.json');
const ACHIEVEMENTS_PATH = join(DATA, 'achievements.json');

const USER_AGENT =
  'NajdorfEsportsSite/1.0 (https://najdorfesports.gg; owner@najdorfesports.gg)';

// Liquipedia identifiers used to find OUR team inside the tournament pages.
// When the team page on Liquipedia is renamed from "Rankers" to "Najdorf
// Esports", BOTH names get tried — whichever appears in the wikitext wins.
// Add new aliases here (most-current first) and the pipeline keeps working
// with zero downtime through the rename window.
const TEAM_LIQUIPEDIA_NAMES = ['Najdorf Esports', 'Rankers'];

// Source tournament pages, in priority order. The fetcher walks the list and
// keeps results from every page where our team is present, so adding a new
// stage just means prepending it here. Each page costs one parse call +
// 30s rate-limit sleep, so keep the list short (≤4 pages per run).
const TOURNAMENT_PAGES = [
  'Overwatch_Champions_Series/2026/Asia/Stage_2/Pacific',
  'Overwatch_Champions_Series/2026/Asia/Stage_1/Pacific',
];
const API = 'https://liquipedia.net/overwatch/api.php';
const PARSE_INTERVAL_MS = 30_000; // Liquipedia: parse rate-limited to 1 per 30 s.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchParse(page) {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'gzip',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// ----- Country normalization ------------------------------------------------

const COUNTRY_BY_FLAG = {
  hk: 'Hong Kong',
  tw: 'Taiwan',
  cn: 'China',
  jp: 'Japan',
  kr: 'South Korea',
  us: 'United States',
  ca: 'Canada',
  au: 'Australia',
  nz: 'New Zealand',
  sg: 'Singapore',
  my: 'Malaysia',
  th: 'Thailand',
  vn: 'Vietnam',
  ph: 'Philippines',
  id: 'Indonesia',
  in: 'India',
  gb: 'United Kingdom',
  uk: 'United Kingdom',
  de: 'Germany',
  fr: 'France',
  es: 'Spain',
  it: 'Italy',
  pl: 'Poland',
  se: 'Sweden',
  no: 'Norway',
  dk: 'Denmark',
  fi: 'Finland',
};

const NAME_TO_CODE = Object.fromEntries(
  Object.entries(COUNTRY_BY_FLAG).map(([k, v]) => [v.toLowerCase(), k]),
);

function normalizeCountry(raw) {
  if (!raw) return {};
  const cleaned = raw.trim().toLowerCase();
  if (cleaned.length === 2 && COUNTRY_BY_FLAG[cleaned]) {
    return { countryCode: cleaned, country: COUNTRY_BY_FLAG[cleaned] };
  }
  const code = NAME_TO_CODE[cleaned];
  if (code) return { countryCode: code, country: COUNTRY_BY_FLAG[code] };
  // Capitalize for display when we don't have a code match.
  const display = raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  return { country: display };
}

// ----- Role normalization ---------------------------------------------------

function normalizeRole(raw) {
  if (!raw) return null;
  const r = raw.trim().toLowerCase();
  if (/^(tank|t|main\s*tank|off\s*tank)$/.test(r)) return 'Tank';
  if (/^(dps|d|damage|dmg|hitscan|projectile|flex\s*dps)$/.test(r)) return 'DPS';
  if (/^(sup|support|s|main\s*support|flex\s*support|healer|heal)$/.test(r)) return 'Support';
  if (/^flex$/.test(r)) return 'Flex';
  if (/^(coach|head\s*coach|asst\s*coach)$/.test(r)) return 'Coach';
  if (/^(manager|gm|general\s*manager|owner)$/.test(r)) return 'Manager';
  return null;
}

// ----- Roster extraction ----------------------------------------------------

/**
 * Find the roster for a given team in a tournament wikitext blob. Liquipedia's
 * Overwatch tournament participant lists use the shape:
 *
 *   |{{Opponent|<TeamName>
 *       |{{Person|<handle>|flag=<code>|role=<dps|tank|sup>|played=<bool>}}
 *       ...
 *   }}
 *
 * We locate the `{{Opponent|<TeamName>` block, then pull every `{{Person|…}}`
 * inside it. Outside that block we ignore — other teams' rosters live there.
 *
 * Returns array of { handle, role?, country?, countryCode?, status, statusNote? }
 */
function extractRoster(wikitext, teamName) {
  if (typeof wikitext !== 'string' || wikitext.length === 0) return [];

  // Find the team's Opponent block — match across newlines until the closing
  // `}}` that pairs with the opening `{{Opponent|`.
  const opener = new RegExp(`\\{\\{Opponent\\|${escapeRegex(teamName)}\\b`, 'i');
  const startMatch = wikitext.match(opener);
  if (!startMatch) return [];

  const startIdx = startMatch.index + startMatch[0].length;
  const block = readBalancedBraces(wikitext, startIdx);
  if (!block) return [];

  const out = new Map();
  const personRe = /\{\{Person\s*\|([^{}]*?)\}\}/gi;
  let m;
  while ((m = personRe.exec(block)) !== null) {
    const body = m[1];
    // Person template's first positional arg is the handle.
    const positional = body.split('|')[0]?.trim();
    const params = parseTemplateParams('|' + body);
    const handle = positional || params.id || params.name;
    if (!handle) continue;

    const role = normalizeRole(params.role || params.position);
    const flag = params.flag || params.nationality || params.country;
    const realName = params.name && params.name !== handle ? params.name : undefined;

    const playedFalse = params.played?.toLowerCase() === 'false';
    let status = 'active';
    let statusNote;
    if (playedFalse) {
      status = 'dnp';
      statusNote = 'DNP · Stage 1';
    }

    out.set(handle.toLowerCase(), {
      handle,
      ...(role ? { role } : {}),
      ...normalizeCountry(flag),
      ...(realName ? { realName } : {}),
      status,
      ...(statusNote ? { statusNote } : {}),
    });
  }

  return Array.from(out.values());
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Starting at `idx` inside `text`, return the substring up to (but not
 * including) the closing `}}` that balances the surrounding `{{` opened
 * before `idx`. Tracks nested `{{ }}` pairs so inner templates don't trip us.
 */
function readBalancedBraces(text, idx) {
  let depth = 1;
  let i = idx;
  while (i < text.length - 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '{' && next === '{') {
      depth += 1;
      i += 2;
      continue;
    }
    if (ch === '}' && next === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(idx, i);
      i += 2;
      continue;
    }
    i += 1;
  }
  return null;
}

function parseTemplateParams(body) {
  // Splits a template body on top-level "|". Doesn't recurse into nested templates
  // beyond the simplest cases, which is fine for the param shapes we read.
  const params = {};
  let depth = 0;
  let buf = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    const next = body[i + 1];
    if (ch === '{' && next === '{') {
      depth += 1;
      buf += '{{';
      i += 1;
      continue;
    }
    if (ch === '}' && next === '}') {
      depth -= 1;
      buf += '}}';
      i += 1;
      continue;
    }
    if (ch === '|' && depth === 0) {
      assignParam(params, buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  assignParam(params, buf);
  return params;
}

function assignParam(params, raw) {
  const eq = raw.indexOf('=');
  if (eq < 0) return;
  const key = raw.slice(0, eq).trim().toLowerCase();
  const value = raw.slice(eq + 1).trim();
  if (!key) return;
  params[key] = value;
}

function normalizeDate(raw) {
  // Accept "YYYY-MM-DD" or "{{date|YYYY|MM|DD}}".
  const direct = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (direct) return `${direct[1]}-${direct[2]}-${direct[3]}`;
  const dateTpl = raw.match(/\{\{date\|(\d{4})\|(\d{1,2})\|(\d{1,2})/i);
  if (dateTpl) {
    return `${dateTpl[1]}-${dateTpl[2].padStart(2, '0')}-${dateTpl[3].padStart(2, '0')}`;
  }
  return raw;
}

// ----- Achievements extraction ----------------------------------------------

function extractAchievements(wikitext) {
  if (typeof wikitext !== 'string' || wikitext.length === 0) return [];

  // Liquipedia uses {{Achievements|...}} or wikitables with placement cells.
  // We do a low-effort scan for placement strings near event names.
  const out = [];
  const rowRe =
    /\|\s*place\s*=\s*([^|\n}]+)[\s\S]{0,200}?\|\s*tournament\s*=\s*([^|\n}]+)[\s\S]{0,200}?\|\s*date\s*=\s*([^|\n}]+)/gi;
  let m;
  while ((m = rowRe.exec(wikitext)) !== null) {
    const placement = m[1].trim();
    const event = m[2].trim();
    const date = normalizeDate(m[3].trim());
    const id = `liquipedia-${event}-${date}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
    out.push({ id, date, event, placement });
  }
  return out;
}

// ----- Matches extraction ---------------------------------------------------

// Liquipedia timezone abbreviation → UTC offset in hours.
const TZ_OFFSETS = {
  ICT: 7, WIB: 7, BKK: 7,
  CST: 8, CT: 8, MYT: 8, SGT: 8, PHT: 8, AWST: 8, HKT: 8,
  KST: 9, JST: 9,
  AEDT: 11, AEST: 10,
  NZST: 12, NZDT: 13,
  PST: -8, PDT: -7, MST: -7, MDT: -6, EST: -5, EDT: -4,
  GMT: 0, UTC: 0, BST: 1, CET: 1, CEST: 2, EET: 2,
};

function parseMatchDate(raw) {
  if (!raw) return null;
  // Strip Liquipedia "Abbr" template wrappers, normalize whitespace.
  const cleaned = raw
    .replace(/\{\{Abbr\/(\w+)\|?.*?\}\}/g, '$1')
    .replace(/\{\{Abbr\|(\w+)\|?.*?\}\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  // Pattern: "YYYY-MM-DD[ - ]HH:MM[ TZ]"
  const m = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s*[-T]\s*(\d{1,2}):(\d{2}))?(?:\s*([A-Z]{2,5}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi, tz] = m;
  if (!h) return `${y}-${mo}-${d}T00:00:00Z`;
  const offset = tz && tz in TZ_OFFSETS ? TZ_OFFSETS[tz] : 0;
  const utcHour = parseInt(h, 10) - offset;
  const dt = new Date(Date.UTC(+y, +mo - 1, +d, utcHour, +mi));
  return dt.toISOString();
}

function extractMatches(wikitext, teamName, defaultTournament, sourcePage) {
  const matches = [];
  if (typeof wikitext !== 'string' || wikitext.length === 0) return matches;

  const sourceUrl = sourcePage
    ? `https://liquipedia.net/overwatch/${sourcePage}`
    : undefined;

  const matchOpener = /\{\{Match\b/g;
  const teamLc = teamName.toLowerCase();
  let m;
  let counter = 0;

  while ((m = matchOpener.exec(wikitext)) !== null) {
    const block = readBalancedBraces(wikitext, m.index + m[0].length);
    if (!block) continue;
    if (!block.toLowerCase().includes(teamLc)) continue;

    const params = parseTemplateParams(block);
    const opp1 = (params.opponent1?.match(/TeamOpponent\|([^|}\n]+)/i)?.[1] ?? '').trim();
    const opp2 = (params.opponent2?.match(/TeamOpponent\|([^|}\n]+)/i)?.[1] ?? '').trim();
    if (!opp1 || !opp2) continue;

    // Determine which side is us. Liquipedia uses informal casing; compare case-insensitively.
    let ourSide;
    if (opp1.toLowerCase() === teamLc) ourSide = 1;
    else if (opp2.toLowerCase() === teamLc) ourSide = 2;
    else continue;

    const opponent = ourSide === 1 ? opp2 : opp1;
    const date = parseMatchDate(params.date ?? '');
    if (!date) continue;

    // Maps & scores
    const mapScores = [];
    let ourMapWins = 0;
    let theirMapWins = 0;
    for (let i = 1; i <= 9; i++) {
      const mapRaw = params[`map${i}`];
      if (!mapRaw) continue;
      const mp = parseTemplateParams('|' + mapRaw.replace(/^\{\{Map\|?/, '').replace(/\}\}$/, ''));
      const mapName = mp.map ?? '';
      const score1 = Number(mp.score1);
      const score2 = Number(mp.score2);
      const winner = parseInt(mp.winner ?? '0', 10);
      if (!mapName || Number.isNaN(score1) || Number.isNaN(score2)) continue;
      mapScores.push({
        map: mapName,
        ourScore: ourSide === 1 ? score1 : score2,
        theirScore: ourSide === 1 ? score2 : score1,
      });
      if (winner === ourSide) ourMapWins += 1;
      else if (winner && winner !== ourSide) theirMapWins += 1;
    }

    // Result inference.
    const now = Date.now();
    const past = +new Date(date) < now;
    let result = 'tbd';
    if (mapScores.length > 0 && (ourMapWins > 0 || theirMapWins > 0)) {
      result = ourMapWins > theirMapWins ? 'win' : 'loss';
    } else if (!past) {
      result = 'tbd';
    }

    const stream = params.twitch
      ? `https://twitch.tv/${params.twitch.trim()}`
      : params.stream
      ? params.stream.trim().startsWith('http')
        ? params.stream.trim()
        : `https://${params.stream.trim()}`
      : undefined;

    counter += 1;
    const slug = defaultTournament
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    matches.push({
      id: `liquipedia-${slug}-${counter}-${date.replace(/[^0-9]/g, '').slice(0, 12)}`,
      date,
      opponent,
      tournament: defaultTournament,
      format: params.bestof ? `BO${params.bestof.trim()}` : 'BO5',
      ...(stream ? { streamUrl: stream } : {}),
      ...(sourceUrl ? { liquipediaUrl: sourceUrl } : {}),
      result,
      ...(mapScores.length > 0 ? { mapScores } : {}),
    });
  }
  return matches;
}

// ----- Output helpers -------------------------------------------------------

async function safeWrite(path, label, data) {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn(`[liquipedia] ${label}: no entries found, preserving existing ${path}.`);
    return;
  }
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[liquipedia] ${label}: wrote ${data.length} entries to ${path}.`);
}

// ----- Per-player enrichment ------------------------------------------------

/**
 * Pull bio + signature heroes from a player's individual Liquipedia page.
 * Returns null when the page doesn't exist (404 / missingtitle). Liquipedia
 * has stub pages for some players; we extract whatever's there.
 */
async function fetchPlayerBio(handle) {
  let json;
  try {
    json = await fetchParse(handle);
  } catch (err) {
    console.warn(`[liquipedia]   ${handle}: page fetch failed (${err?.message ?? err})`);
    return null;
  }
  const wt = json?.parse?.wikitext?.['*'];
  if (typeof wt !== 'string' || wt.length < 50) return null;

  // Locate the Infobox player block.
  const ix = wt.indexOf('{{Infobox player');
  if (ix < 0) return null;
  const body = readBalancedBraces(wt, ix + '{{Infobox player'.length);
  if (!body) return null;
  const p = parseTemplateParams(body);

  const heroes = [];
  for (let i = 1; i <= 6; i += 1) {
    const key = i === 1 ? 'hero' : `hero${i}`;
    const v = p[key];
    if (v && v.trim() && !heroes.includes(v.trim())) heroes.push(v.trim());
  }

  // Roles can be comma-separated ("Coach, Tank").
  const rolesRaw = (p.roles ?? '').split(',').map((r) => normalizeRole(r.trim())).filter(Boolean);

  const out = {};
  if (p.romanized_name) out.realName = p.romanized_name.trim();
  else if (p.name && !/[一-鿿]/.test(p.name)) out.realName = p.name.trim();
  if (p.birth_date) out.birthDate = normalizeDate(p.birth_date.trim());
  if (heroes.length > 0) out.signatureHeroes = heroes;
  if (p.twitter && p.twitter.trim()) out.twitter = `https://twitter.com/${p.twitter.trim()}`;
  if (p.twitch && p.twitch.trim()) out.twitch = `https://twitch.tv/${p.twitch.trim()}`;
  if (rolesRaw.length > 1) out.altRoles = rolesRaw.slice(1);
  return Object.keys(out).length > 0 ? out : null;
}

// ----- Helpers --------------------------------------------------------------

/**
 * Try every team alias against a wikitext blob and return the first non-empty
 * extraction result, along with the alias that matched. Returns null if no
 * alias finds anything.
 */
function withFirstMatchingName(wikitext, names, extractor) {
  for (const name of names) {
    const out = extractor(wikitext, name);
    if (out && out.length > 0) return { name, result: out };
  }
  return null;
}

/**
 * Derive a human-friendly tournament label from a page slug.
 * e.g. "Overwatch_Champions_Series/2026/Asia/Stage_2/Pacific"
 *   -> "OWCS Pacific 2026 — Stage 2"
 */
function labelFromPage(pageSlug) {
  const m = pageSlug.match(/(\d{4})\/(?:[^/]+\/)?Stage_(\d+)\/(\w+)/i);
  if (m) return `OWCS ${m[3]} ${m[1]} · Stage ${m[2]}`;
  return pageSlug.replace(/_/g, ' ');
}

// ----- Main -----------------------------------------------------------------

(async () => {
  const allMatches = [];
  /** First page to actually contain our team — used as the roster source.
   *  Defaults to the highest-priority page so the most recent stage wins. */
  let primaryWikitext = null;
  let primaryPage = null;
  let primaryName = null;

  for (let i = 0; i < TOURNAMENT_PAGES.length; i += 1) {
    const page = TOURNAMENT_PAGES[i];
    const label = labelFromPage(page);
    if (i > 0) {
      console.log(`[liquipedia] sleeping ${PARSE_INTERVAL_MS / 1000}s (rate limit).`);
      await sleep(PARSE_INTERVAL_MS);
    }

    try {
      const json = await fetchParse(page);
      const wikitext = json?.parse?.wikitext?.['*'];
      if (typeof wikitext !== 'string' || wikitext.length === 0) {
        console.warn(`[liquipedia] ${label}: empty wikitext, skipping.`);
        continue;
      }

      // Find which team alias is present on this page.
      const matchHit = withFirstMatchingName(
        wikitext,
        TEAM_LIQUIPEDIA_NAMES,
        (wt, n) => extractMatches(wt, n, label, page),
      );

      if (matchHit) {
        console.log(`[liquipedia] ${label}: found ${matchHit.result.length} matches (team alias: "${matchHit.name}").`);
        allMatches.push(...matchHit.result);
      } else {
        console.log(`[liquipedia] ${label}: no matches found for any team alias.`);
      }

      // First page that has us becomes the roster source. Walking the list in
      // priority order means Stage 2 wins when it exists, Stage 1 fills in
      // until then.
      if (!primaryWikitext) {
        const rosterHit = withFirstMatchingName(
          wikitext,
          TEAM_LIQUIPEDIA_NAMES,
          (wt, n) => extractRoster(wt, n),
        );
        if (rosterHit) {
          primaryWikitext = wikitext;
          primaryPage = label;
          primaryName = rosterHit.name;
          console.log(`[liquipedia] ${label}: primary source for roster (alias: "${primaryName}", ${rosterHit.result.length} players).`);
        }
      }
    } catch (err) {
      console.warn(`[liquipedia] ${label}: fetch failed (${err?.message ?? err}).`);
    }
  }

  // Roster comes from the highest-priority page that mentioned us.
  if (primaryWikitext) {
    const roster = extractRoster(primaryWikitext, primaryName);

    // Enrich every roster entry with bio + signature heroes from the player's
    // individual Liquipedia page. Rate-limited at one parse call per 30s.
    // Players without a page (404) silently keep the tournament-page data only.
    if (roster.length > 0) {
      console.log(`[liquipedia] enriching ${roster.length} roster entries from individual pages...`);
      for (let i = 0; i < roster.length; i += 1) {
        const entry = roster[i];
        console.log(`[liquipedia] sleeping ${PARSE_INTERVAL_MS / 1000}s (rate limit) before ${entry.handle}.`);
        await sleep(PARSE_INTERVAL_MS);
        const bio = await fetchPlayerBio(entry.handle);
        if (bio) {
          // Fetcher fields fill in, but never overwrite what the tournament
          // page already supplied (role, country code, status).
          for (const [k, v] of Object.entries(bio)) {
            if (entry[k] === undefined) entry[k] = v;
          }
          const summary = [
            bio.realName ? `name=${bio.realName}` : null,
            bio.signatureHeroes ? `heroes=${bio.signatureHeroes.join('/')}` : null,
          ].filter(Boolean).join(' ');
          console.log(`[liquipedia]   ${entry.handle}: ${summary || '(no extra fields)'}`);
        } else {
          console.log(`[liquipedia]   ${entry.handle}: no individual page`);
        }
      }
    }

    await safeWrite(ROSTER_PATH, 'roster', roster);

    const achievements = extractAchievements(primaryWikitext);
    achievements.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    await safeWrite(ACHIEVEMENTS_PATH, 'achievements', achievements);
  } else {
    console.warn('[liquipedia] no roster source page found — preserving existing roster.json.');
  }

  // Dedup matches across pages on id, sort soonest-first, write.
  const byId = new Map();
  for (const m of allMatches) byId.set(m.id, m);
  const merged = Array.from(byId.values()).sort(
    (a, b) => +new Date(a.date) - +new Date(b.date),
  );
  await safeWrite(MATCHES_PATH, 'matches', merged);

  process.exit(0);
})();
