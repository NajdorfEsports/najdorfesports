#!/usr/bin/env node
/**
 * Offline generator for the daily Overwatch mini-crossword.
 *
 * Reads the hand-authored corpus (src/data/crossword/entries.ts, imported
 * directly thanks to Node >= 22.18 type stripping), fills block templates
 * by backtracking, validates every puzzle against PuzzleSchema, and writes
 * date-keyed JSON to public/games/crossword/puzzles/<date>-<difficulty>.json.
 *
 * Determinism: a mulberry32 PRNG seeded from `${date}:${difficulty}` drives
 * every random choice, so re-running over the same range reproduces the
 * same puzzles byte for byte (given an unchanged corpus).
 *
 * Tier pools: easy puzzles use only easy-clued entries; medium falls back
 * to easy clues; hard falls back to medium then easy, but exact-tier
 * entries are strongly preferred. Unverified entries are skipped.
 *
 * Anti-repetition: an answer is hard-excluded for EXCLUDE_DAYS days after
 * use (and always within the same day across difficulties). If a day fails
 * to fill, the window relaxes 7 -> 3 -> 0 before the script gives up loudly.
 * A bigger window is impossible: three minis a day consume the corpus too
 * fast for a 30-day lockout.
 *
 * Usage:
 *   node scripts/generate-crosswords.mjs [--from YYYY-MM-DD] [--to YYYY-MM-DD]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crosswordEntries } from '../src/data/crossword/entries.ts';
import { PuzzleSchema } from '../src/data/crossword/schema.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'games', 'crossword', 'puzzles');

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const EXCLUDE_LADDER = [5, 3, 0];
const BACKTRACK_BUDGET = 30000;

// Block templates. '.' = white, '#' = block. Invariants (asserted below):
// every horizontal and vertical run is >= 3 long OR exactly 1 (a length-1
// run means the cell is checked in one direction only, British style), and
// all white cells are connected.
//
// Why no fully-crossed American grids: a ~350-word themed vocabulary
// cannot interlock that densely. Each crossing multiplies the expected
// number of valid fills by roughly the letter-collision probability
// (~0.07); a fully-crossed 5x5 has 17 crossings, putting the expected
// count far below one, and exhaustive search confirms zero fills. The
// "rail" family below (full lines in one direction, two or three full
// lines crossing them) keeps 5-9 crossings, which the pools support.
// This matches how commercial themed minis are built.

/**
 * Rail template: every other line in the primary direction is a full word;
 * `rails` are the cross-direction indices that run full length. Cells in
 * gap lines outside a rail are blocks; cells crossed once are fine.
 */
function railTemplate(size, rails, vertical) {
  const rows = [];
  for (let r = 0; r < size; r += 1) {
    let row = '';
    for (let c = 0; c < size; c += 1) {
      const onFullLine = (vertical ? c : r) % 2 === 0;
      const onRail = rails.includes(vertical ? r : c);
      row += onFullLine || onRail ? '.' : '#';
    }
    rows.push(row);
  }
  return rows;
}

/** All k-subsets of 0..size-1 with pairwise distance >= 2 (no 2-runs). */
function railSets(size, k) {
  const out = [];
  const pick = (start, acc) => {
    if (acc.length === k) {
      out.push([...acc]);
      return;
    }
    for (let i = start; i < size; i += 1) {
      if (acc.length === 0 || i - acc[acc.length - 1] >= 2) {
        acc.push(i);
        pick(i + 1, acc);
        acc.pop();
      }
    }
  };
  pick(0, []);
  return out;
}

function railFamily(size, railCount) {
  const templates = [];
  for (const rails of railSets(size, railCount)) {
    templates.push(railTemplate(size, rails, false));
    templates.push(railTemplate(size, rails, true));
  }
  return templates;
}

// Two rails = 5-6 words with 6-8 crossings (reliable); three rails = the
// denser waffle look, feasible only for the deeper medium/hard pools.
const RAIL2 = { 5: railFamily(5, 2), 6: railFamily(6, 2), 7: railFamily(7, 2) };
const RAIL3 = { 5: railFamily(5, 3), 6: railFamily(6, 3) };

