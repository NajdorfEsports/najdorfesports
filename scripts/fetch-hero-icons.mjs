#!/usr/bin/env node
/*
 * fetch-hero-icons.mjs
 *
 * Downloads Overwatch hero portrait images from Liquipedia for every hero
 * that appears in our current roster's `signatureHeroes`. Writes:
 *
 *   public/heroes/<slug>.png   (the 120px cropped portrait)
 *   src/data/heroes.json       (name -> slug -> /heroes/<slug>.png mapping)
 *
 * Run with `npm run fetch:heroes` after the roster fetcher discovers a new
 * hero name. The output is committed alongside the data, so subsequent
 * cron runs don't need to redownload.
 *
 * COMPLIANCE
 * ----------
 * Same Liquipedia ToS rules as scripts/fetch-liquipedia.mjs: descriptive
 * User-Agent, gzip-aware, rate-limited (one query per 2s; non-parse calls).
 * Images are CC BY-SA 3.0 and credited via the site footer + page-level
 * attribution on /roster and /matches.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HEROES_DIR = join(__dirname, '..', 'public', 'heroes');
const HEROES_JSON = join(__dirname, '..', 'src', 'data', 'heroes.json');
const ROSTER_AUTO = join(__dirname, '..', 'src', 'data', 'roster.json');
const ROSTER_MANUAL = join(__dirname, '..', 'src', 'data', 'roster.manual.json');

const USER_AGENT =
  'NajdorfEsportsSite/1.0 (https://najdorfesports.gg; owner@najdorfesports.gg)';

const API = 'https://liquipedia.net/overwatch/api.php';
const QUERY_INTERVAL_MS = 2_000; // 1 query per 2s — Liquipedia non-parse limit
const ICON_WIDTH = 120;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(heroName) {
  return heroName
    .toLowerCase()
    .replace(/[:.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Liquipedia stores hero concept art under File:<HeroName>_concept.png. */
function fileTitle(heroName) {
  return `File:${heroName.replace(/ /g, '_')}_concept.png`;
}

async function fetchHeroIconUrl(heroName) {
  const url = `${API}?action=query&titles=${encodeURIComponent(fileTitle(heroName))}&prop=imageinfo&iiprop=url&iiurlwidth=${ICON_WIDTH}&format=json`;
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
  // Liquipedia returns `missing: ""` even when the file lives on the shared
  // commons repo. We trust imageinfo presence as the real signal.
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

async function downloadTo(filePath, url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'gzip',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(filePath, buf);
  return buf.length;
}

async function collectHeroNames() {
  const seen = new Set();
  for (const path of [ROSTER_AUTO, ROSTER_MANUAL]) {
    try {
      const data = JSON.parse(await readFile(path, 'utf8'));
      for (const player of data) {
        for (const h of player.signatureHeroes ?? []) {
          if (h && typeof h === 'string') seen.add(h.trim());
        }
      }
    } catch {
      // file may not exist; skip
    }
  }
  return Array.from(seen).sort();
}

(async () => {
  const heroes = await collectHeroNames();
  if (heroes.length === 0) {
    console.warn('[hero-icons] No signature heroes found in roster files. Nothing to do.');
    process.exit(0);
  }
  console.log(`[hero-icons] Discovered ${heroes.length} heroes in roster: ${heroes.join(', ')}`);
  await mkdir(HEROES_DIR, { recursive: true });

  const map = {};
  for (let i = 0; i < heroes.length; i += 1) {
    const hero = heroes[i];
    if (i > 0) await sleep(QUERY_INTERVAL_MS);
    try {
      const iconUrl = await fetchHeroIconUrl(hero);
      if (!iconUrl) {
        console.warn(`[hero-icons]   ${hero}: no image found, skipping.`);
        continue;
      }
      const slug = slugify(hero);
      const filePath = join(HEROES_DIR, `${slug}.png`);
      await sleep(QUERY_INTERVAL_MS);
      const size = await downloadTo(filePath, iconUrl);
      map[hero] = `/heroes/${slug}.png`;
      console.log(`[hero-icons]   ${hero}: ${size} bytes -> /heroes/${slug}.png`);
    } catch (err) {
      console.warn(`[hero-icons]   ${hero}: failed (${err?.message ?? err})`);
    }
  }

  await writeFile(HEROES_JSON, JSON.stringify(map, null, 2) + '\n', 'utf8');
  console.log(`[hero-icons] Wrote ${Object.keys(map).length} mappings to ${HEROES_JSON}`);
  process.exit(0);
})();
