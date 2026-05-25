#!/usr/bin/env node
/*
 * fetch-player.mjs
 *
 * Pulls a single player's profile from Liquipedia and shapes it into a
 * roster.manual.json entry. Useful when:
 *
 *   - A new player joins mid-stage and Liquipedia's team page hasn't
 *     listed them yet (the weekly team-fetcher won't see them).
 *   - You need to refresh one player's data (heroes, country, socials)
 *     without re-running the full weekly fetch.
 *
 * Usage
 * -----
 *   npm run fetch:player https://liquipedia.net/overwatch/Akie
 *   npm run fetch:player Akie
 *   npm run fetch:player Akie --apply
 *
 * Without --apply the script prints the JSON entry to stdout so you can
 * inspect it. With --apply it merges the entry into roster.manual.json
 * (by `handle`), preserving any keys you've already set manually.
 *
 * It does NOT download hero icons. After running this, also run
 * `npm run fetch:heroes` so any new signature heroes get their portraits.
 *
 * COMPLIANCE
 * ----------
 * Same Liquipedia ToS posture as scripts/fetch-liquipedia.mjs: descriptive
 * User-Agent, gzip-aware. One parse call per run, so no rate-limit dance
 * needed for a single fetch.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROSTER_MANUAL = join(__dirname, '..', 'src', 'data', 'roster.manual.json');

const USER_AGENT =
  'NajdorfEsportsSite/1.0 (https://najdorfesports.gg; owner@najdorfesports.gg)';
const API = 'https://liquipedia.net/overwatch/api.php';
const BASE_PAGE_URL = 'https://liquipedia.net/overwatch/';

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const apply = args.includes('--apply');

if (positional.length === 0) {
  console.error('Usage: npm run fetch:player <liquipedia-url-or-handle> [--apply]');
  console.error('');
  console.error('Examples:');
  console.error('  npm run fetch:player https://liquipedia.net/overwatch/Akie');
  console.error('  npm run fetch:player Akie');
  console.error('  npm run fetch:player Akie --apply        # writes to roster.manual.json');
  process.exit(1);
}

// Accept either a full URL or a bare handle. URLs are split on the last
// /overwatch/ path segment so subpaths like /Akie/Matches still work.
function resolveHandle(input) {
  const m = input.match(/\/overwatch\/([^?#/]+)/);
  return decodeURIComponent(m ? m[1] : input);
}

const handle = resolveHandle(positional[0]);

// ---------------------------------------------------------------------------
// Liquipedia fetch
// ---------------------------------------------------------------------------

async function fetchWikitext(page) {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'gzip',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const j = await res.json();
  if (j.error) throw new Error(`Liquipedia API: ${j.error.info}`);
  return j?.parse?.wikitext?.['*'] || '';
}

// ---------------------------------------------------------------------------
// Wikitext / Infobox parsing
// ---------------------------------------------------------------------------

/** Pull the {{Infobox player|...|}} block from a player page wikitext. */
function extractInfobox(wikitext) {
  const opener = wikitext.search(/\{\{Infobox\s+player\b/i);
  if (opener < 0) return null;
  // Find the matching closing }} for the opening {{ at `opener`.
  let depth = 0;
  let i = opener;
  while (i < wikitext.length - 1) {
    if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
      depth += 1;
      i += 2;
      continue;
    }
    if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
      depth -= 1;
      if (depth === 0) {
        return wikitext.slice(opener, i + 2);
      }
      i += 2;
      continue;
    }
    i += 1;
  }
  return null;
}

/** Parse the body of a template into a key→value map. Splits on top-level `|`
 *  only (nested templates kept intact). */
function parseTemplateFields(templateBlock) {
  // Strip outer {{ }}
  const inner = templateBlock.replace(/^\{\{/, '').replace(/\}\}$/, '');
  // Drop the template name (everything before the first top-level `|`).
  const params = {};
  let depth = 0;
  let parts = [];
  let buf = '';
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    const next = inner[i + 1];
    if (ch === '{' && next === '{') { depth += 1; buf += '{{'; i += 1; continue; }
    if (ch === '}' && next === '}') { depth -= 1; buf += '}}'; i += 1; continue; }
    if (ch === '[' && next === '[') { depth += 1; buf += '[['; i += 1; continue; }
    if (ch === ']' && next === ']') { depth -= 1; buf += ']]'; i += 1; continue; }
    if (ch === '|' && depth === 0) {
      parts.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf) parts.push(buf);
  // Drop the template name (parts[0]).
  for (const part of parts.slice(1)) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim().toLowerCase();
    const value = part.slice(eq + 1).replace(/<!--[\s\S]*?-->/g, '').trim();
    if (key) params[key] = value;
  }
  return params;
}

