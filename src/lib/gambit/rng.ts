/**
 * Deterministic seeded PRNG (mulberry32). One 32-bit state word, identical
 * output across JS engines (Math.imul, like the FNV-1a in daily.ts). Every
 * outcome-affecting decision (spawns, drops, upgrade offers) draws from one of
 * these so a daily seed replays the same run for everyone. Cosmetic FX use a
 * separate non-seeded source and never touch this stream.
 */

export interface Rng {
  /** Float in [0, 1). */
  nextFloat(): number;
  /** Integer in [0, n). */
  nextInt(n: number): number;
  /** Float in [lo, hi). */
  range(lo: number, hi: number): number;
  pick<T>(arr: readonly T[]): T;
  chance(p: number): boolean;
  /** Snapshot/restore the full stream (one word), for tests and replays. */
  getState(): number;
  setState(s: number): void;
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const nextFloat = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    nextFloat,
    nextInt: (n) => Math.floor(nextFloat() * n),
    range: (lo, hi) => lo + nextFloat() * (hi - lo),
    pick: (arr) => arr[Math.floor(nextFloat() * arr.length)] as (typeof arr)[number],
    chance: (p) => nextFloat() < p,
    getState: () => a >>> 0,
    setState: (s) => {
      a = s >>> 0;
    },
  };
}
