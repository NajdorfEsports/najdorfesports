import { describe, expect, it } from 'vitest';
import { deserialize, emptyState, serialize } from './storage';

describe('storage', () => {
  it('round-trips a state', () => {
    const s = {
      version: 1 as const,
      bestMs: 12345,
      currency: 80,
      powerups: { might: 2 },
      standard: true,
      wins: 3,
      hero: 'knight',
      unlockedHeroes: ['bishop', 'knight'],
      userZoom: 1.1,
    };
    expect(deserialize(serialize(s))).toEqual(s);
  });

  it('migrates null / garbage / old versions to empty', () => {
    expect(deserialize(null)).toEqual(emptyState());
    expect(deserialize('not json')).toEqual(emptyState());
    expect(deserialize(JSON.stringify({ version: 0, bestMs: 9 }))).toEqual(emptyState());
  });

  it('sanitizes powerups: drops unknowns, floors, clamps to maxLevel', () => {
    const out = deserialize(
      JSON.stringify({ version: 1, powerups: { might: 99, bogus: 3, vigor: -1, haste: 2.7 } }),
    );
    expect(out.powerups.might).toBe(5); // clamped to maxLevel
    expect(out.powerups.bogus).toBeUndefined();
    expect(out.powerups.vigor).toBeUndefined(); // negative dropped
    expect(out.powerups.haste).toBe(2); // floored
  });

  it('coerces invalid scalars', () => {
    const out = deserialize(JSON.stringify({ version: 1, bestMs: -5, currency: 'x' }));
    expect(out.bestMs).toBe(0);
    expect(out.currency).toBe(0);
  });
});
