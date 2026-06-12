import { describe, expect, it } from 'vitest';
import { crosswordEntries } from './entries';
import { CrosswordEntrySchema } from './schema';

/**
 * Invariants for the hand-authored corpus. The generator and the puzzle
 * schema rely on these holding, so they fail loudly with the offending
 * answer named.
 */
describe('crossword entries', () => {
  it('every entry passes the schema', () => {
    const failures: string[] = [];
    for (const entry of crosswordEntries) {
      const result = CrosswordEntrySchema.safeParse(entry);
      if (!result.success) {
        failures.push(`${entry.answer}: ${result.error.issues.map((i) => i.message).join('; ')}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('answers are unique', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const entry of crosswordEntries) {
      if (seen.has(entry.answer)) dupes.push(entry.answer);
      seen.add(entry.answer);
    }
    expect(dupes).toEqual([]);
  });

  it('answers fit the current 5-7 grids (JETPACKCAT is the lone reserved exception)', () => {
    const tooLong = crosswordEntries
      .filter((e) => e.answer.length > 7 && e.answer !== 'JETPACKCAT')
      .map((e) => e.answer);
    expect(tooLong).toEqual([]);
  });

  it('per-tier pools are deep enough for the generator, per word length', () => {
    // Tier eligibility mirrors the generator: easy needs an easy clue;
    // medium falls back to easy; hard falls back to anything. Unverified
    // entries are excluded from generation entirely.
    const verified = crosswordEntries.filter((e) => e.verified && e.answer.length <= 7);
    const pools = {
      easy: verified.filter((e) => e.clues.easy),
      medium: verified.filter((e) => e.clues.medium || e.clues.easy),
      hard: verified,
    };
    const minimums: Record<keyof typeof pools, Record<number, number>> = {
      easy: { 3: 8, 4: 15, 5: 15, 6: 8, 7: 6 },
      medium: { 3: 10, 4: 20, 5: 20, 6: 12, 7: 10 },
      hard: { 3: 10, 4: 20, 5: 20, 6: 12, 7: 10 },
    };
    const shortfalls: string[] = [];
    for (const [tier, pool] of Object.entries(pools)) {
      for (const [len, min] of Object.entries(minimums[tier as keyof typeof pools])) {
        const count = pool.filter((e) => e.answer.length === Number(len)).length;
        if (count < min) shortfalls.push(`${tier} length ${len}: ${count} < ${min}`);
      }
    }
    expect(shortfalls).toEqual([]);
  });

  it('unverified entries are few and tracked', () => {
    const unverified = crosswordEntries.filter((e) => !e.verified).map((e) => e.answer);
    // REVIEW.md lists these; if this grows past a handful, verify facts
    // instead of stockpiling maybes.
    expect(unverified.length).toBeLessThanOrEqual(10);
  });
});