/** Template preference per tier and size: primary list first, fallbacks after. */
const TIER_TEMPLATES = {
  easy: { 5: [RAIL2[5]] },
  medium: { 5: [RAIL3[5], RAIL2[5]], 6: [RAIL2[6], RAIL3[6]] },
  hard: { 5: [RAIL3[5], RAIL2[5]], 6: [RAIL3[6], RAIL2[6]], 7: [RAIL2[7]] },
};

/** Size distribution per tier (cumulative thresholds over rng()). */
function rollSize(tier, rng) {
  const r = rng();
  if (tier === 'easy') return 5;
  if (tier === 'medium') return r < 0.85 ? 5 : 6;
  return r < 0.7 ? 5 : r < 0.88 ? 6 : 7;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** djb2 string hash, for the PRNG seed. */
function hashSeed(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return h >>> 0;
}

/** Extract across/down slots (each a list of [row, col] cells) from a template. */
function templateSlots(rows) {
  const size = rows.length;
  const slots = [];
  const addRuns = (cells) => {
    let run = [];
    for (const cell of cells) {
      if (cell) run.push(cell);
      else {
        if (run.length >= 2) slots.push(run);
        run = [];
      }
    }
    if (run.length >= 2) slots.push(run);
  };
  for (let r = 0; r < size; r += 1) {
    addRuns([...rows[r]].map((ch, c) => (ch === '.' ? [r, c] : null)));
  }
  for (let c = 0; c < size; c += 1) {
    addRuns(rows.map((row, r) => (row[c] === '.' ? [r, c] : null)));
  }
  return slots;
}

function assertTemplates() {
  const all = [
    [5, [...RAIL2[5], ...RAIL3[5]]],
    [6, [...RAIL2[6], ...RAIL3[6]]],
    [7, [...RAIL2[7]]],
  ];
  for (const [size, templates] of all) {
    for (const rows of templates) {
      if (rows.length !== Number(size) || rows.some((r) => r.length !== Number(size))) {
        throw new Error(`template is not ${size}x${size}: ${rows.join('/')}`);
      }
      for (const slot of templateSlots(rows)) {
        if (slot.length < 3) {
          throw new Error(`template has a ${slot.length}-letter run: ${rows.join('/')}`);
        }
      }
      // Connectivity.
      const white = [];
      for (let r = 0; r < rows.length; r += 1) {
        for (let c = 0; c < rows.length; c += 1) if (rows[r][c] === '.') white.push([r, c]);
      }
      const seen = new Set([white[0].join(',')]);
      const queue = [white[0]];
      while (queue.length) {
        const [r, c] = queue.pop();
        for (const [dr, dc] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const k = `${r + dr},${c + dc}`;
          if (rows[r + dr]?.[c + dc] === '.' && !seen.has(k)) {
            seen.add(k);
            queue.push([r + dr, c + dc]);
          }
        }
      }
      if (seen.size !== white.length) {
        throw new Error(`template not connected: ${rows.join('/')}`);
      }
    }
  }
}

/** Build per-tier pools: { exact: Set<answer>, byLen: Map<len, entry[]> }. */
function buildPools() {
  const usable = crosswordEntries.filter((e) => e.verified && e.answer.length <= 7);
  const pools = {};
  for (const tier of DIFFICULTIES) {
    const eligible = usable.filter((e) => {
      if (tier === 'easy') return Boolean(e.clues.easy);
      if (tier === 'medium') return Boolean(e.clues.medium || e.clues.easy);
      return true;
    });
    const exact = new Set(eligible.filter((e) => Boolean(e.clues[tier])).map((e) => e.answer));
    const byLen = new Map();
    for (const e of eligible) {
      if (!byLen.has(e.answer.length)) byLen.set(e.answer.length, []);
      byLen.get(e.answer.length).push(e);
    }
    pools[tier] = { exact, byLen };
  }
  return pools;
}

function clueFor(entry, tier) {
  if (tier === 'easy') return entry.clues.easy;
  if (tier === 'medium') return entry.clues.medium ?? entry.clues.easy;
  return entry.clues.hard ?? entry.clues.medium ?? entry.clues.easy;
}

/**
 * Backtracking fill. Returns Map<slotIndex, entry> or null. Slots are
 * picked most-constrained-first; candidate order prefers exact-tier
 * entries and least-recently-used answers, with seeded jitter.
 */
function fillTemplate(slots, pool, tier, rng, isExcluded, lastUsed, dayIndex) {
  const assignment = new Map();
  const letters = new Map(); // "r,c" -> letter
  const used = new Set();
  let steps = 0;

  const clueUpper = (entry) => clueFor(entry, tier).toUpperCase();

  const candidatesFor = (slot) => {
    const list = pool.byLen.get(slot.length) ?? [];
    const out = [];
    for (const entry of list) {
      if (used.has(entry.answer) || isExcluded(entry.answer)) continue;
      let ok = true;
      for (let i = 0; i < slot.length; i += 1) {
        const have = letters.get(slot[i].join(','));
        if (have && have !== entry.answer[i]) {
          ok = false;
          break;
        }
      }
      // No clue may contain another answer in the same puzzle (in either
      // direction): a SONIC clue mentioning Hanzo is a spoiler when HANZO
      // is 1-Across.
      if (ok) {
        const cand = clueUpper(entry);
        for (const placedEntry of assignment.values()) {
          if (cand.includes(placedEntry.answer) || clueUpper(placedEntry).includes(entry.answer)) {
            ok = false;
            break;
          }
        }
      }
      if (ok) out.push(entry);
    }
    const recency = (a) => (lastUsed.has(a) ? Math.max(0, 60 - (dayIndex - lastUsed.get(a))) : 0);
    return out
      .map((entry) => ({
        entry,
        score: (pool.exact.has(entry.answer) ? 0 : 100) + recency(entry.answer) * 2 + rng() * 25,
      }))
      .sort((a, b) => a.score - b.score)
      .map((c) => c.entry);
  };

  const solve = () => {
    steps += 1;
    if (steps > BACKTRACK_BUDGET) return false;
    let best = null;
    let bestCands = null;
    for (let i = 0; i < slots.length; i += 1) {
      if (assignment.has(i)) continue;
      const cands = candidatesFor(slots[i]);
      if (cands.length === 0) return false;
      if (!bestCands || cands.length < bestCands.length) {
        best = i;
        bestCands = cands;
        if (cands.length === 1) break;
      }
    }
    if (best === null) return true; // all assigned
    const slot = slots[best];
    for (const entry of bestCands) {
      const placed = [];
      for (let i = 0; i < slot.length; i += 1) {
        const key = slot[i].join(',');
        if (!letters.has(key)) {
          letters.set(key, entry.answer[i]);
          placed.push(key);
        }
      }
      assignment.set(best, entry);
      used.add(entry.answer);
      if (solve()) return true;
      assignment.delete(best);
      used.delete(entry.answer);
      for (const key of placed) letters.delete(key);
    }
    return false;
  };

  return solve() ? { assignment, letters } : null;
}

/** Standard crossword numbering over a filled grid. */
function numberGrid(gridRows) {
  const size = gridRows.length;
  const numbers = new Map(); // "r,c" -> number
  let n = 0;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (gridRows[r][c] === '#') continue;
      const startsAcross =
        (c === 0 || gridRows[r][c - 1] === '#') && gridRows[r][c + 1] && gridRows[r][c + 1] !== '#';
      const startsDown =
        (r === 0 || gridRows[r - 1][c] === '#') && gridRows[r + 1] && gridRows[r + 1][c] !== '#';
      if (startsAcross || startsDown) {
        n += 1;
        numbers.set(`${r},${c}`, n);
      }
    }
  }
  return numbers;
}

