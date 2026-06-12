// Builds src/data/owdle/heroes.json for the OWdle daily guessing game.
//
// Sources, per the same split as the rest of the data layer:
//   - OverFast API (overfast-api.tekrop.fr, MIT): hero list with role +
//     sub-role, per-hero detail for location and total hit points. These
//     are the only fields it carries that we need; it has NO gender,
//     nationality, attack type, or release date.
//   - src/data/owdle/heroes.curated.json: the hand-maintained overlay for
//     everything OverFast lacks. Curated-only entries (announced heroes
//     not yet on OverFast) must carry name/role/subRole/baseHp themselves.
//
// Fail-soft like the Liquipedia fetcher: any network or validation error
// leaves the committed heroes.json untouched. Run via `npm run fetch:owdle`
// when a new hero ships or stats change, review the diff, commit.
//
// OverFast rate limits allow 30 req/s; ~50 sequential requests with a
// 250ms gap stays far under that and under the 10-connection cap.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchJson, sleep } from './lib/net.mjs';
import { writeJsonAtomic } from './lib/io.mjs';
import { CuratedOverlaySchema, OwdleHeroesSchema } from '../src/data/owdle/schema.ts';

const API = 'https://overfast-api.tekrop.fr';
const OUT_PATH = fileURLToPath(new URL('../src/data/owdle/heroes.json', import.meta.url));
const CURATED_PATH = fileURLToPath(
  new URL('../src/data/owdle/heroes.curated.json', import.meta.url),
);

async function main() {
  const curated = CuratedOverlaySchema.parse(JSON.parse(await readFile(CURATED_PATH, 'utf8')));

  const list = await fetchJson(`${API}/heroes`);
  if (!Array.isArray(list) || list.length === 0) throw new Error('empty hero list from OverFast');

  const heroes = [];
  const missingOverlay = [];
  for (const item of list) {
    const overlay = curated[item.key];
    if (!overlay) {
      missingOverlay.push(item.key);
      continue;
    }
    const detail = await fetchJson(`${API}/heroes/${item.key}`);
    await sleep(250);
    heroes.push({
      id: item.key,
      name: detail.name ?? item.name,
      aliases: overlay.aliases,
      role: item.role,
      subRole: item.subrole,
      gender: overlay.gender,
      nationality: overlay.nationality,
      regionTags: overlay.regionTags,
      baseHp: detail.hitpoints?.total ?? overlay.baseHp,
      attackType: overlay.attackType,
      releaseYear: overlay.releaseYear,
      ...(overlay.releaseDate ? { releaseDate: overlay.releaseDate } : {}),
      needsVerification: overlay.needsVerification,
      sourceNote: overlay.sourceNote,
      source: { overfastKey: item.key, overfastLocation: detail.location ?? '' },
    });
    console.log(`[owdle] ${item.key}: hp=${detail.hitpoints?.total} role=${item.role}`);
  }

  // New hero on OverFast with no curated facts yet: refuse to invent them.
  if (missingOverlay.length > 0) {
    throw new Error(
      `no curated overlay for: ${missingOverlay.join(', ')}. ` +
        'Add them to heroes.curated.json (needsVerification: true until confirmed) and re-run.',
    );
  }

  // Curated-only heroes (announced, not yet on OverFast).
  const fetched = new Set(heroes.map((h) => h.id));
  for (const [id, overlay] of Object.entries(curated)) {
    if (fetched.has(id)) continue;
    if (!overlay.name || !overlay.role || !overlay.subRole || !overlay.baseHp) {
      throw new Error(`curated-only hero "${id}" is missing name/role/subRole/baseHp`);
    }
    heroes.push({
      id,
      name: overlay.name,
      aliases: overlay.aliases,
      role: overlay.role,
      subRole: overlay.subRole,
      gender: overlay.gender,
      nationality: overlay.nationality,
      regionTags: overlay.regionTags,
      baseHp: overlay.baseHp,
      attackType: overlay.attackType,
      releaseYear: overlay.releaseYear,
      ...(overlay.releaseDate ? { releaseDate: overlay.releaseDate } : {}),
      needsVerification: overlay.needsVerification,
      sourceNote: overlay.sourceNote,
      source: {},
    });
    console.log(`[owdle] ${id}: curated-only (not on OverFast yet)`);
  }

  heroes.sort((a, b) => a.id.localeCompare(b.id));
  const valid = OwdleHeroesSchema.parse(heroes);
  await writeJsonAtomic(OUT_PATH, valid, { label: 'owdle heroes' });
  const flagged = valid.filter((h) => h.needsVerification).map((h) => h.id);
  console.log(
    `[owdle] wrote ${valid.length} heroes (${flagged.length} flagged: ${flagged.join(', ')})`,
  );
}

main().catch((err) => {
  console.error(`[owdle] FAILED, heroes.json left untouched: ${err.message}`);
  process.exitCode = 1;
});
