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

// Flip this once Liquipedia's team page is updated from "Rankers" to the new name.
const TEAM_LIQUIPEDIA_NAME = 'Rankers';

// Source pages. Liquipedia doesn't have a standalone team page for Rankers yet,
// so the roster comes from the most recent tournament's participant list.
const ROSTER_SOURCE_PAGE = 'Overwatch_Champions_Series/2026/Asia/Stage_1/Pacific';
const MATCHES_SOURCE_PAGE = 'Overwatch_Champions_Series/2026/Asia/Stage_2/Pacific';
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
      statusNote = 'DNP — Stage 1';
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

// ----- Matches extraction (kept from v1, slightly hardened) ----------------

function extractMatches(wikitext, teamName) {
  const matches = [];
  if (typeof wikitext !== 'string' || wikitext.length === 0) return matches;

  const matchBlockRe = /\{\{Match\b([\s\S]*?)\}\}/gi;
  let m;
  let counter = 0;
  while ((m = matchBlockRe.exec(wikitext)) !== null) {
    const block = m[1];
    if (!block.toLowerCase().includes(teamName.toLowerCase())) continue;

    const dateMatch = block.match(
      /date\s*=\s*([0-9]{4}-[0-9]{2}-[0-9]{2}(?:[ T][0-9]{2}:[0-9]{2}(?::[0-9]{2})?)?)/i,
    );
    const opponentMatches = [...block.matchAll(/TeamOpponent\|([^|}\n]+)/gi)].map((x) =>
      x[1].trim(),
    );
    const tournamentMatch = block.match(/tournament\s*=\s*([^|\n}]+)/i);
    const formatMatch = block.match(/bestof\s*=\s*(\d+)/i);
    const streamMatch = block.match(/stream\s*=\s*([^|\n}]+)/i);

    const opponent = opponentMatches.find(
      (o) => o.toLowerCase() !== teamName.toLowerCase(),
    );
    if (!opponent || !dateMatch) continue;

    counter += 1;
    matches.push({
      id: `liquipedia-${counter}-${dateMatch[1].replace(/[^0-9]/g, '')}`,
      date: dateMatch[1].includes('T')
        ? `${dateMatch[1]}Z`
        : `${dateMatch[1].replace(' ', 'T')}:00Z`,
      opponent,
      tournament: tournamentMatch ? tournamentMatch[1].trim() : 'OWCS Pacific Stage 2',
      format: formatMatch ? `BO${formatMatch[1]}` : 'BO5',
      ...(streamMatch ? { streamUrl: `https://${streamMatch[1].trim()}` } : {}),
      result: 'tbd',
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

// ----- Main -----------------------------------------------------------------

(async () => {
  // Fetch the matches source (Stage 2 main event) for upcoming/recent matches.
  try {
    const json = await fetchParse(MATCHES_SOURCE_PAGE);
    const wikitext = json?.parse?.wikitext?.['*'];
    const matches = extractMatches(wikitext, TEAM_LIQUIPEDIA_NAME);
    matches.sort((a, b) => +new Date(a.date) - +new Date(b.date));
    await safeWrite(MATCHES_PATH, 'matches', matches);
  } catch (err) {
    console.warn(`[liquipedia] matches fetch failed: ${err?.message ?? err}`);
  }

  // Respect parse rate limit before the second call.
  console.log(`[liquipedia] sleeping ${PARSE_INTERVAL_MS / 1000}s before roster page fetch.`);
  await sleep(PARSE_INTERVAL_MS);

  // Fetch the roster source (Stage 1 tournament participant list).
  try {
    const json = await fetchParse(ROSTER_SOURCE_PAGE);
    const wikitext = json?.parse?.wikitext?.['*'];

    const roster = extractRoster(wikitext, TEAM_LIQUIPEDIA_NAME);
    await safeWrite(ROSTER_PATH, 'roster', roster);

    // Achievements: Stage 1 tournament page doesn't carry placements directly,
    // and there's no standalone team page. Keep this best-effort; manual
    // achievements live in achievements.manual.json regardless.
    const achievements = extractAchievements(wikitext);
    achievements.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    await safeWrite(ACHIEVEMENTS_PATH, 'achievements', achievements);
  } catch (err) {
    console.warn(`[liquipedia] roster page fetch failed: ${err?.message ?? err}`);
  }

  process.exit(0);
})();