function generatePuzzle(date, difficulty, pools, lastUsed, sameDay, dayIndex, stats) {
  const rng = mulberry32(hashSeed(`${date}:${difficulty}`));
  const size = rollSize(difficulty, rng);
  const pool = pools[difficulty];
  const tierSizes = Object.keys(TIER_TEMPLATES[difficulty]).map(Number);

  for (const excludeDays of EXCLUDE_LADDER) {
    const isExcluded = (answer) =>
      sameDay.has(answer) ||
      (excludeDays > 0 && lastUsed.has(answer) && dayIndex - lastUsed.get(answer) < excludeDays);
    if (excludeDays !== EXCLUDE_LADDER[0]) stats.relaxed += 1;
    // Try the rolled size first, then the tier's other sizes as fallbacks.
    const sizesToTry = [size, ...tierSizes.filter((s) => s !== size)];
    for (const trySize of sizesToTry) {
      const templates = TIER_TEMPLATES[difficulty][trySize].flatMap((group) =>
        [...group].sort(() => rng() - 0.5),
      );
      for (const rows of templates) {
        const cellSlots = templateSlots(rows);
        const result = fillTemplate(
          cellSlots,
          pool,
          difficulty,
          rng,
          isExcluded,
          lastUsed,
          dayIndex,
        );
        if (!result) continue;
        // Build grid strings.
        const gridRows = rows.map((row, r) =>
          [...row].map((ch, c) => (ch === '#' ? '#' : result.letters.get(`${r},${c}`))).join(''),
        );
        const numbers = numberGrid(gridRows);
        const entries = [];
        for (let i = 0; i < cellSlots.length; i += 1) {
          const slot = cellSlots[i];
          const entry = result.assignment.get(i);
          const [r0, c0] = slot[0];
          const dir = slot[1][0] === r0 ? 'across' : 'down';
          entries.push({
            number: numbers.get(`${r0},${c0}`),
            row: r0,
            col: c0,
            dir,
            answer: entry.answer,
            clue: clueFor(entry, difficulty),
          });
        }
        entries.sort((a, b) =>
          a.dir === b.dir ? a.number - b.number : a.dir === 'across' ? -1 : 1,
        );
        const puzzle = { date, difficulty, size: trySize, grid: gridRows, entries };
        const parsed = PuzzleSchema.safeParse(puzzle);
        if (!parsed.success) {
          throw new Error(
            `generated invalid puzzle ${date}-${difficulty}: ${parsed.error.issues
              .map((i) => i.message)
              .join('; ')}`,
          );
        }
        for (const e of entries) {
          lastUsed.set(e.answer, dayIndex);
          sameDay.add(e.answer);
        }
        return puzzle;
      }
    }
  }
  throw new Error(`could not fill ${date}-${difficulty} even with no exclusion window`);
}