// ---------------------------------------------------------------------------
// Field normalization
// ---------------------------------------------------------------------------

/** Liquipedia uses "Korea" for South Korea; map common aliases to ISO. */
const COUNTRY_BY_NAME = {
  'taiwan': { country: 'Taiwan', countryCode: 'tw' },
  'hong kong': { country: 'Hong Kong', countryCode: 'hk' },
  'china': { country: 'China', countryCode: 'cn' },
  'japan': { country: 'Japan', countryCode: 'jp' },
  'south korea': { country: 'South Korea', countryCode: 'kr' },
  'korea': { country: 'South Korea', countryCode: 'kr' },
  'korea, republic of': { country: 'South Korea', countryCode: 'kr' },
  'thailand': { country: 'Thailand', countryCode: 'th' },
  'vietnam': { country: 'Vietnam', countryCode: 'vn' },
  'singapore': { country: 'Singapore', countryCode: 'sg' },
  'malaysia': { country: 'Malaysia', countryCode: 'my' },
  'philippines': { country: 'Philippines', countryCode: 'ph' },
  'indonesia': { country: 'Indonesia', countryCode: 'id' },
  'australia': { country: 'Australia', countryCode: 'au' },
  'new zealand': { country: 'New Zealand', countryCode: 'nz' },
  'united states': { country: 'United States', countryCode: 'us' },
  'canada': { country: 'Canada', countryCode: 'ca' },
};

function normalizeCountry(raw) {
  if (!raw) return {};
  const key = raw.trim().toLowerCase();
  if (COUNTRY_BY_NAME[key]) return COUNTRY_BY_NAME[key];
  // 2-letter code passed through
  if (/^[a-z]{2}$/.test(key)) {
    const match = Object.values(COUNTRY_BY_NAME).find((c) => c.countryCode === key);
    if (match) return match;
    return { countryCode: key };
  }
  // Unknown country: capitalize for display, leave code blank
  const display = raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  return { country: display };
}

/** Map Liquipedia's |roles= field to our Role union, splitting on common
 *  delimiters so "Tank, Flex" gives role=Tank + altRoles=[Flex]. */
function normalizeRoles(raw) {
  if (!raw) return {};
  const tokens = raw.split(/[,/]+/).map((t) => t.trim()).filter(Boolean);
  const mapped = tokens
    .map((t) => {
      const lc = t.toLowerCase();
      if (/(tank|main tank|off tank)/.test(lc)) return 'Tank';
      if (/(dps|damage|hitscan|projectile|flex dps)/.test(lc)) return 'DPS';
      if (/(support|sup|main support|flex support|healer)/.test(lc)) return 'Support';
      if (/^flex$/.test(lc)) return 'Flex';
      if (/coach/.test(lc)) return 'Coach';
      if (/(manager|owner|gm)/.test(lc)) return 'Manager';
      return null;
    })
    .filter(Boolean);
  if (mapped.length === 0) return {};
  const [primary, ...rest] = Array.from(new Set(mapped));
  return rest.length > 0
    ? { role: primary, altRoles: rest }
    : { role: primary };
}

/** Title-case a hero name in the way heroes.json keys are written. */
function normalizeHero(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/\[\[|\]\]/g, '').trim();
  if (!cleaned) return null;
  // Special cases for heroes with non-standard capitalization or punctuation.
  const overrides = {
    'd.va':           'D.Va',
    'dva':            'D.Va',
    'wrecking ball':  'Wrecking Ball',
    'soldier: 76':    'Soldier: 76',
    'soldier 76':     'Soldier: 76',
    'lucio':          'Lucio',
    'lúcio':          'Lucio',
    'torbjorn':       'Torbjörn',
    'torbjörn':       'Torbjörn',
  };
  const key = cleaned.toLowerCase();
  if (overrides[key]) return overrides[key];
  // Default: title-case each word.
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildSocial(template, raw) {
  if (!raw) return null;
  // Strip whitespace and any wiki markup; Liquipedia sometimes wraps
  // social values in {{Twitter|...}} templates.
  const stripped = raw.replace(/\{\{[^}|]+\|([^}]+)\}\}/g, '$1').trim().replace(/^@/, '');
  if (!stripped) return null;
  return template.replace('{handle}', stripped);
}

