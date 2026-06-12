import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PuzzleSchema } from './schema';

/**
 * Validates the COMMITTED puzzle JSON under public/games/crossword/puzzles
 * so a bad generator run fails CI instead of shipping a broken board. Also
 * a regeneration tripwire: when the horizon runs low, re-run
 * `node scripts/generate-crosswords.mjs` and commit the output.
 */
const PUZZLES_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'public',
  'games',
  'crossword',
  'puzzles',
);

const files = readdirSync(PUZZLES_DIR).filter((f) => f.endsWith('.json'));

describe('committed crossword puzzles', () => {
  it('exist', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('all validate against PuzzleSchema and match their filename', () => {
    const failures: string[] = [];
    for (const file of files) {
      const raw = JSON.parse(readFileSync(path.join(PUZZLES_DIR, file), 'utf8'));
      const result = PuzzleSchema.safeParse(raw);
      if (!result.success) {
        failures.push(`${file}: ${result.error.issues.map((i) => i.message).join('; ')}`);
        continue;
      }
      if (file !== `${result.data.date}-${result.data.difficulty}.json`) {
        failures.push(
          `${file}: filename does not match content (${result.data.date}, ${result.data.difficulty})`,
        );
      }
    }
    expect(failures).toEqual([]);
  });

  it('every date in the range has all three difficulties', () => {
    const byDate = new Map<string, Set<string>>();
    for (const file of files) {
      const m = /^(\d{4}-\d{2}-\d{2})-(easy|medium|hard)\.json$/.exec(file);
      expect(m, `unexpected filename ${file}`).toBeTruthy();
      if (!m) continue;
      if (!byDate.has(m[1]!)) byDate.set(m[1]!, new Set());
      byDate.get(m[1]!)!.add(m[2]!);
    }
    const incomplete = [...byDate.entries()]
      .filter(([, tiers]) => tiers.size !== 3)
      .map(([date]) => date);
    expect(incomplete).toEqual([]);
  });

  it('puzzles cover at least 30 days ahead (regeneration tripwire)', () => {
    // When this starts failing, the horizon is short: run
    //   node scripts/generate-crosswords.mjs --from <max date> --to <+1y>
    // and commit the new JSON. The site fails soft (a friendly notice)
    // when a date has no puzzle, so this is a warning gate, not an outage.
    const maxDate = files
      .map((f) => f.slice(0, 10))
      .sort()
      .at(-1)!;
    const horizon = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    expect(maxDate >= horizon, `puzzles end ${maxDate}, want coverage past ${horizon}`).toBe(true);
  });
});
