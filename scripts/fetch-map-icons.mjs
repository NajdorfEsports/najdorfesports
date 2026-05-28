#!/usr/bin/env node
/*
 * fetch-map-icons.mjs
 *
 * Downloads Overwatch map images from Liquipedia for every map that
 * appears in our matches data and re-encodes them to WebP. Mirrors the
 * shape of fetch-hero-icons.mjs but for maps instead of heroes:
 *
 *   public/maps/<slug>.webp   (600px landscape WebP q=82)
 *   src/data/maps.json        (name -> /maps/<slug>.webp map)
 *
 * Run with `npm run fetch:maps` after the matches fetcher (or a manual
 * edit to matches.json/matches.manual.json) introduces a new map name.
 * Outputs are committed; subsequent runs are idempotent.
 *
 * COMPLIANCE
 * ----------
 * Same Liquipedia ToS posture as scripts/fetch-liquipedia.mjs and
 * scripts/fetch-hero-icons.mjs: descriptive User-Agent, gzip-aware,
 * one query per 2s. Map images are CC BY-SA 3.0; attribution is on the
 * site footer + /matches page.
 */

import { readFile, rename, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAPS_DIR = join(__dirname, '..', 'public', 'maps');
const MAPS_JSON = join(__dirname, '..', 'src', 'data', 'maps.json');
const MATCHES_AUTO = join(__dirname, '..', 'src', 'data', 'matches.json');
const MATCHES_MANUAL = join(__dirname, '..', 'src', 'data', 'matches.manual.json');

const USER_AGENT =
  'NajdorfEsportsSite/1.0 (https://najdorfesports.gg; owner@najdorfesports.gg)';

const API = 'https://liquipedia.net/overwatch/api.php';
const QUERY_INTERVAL_MS = 2_000;
const TARGET_WIDTH = 600;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Baseline pool of OW2 competitive maps. Pre-fetching the whole pool
 *  once means a future match on any of these maps automatically picks
 *  up its backdrop without anyone re-running this script. Anything new
 *  that lands in the rotation (Season X map, etc.) only needs to be
 *  appended here. The discover-from-matches step still merges in any
 *  additional map names not on this list, so out-of-pool maps still
 *  work, just not pre-fetched. */
const OWCS_MAP_POOL = [
  // Control
  'Antarctic Peninsula', 'Busan', 'Ilios', 'Lijiang Tower', 'Nepal', 'Oasis', 'Samoa',
  // Push
  'Colosseo', 'Esperança', 'New Queen Street', 'Runasapi',
  // Hybrid
  'Blizzard World', 'Eichenwalde', 'Hollywood', "King's Row",
  'Midtown', 'Numbani', 'Paraíso',
  // Escort
  'Circuit Royal', 'Dorado', 'Havana', 'Junkertown',
  'Rialto', 'Route 66', 'Shambali Monastery', 'Watchpoint: Gibraltar',
  // Flashpoint
  'New Junk City', 'Suravasa', 'Aatlis',
  // Clash
  'Hanaoka', 'Throne of Anubis',
];

/** Strip non-ASCII diacritics so 'Esperança' becomes 'Esperanca'
 *  (Liquipedia's older file uploads frequently used the plain-Latin
 *  transliteration for filenames). */
function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function slugify(name) {
  return stripAccents(name)
    .toLowerCase()
    .replace(/[:.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Liquipedia files several maps under their real-world LOCATION name
 *  rather than the in-game map name (Circuit Royal lives at Monte_Carlo,
 *  Colosseo at Rome, etc.). Map these explicitly so the fetcher tries
 *  the location filename first. Append new entries here as Blizzard
 *  adds more "named-after-a-city" maps. */
const MAP_FILENAME_OVERRIDES = {
  'Circuit Royal':         'Monte_Carlo',
  'Colosseo':              'Rome',
  'Midtown':               'New_York_City',
  'New Queen Street':      'Toronto',
  'Paraíso':               'Rio_de_Janeiro',
  'Shambali Monastery':    'Shambali',
  "King's Row":            'Kings_row_map',
  'Watchpoint: Gibraltar': 'Gibraltar',
};

/** Liquipedia stores map images on lpcommons under inconsistent names:
 *  - Single-word older maps: `Busan.jpg`, `Numbani.jpg`
 *  - Newer/multi-word maps:  `Lijiang_Tower_Map.jpg`, `Blizzard_World_Map.jpg`
 *  - Accented names:         `Esperanca.jpg` (ç -> c transliteration)
 *  Cover the common variants in priority order; first hit wins. */
function fileTitleCandidates(mapName) {
  const base = mapName.replace(/ /g, '_');
  const ascii = stripAccents(base);
  const override = MAP_FILENAME_OVERRIDES[mapName];
  const variants = new Set();
  // Real-world location overrides ride at the top of the list, so we
  // try them before the boring "Map_Name.jpg" guess that will 404.
  if (override) {
    variants.add(`File:${override}.jpg`);
    variants.add(`File:${override}.png`);
  }
  variants.add(`File:${base}.jpg`);
  variants.add(`File:${ascii}.jpg`);
  variants.add(`File:${base}_Map.jpg`);
  variants.add(`File:${ascii}_Map.jpg`);
  variants.add(`File:${base}.png`);
  variants.add(`File:${base}_overview.jpg`);
  variants.add(`File:${base}_loadscreen.jpg`);
  return Array.from(variants);
}

async function fetchOneImageInfo(title) {
  const url = `${API}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=${TARGET_WIDTH}&format=json`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'gzip',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const pages = j.query?.pages ?? {};
  const page = Object.values(pages)[0];
  // Same lpcommons quirk as fetch-hero-icons: file may live on the
  // shared commons repo even when the local page is "missing".
  // imageinfo presence is the truth signal.
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

async function fetchMapIconUrl(mapName) {
  const candidates = fileTitleCandidates(mapName);
  for (let i = 0; i < candidates.length; i += 1) {
    if (i > 0) await sleep(QUERY_INTERVAL_MS);
    const url = await fetchOneImageInfo(candidates[i]);
    if (url) return url;
  }
  return null;
}

async function downloadTo(filePath, url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Encoding': 'gzip' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // Map backdrops display at card-width (~700px max). WebP q=82 keeps
  // them sharp while cutting bytes ~60-70% vs the source JPG.
  const webp = await sharp(buf).webp({ quality: 82 }).toBuffer();
  await writeFile(filePath, webp);
  return webp.length;
}

async function collectMapNames() {
  const seen = new Set(OWCS_MAP_POOL);
  // Reverse-lookup index from normalized form -> canonical name. A
  // discovered name in matches data ("kings row", "King’s Row") gets
  // collapsed onto the canonical pool entry so we do not create a
  // duplicate maps.json entry that the MatchCard lookup would also
  // have to absorb. The on-disk maps.json stays keyed by canonical
  // display name.
  const normMap = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const canonicalByNorm = new Map();
  for (const n of OWCS_MAP_POOL) canonicalByNorm.set(normMap(n), n);

  for (const path of [MATCHES_AUTO, MATCHES_MANUAL]) {
    try {
      const data = JSON.parse(await readFile(path, 'utf8'));
      for (const match of data) {
        for (const m of match.mapScores ?? []) {
          if (m.map && typeof m.map === 'string') {
            const raw = m.map.trim();
            const canonical = canonicalByNorm.get(normMap(raw));
            seen.add(canonical ?? raw);
          }
        }
      }
    } catch {
      // file may not exist; skip
    }
  }
  return Array.from(seen).sort();
}

(async () => {
  const maps = await collectMapNames();
  if (maps.length === 0) {
    console.warn('[map-icons] No maps found in matches files. Nothing to do.');
    process.exit(0);
  }
  console.log(`[map-icons] Discovered ${maps.length} maps: ${maps.join(', ')}`);
  await mkdir(MAPS_DIR, { recursive: true });

  const out = {};
  for (let i = 0; i < maps.length; i += 1) {
    const name = maps[i];
    if (i > 0) await sleep(QUERY_INTERVAL_MS);
    try {
      const iconUrl = await fetchMapIconUrl(name);
      if (!iconUrl) {
        console.warn(`[map-icons]   ${name}: no image found, skipping.`);
        continue;
      }
      const slug = slugify(name);
      const filePath = join(MAPS_DIR, `${slug}.webp`);
      await sleep(QUERY_INTERVAL_MS);
      const size = await downloadTo(filePath, iconUrl);
      out[name] = `/maps/${slug}.webp`;
      console.log(`[map-icons]   ${name}: ${size} bytes -> /maps/${slug}.webp`);
    } catch (err) {
      console.warn(`[map-icons]   ${name}: failed (${err?.message ?? err})`);
    }
  }

  // Atomic write: same rationale as scripts/fetch-liquipedia.mjs.
  const tmp = `${MAPS_JSON}.tmp`;
  await writeFile(tmp, JSON.stringify(out, null, 2) + '\n', 'utf8');
  await rename(tmp, MAPS_JSON);
  console.log(`[map-icons] Wrote ${Object.keys(out).length} mappings to ${MAPS_JSON}`);
  process.exit(0);
})();
