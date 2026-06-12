/**
 * Validates the committed OWdle dataset (heroes.json + heroes.curated.json).
 * Same doctrine as the match data: STRUCTURE and invariants only, never
 * patch-sensitive values (HP totals and role counts shift with balance
 * patches and new heroes; a fetch:owdle refresh must never break tests).
 */
import { describe, expect, it } from 'vitest';
import curatedJson from './heroes.curated.json';
import heroesJson from './heroes.json';
import { CuratedOverlaySchema, OwdleHeroesSchema } from './schema';
import { HEROES, NO_REPEAT_WINDOW, OWDLE_EPOCH, answerPool } from '../../lib/owdle';

const EM_DASH = String.fromCharCode(0x2014);

describe('owdle heroes.json', () => {
  it('passes the schema', () => {
    expect(() => OwdleHeroesSchema.parse(heroesJson)).not.toThrow();
  });

  it('covers the full roster with every role represented', () => {
    const heroes = OwdleHeroesSchema.parse(heroesJson);
    expect(heroes.length).toBeGreaterThanOrEqual(52);
    for (const role of ['tank', 'damage', 'support'] as const) {
      expect(heroes.filter((h) => h.role === role).length).toBeGreaterThanOrEqual(10);
    }
  });

  it('is sorted by id for a stable daily mapping', () => {
    const ids = heroesJson.map((h) => h.id);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
  });

  it('contains no em-dash anywhere (repo-wide rule)', () => {
    expect(JSON.stringify(heroesJson)).not.toContain(EM_DASH);
    expect(JSON.stringify(curatedJson)).not.toContain(EM_DASH);
  });

  it('keeps the curated overlay and the merged output in lockstep', () => {
    const curated = CuratedOverlaySchema.parse(curatedJson);
    const heroIds = new Set(heroesJson.map((h) => h.id));
    for (const id of Object.keys(curated)) expect(heroIds).toContain(id);
    for (const id of heroIds) expect(curated).toHaveProperty(id);
  });

  it('keeps the answer pool comfortably larger than the no-repeat window', () => {
    // dailyAnswer's salted re-hash needs headroom; if verification flags
    // ever shrink the pool toward the window, widen the pool first.
    expect(answerPool(HEROES, OWDLE_EPOCH).length).toBeGreaterThan(NO_REPEAT_WINDOW + 5);
  });

  it('excludes unverified heroes from the answer pool but keeps them in the data', () => {
    const flagged = HEROES.filter((h) => h.needsVerification);
    const pool = new Set(answerPool(HEROES, '2099-01-01').map((h) => h.id));
    for (const hero of flagged) expect(pool).not.toContain(hero.id);
  });

  it('gives every alias a unique owner (no ambiguous guesses)', () => {
    const seen = new Map<string, string>();
    for (const hero of heroesJson) {
      for (const alias of hero.aliases) {
        expect(seen.get(alias) ?? hero.id, `alias "${alias}" is claimed twice`).toBe(hero.id);
        seen.set(alias, hero.id);
      }
    }
  });
});