// ---------------------------------------------------------------------------
// Build the roster entry
// ---------------------------------------------------------------------------

function buildEntry(fields, handle) {
  const out = {
    handle: fields.id || handle,
    ...normalizeRoles(fields.roles || fields.role),
  };

  const countryInfo = normalizeCountry(fields.country || fields.flag || fields.nationality);
  if (countryInfo.country) out.country = countryInfo.country;
  if (countryInfo.countryCode) out.countryCode = countryInfo.countryCode;

  const status = (fields.status || '').toLowerCase();
  if (status && status !== 'active') {
    // Respect Liquipedia's status field for non-active players, but keep
    // the active default so an un-retired player Liquipedia hasn't caught
    // up on yet doesn't accidentally render as inactive on our site. The
    // owner can override via roster.manual.json.
    out.status = status === 'retired' ? 'inactive' : status;
  } else {
    out.status = 'active';
  }

  // Real name: prefer romanized form (Latin script for the card label).
  const realName = fields.romanized_name || (
    fields.name && /^[\p{Script=Latin}\s.'-]+$/u.test(fields.name) ? fields.name : null
  );
  if (realName) out.realName = realName;

  if (fields.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(fields.birth_date)) {
    out.birthDate = fields.birth_date;
  }

  // Signature heroes — Liquipedia uses |hero=, |hero2=, |hero3=, ...
  const heroes = [];
  const firstHero = normalizeHero(fields.hero);
  if (firstHero) heroes.push(firstHero);
  for (let i = 2; i <= 6; i++) {
    const h = normalizeHero(fields[`hero${i}`]);
    if (h && !heroes.includes(h)) heroes.push(h);
  }
  if (heroes.length > 0) out.signatureHeroes = heroes;

  // Socials.
  const twitter = buildSocial('https://x.com/{handle}', fields.twitter);
  if (twitter) out.twitter = twitter;
  const twitch = buildSocial('https://twitch.tv/{handle}', fields.twitch);
  if (twitch) out.twitch = twitch;
  const youtube = buildSocial('https://youtube.com/@{handle}', fields.youtube);
  if (youtube) out.youtube = youtube;

  out.liquipediaUrl = `${BASE_PAGE_URL}${handle}`;

  return out;
}

// ---------------------------------------------------------------------------
// Manual file merge
// ---------------------------------------------------------------------------

async function mergeIntoManual(entry) {
  let existing = [];
  try {
    existing = JSON.parse(await readFile(ROSTER_MANUAL, 'utf8'));
  } catch {
    // file may not exist
  }
  const idx = existing.findIndex(
    (p) => p.handle?.toLowerCase() === entry.handle.toLowerCase(),
  );
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...entry };
  } else {
    existing.push(entry);
  }
  await writeFile(ROSTER_MANUAL, JSON.stringify(existing, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  console.error(`[fetch-player] Fetching ${handle} from Liquipedia...`);
  const wikitext = await fetchWikitext(handle);
  if (!wikitext) {
    console.error(`[fetch-player] No wikitext returned for ${handle}.`);
    process.exit(2);
  }
  const infobox = extractInfobox(wikitext);
  if (!infobox) {
    console.error(`[fetch-player] No {{Infobox player}} found on ${handle}.`);
    process.exit(2);
  }
  const fields = parseTemplateFields(infobox);
  const entry = buildEntry(fields, handle);

  // Print the entry to stdout for inspection.
  process.stdout.write(JSON.stringify(entry, null, 2) + '\n');

  if (apply) {
    await mergeIntoManual(entry);
    console.error(`[fetch-player] Merged into ${ROSTER_MANUAL}`);
    console.error('[fetch-player] Run `npm run fetch:heroes` next to grab any new hero portraits.');
  } else {
    console.error('[fetch-player] Re-run with --apply to merge into roster.manual.json.');
  }
})();