function* dateRange(from, to) {
  const start = Date.UTC(
    ...from
      .split('-')
      .map(Number)
      .map((v, i) => (i === 1 ? v - 1 : v)),
  );
  const end = Date.UTC(
    ...to
      .split('-')
      .map(Number)
      .map((v, i) => (i === 1 ? v - 1 : v)),
  );
  for (let t = start; t <= end; t += 86_400_000) {
    yield new Date(t).toISOString().slice(0, 10);
  }
}

function main() {
  const args = process.argv.slice(2);
  const argOf = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const from = argOf('--from', '2026-06-11');
  const to = argOf('--to', '2027-06-30');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    console.error('Dates must be YYYY-MM-DD.');
    process.exit(1);
  }

  assertTemplates();
  const pools = buildPools();
  mkdirSync(OUT_DIR, { recursive: true });

  const lastUsed = new Map();
  const sizeCounts = { 5: 0, 6: 0, 7: 0 };
  const stats = { relaxed: 0 };
  let dayIndex = 0;
  let written = 0;
  for (const date of dateRange(from, to)) {
    const sameDay = new Set();
    for (const difficulty of DIFFICULTIES) {
      const puzzle = generatePuzzle(date, difficulty, pools, lastUsed, sameDay, dayIndex, stats);
      sizeCounts[puzzle.size] += 1;
      writeFileSync(
        path.join(OUT_DIR, `${date}-${difficulty}.json`),
        `${JSON.stringify(puzzle)}\n`,
      );
      written += 1;
    }
    dayIndex += 1;
  }
  console.log(
    `Wrote ${written} puzzles (${from} to ${to}) into ${path.relative(process.cwd(), OUT_DIR)}`,
  );
  console.log(`Sizes: 5x5 ${sizeCounts[5]}, 6x6 ${sizeCounts[6]}, 7x7 ${sizeCounts[7]}`);
  console.log(`Exclusion-window relaxations: ${stats.relaxed}`);
}

main();
