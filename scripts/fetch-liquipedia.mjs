#!/usr/bin/env node
/*
 * fetch-liquipedia.mjs
 *
 * Pulls Najdorf Esports' OWCS Pacific match data from Liquipedia and writes
 * src/data/matches.json. Designed to be run by a GitHub Actions cron job — see
 * .github/workflows/update-matches.yml.
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
 *   4. Attributing Liquipedia and the CC BY-SA 3.0 license on the page that
 *      displays the data (see src/pages/matches.astro).
 *
 * The fetch is FAIL-SOFT: on any HTTP error, parse error, or empty result the
 * script exits 0 without touching src/data/matches.json. This ensures the site
 * never deploys with an empty matches file when the API hiccups.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'matches.json');

const USER_AGENT =
  'NajdorfEsportsSite/1.0 (https://najdorfesports.gg; owner@najdorfesports.gg)';

// Flip this once Liquipedia's team page is updated from "Rankers" to the new name.
const TEAM_LIQUIPEDIA_NAME = 'Rankers';

const TOURNAMENT_PAGE =
  'Overwatch_Champions_Series/2026/Asia/Stage_2/Pacific';
const API = 'https://liquipedia.net/overwatch/api.php';

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

/**
 * Extract matches involving our team from a tournament wikitext blob.
 * Liquipedia's match templates vary by template version; we look for the
 * common patterns and skip anything we don't recognize.
 */
function extractMatches(wikitext, teamName) {
  const matches = [];
  if (typeof wikitext !== 'string' || wikitext.length === 0) return matches;

  // Crude pattern: {{Match | opponent1={{TeamOpponent|<name>}} | opponent2=... | date=YYYY-MM-DD HH:MM | ...}}
  // Real-world Liquipedia uses MatchMaps templates with named slots — this is a
  // best-effort scan that we'll refine once the team page actually exists.
  const matchBlockRe = /\{\{Match\b([\s\S]*?)\}\}/gi;
  let m;
  let counter = 0;
  while ((m = matchBlockRe.exec(wikitext)) !== null) {
    const block = m[1];
    const lower = block.toLowerCase();
    if (!lower.includes(teamName.toLowerCase())) continue;

    const dateMatch = block.match(/date\s*=\s*([0-9]{4}-[0-9]{2}-[0-9]{2}(?:[ T][0-9]{2}:[0-9]{2}(?::[0-9]{2})?)?)/i);
    const opponentMatches = [...block.matchAll(/TeamOpponent\|([^|}\n]+)/gi)].map((x) =>
      x[1].trim(),
    );
    const tournamentMatch = block.match(/tournament\s*=\s*([^|}\n]+)/i);
    const formatMatch = block.match(/bestof\s*=\s*(\d+)/i);
    const streamMatch = block.match(/stream\s*=\s*([^|}\n]+)/i);

    const opponent = opponentMatches.find(
      (o) => o.toLowerCase() !== teamName.toLowerCase(),
    );
    if (!opponent) continue;
    if (!dateMatch) continue;

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

(async () => {
  try {
    const json = await fetchParse(TOURNAMENT_PAGE);
    // Polite spacing in case we add follow-up calls later.
    await sleep(2000);

    const wikitext = json?.parse?.wikitext?.['*'];
    if (typeof wikitext !== 'string') {
      console.warn('[liquipedia] Unexpected response shape; skipping write.');
      process.exit(0);
    }

    const matches = extractMatches(wikitext, TEAM_LIQUIPEDIA_NAME);
    if (matches.length === 0) {
      console.warn(
        `[liquipedia] No matches found for "${TEAM_LIQUIPEDIA_NAME}" in ${TOURNAMENT_PAGE}. Skipping write to preserve previous data.`,
      );
      process.exit(0);
    }

    // Sort soonest first so manual entries in matches.manual.json can override on id collision.
    matches.sort((a, b) => +new Date(a.date) - +new Date(b.date));
    await writeFile(OUT_PATH, JSON.stringify(matches, null, 2) + '\n', 'utf8');
    console.log(`[liquipedia] Wrote ${matches.length} matches to ${OUT_PATH}.`);
  } catch (err) {
    console.warn(`[liquipedia] Fetch failed: ${err?.message ?? err}. Skipping write.`);
    process.exit(0);
  }
})();
