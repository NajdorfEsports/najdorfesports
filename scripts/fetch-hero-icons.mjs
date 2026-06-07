#!/usr/bin/env node
/*
 * fetch-hero-icons.mjs
 *
 * Downloads Overwatch hero portrait images from Liquipedia for every hero
 * that appears in our current roster's `signatureHeroes`, re-encodes them
 * to WebP via sharp, and writes:
 *
 *   public/heroes/<slug>.webp   (120 px cropped portrait, WebP q=86)
 *   src/data/heroes.json        (name -> /heroes/<slug>.webp map)
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
import sharp from 'sharp';
import { sleep, fetchJson, fetchBuffer } from './lib/net.mjs';
import { writeJsonAtomic } from './lib/io.mjs';
import { slugify } from './lib/slug.mjs';
import { IconMapSchema } from '../src/data/schemas.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HEROES_DIR = join(__dirname, '..', 'public', 'heroes');
const HEROES_JSON = join(__dirname, '..', 'src', 'data', 'heroes.json');
const ROSTER_AUTO = join(__dirname, '..', 'src', 'data', 'roster.json');
const ROSTER_MANUAL = join(__dirname, '..', 'src', 'data', 'roster.manual.json');

const API = 'https://liquipedia.net/overwatch/api.php';
const QUERY_INTERVAL_MS = 2_000; // 1 query per 2s, Liquipedia non-parse limit
const ICON_WIDTH = 120;

/**
 * Liquipedia uses two naming conventions: older heroes have
 * <HeroName>_concept.png, newer heroes use <HeroName>_full_portrait.png.
 * We try both in priority order, first hit wins.
 */
function fileTitleCandidates(heroName) {
  const base = heroName.replace(/ /g, '_');
  return [`File:${base}_concept.png`, `File:${base}_full_portrait.png`];
}

async function fetchOneImageInfo(title) {
  const url = `${API}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=${ICON_WIDTH}&format=json`;
  const j = await fetchJson(url);
  const pages = j.query?.pages ?? {};
  const page = Object.values(pages)[0];
  // Liquipedia returns `missing: ""` even when the file lives on the shared
  // commons repo. We trust imageinfo presence as the real signal.
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

async function fetchHeroIconUrl(heroName) {
  const candidates = fileTitleCandidates(heroName);
  for (let i = 0; i < candidates.length; i += 1) {
    if (i > 0) await sleep(QUERY_INTERVAL_MS);
    const url = await fetchOneImageInfo(candidates[i]);
    if (url) return url;
  }
  return null;
}

async function downloadTo(filePath, url) {
  const buf = await fetchBuffer(url);
  // Re-encode whatever Liquipedia gave us (usually PNG) as WebP. Hero
  // backdrops display <=250 px wide; WebP q=86 keeps that crisp while
  // typically cutting the file ~70 %.
  const webp = await sharp(buf).webp({ quality: 86 }).toBuffer();
  await writeFile(filePath, webp);
  return webp.length;
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
      const filePath = join(HEROES_DIR, `${slug}.webp`);
      await sleep(QUERY_INTERVAL_MS);
      const size = await downloadTo(filePath, iconUrl);
      map[hero] = `/heroes/${slug}.webp`;
      console.log(`[hero-icons]   ${hero}: ${size} bytes -> /heroes/${slug}.webp`);
    } catch (err) {
      console.warn(`[hero-icons]   ${hero}: failed (${err?.message ?? err})`);
    }
  }

  // Validate + atomic write with a never-write-empty guard: a total network
  // failure (every hero failed) leaves `map` empty, which must NOT overwrite a
  // good heroes.json with `{}`. writeJsonAtomic preserves the existing file.
  const parsed = IconMapSchema.safeParse(map);
  if (!parsed.success) {
    console.error(
      '[hero-icons] output failed schema validation, preserving existing heroes.json:',
      parsed.error.issues,
    );
    process.exit(0);
  }
  const wrote = await writeJsonAtomic(HEROES_JSON, map, { label: 'hero-icons' });
  if (wrote) {
    console.log(`[hero-icons] Wrote ${Object.keys(map).length} mappings to ${HEROES_JSON}`);
  }
  process.exit(0);
})();
