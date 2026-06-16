import { describe, expect, it } from 'vitest';
import { xpForLevel } from './constants';
import { makeRng } from './rng';
import { applyUpgrade, rollChoices } from './systems/progression';
import type { Player } from './types';
import { UPGRADE_BY_ID, UPGRADES } from './upgrades';

function freshPlayer(): Player {
  return {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    inputX: 0,
    inputY: 0,
    hp: 100,
    maxHp: 100,
    radius: 16,
    baseSpeed: 230,
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    iframes: 0,
    basePickupRadius: 16,
    baseMagnetRadius: 130,
    kills: 0,
    cooldown: 0,
    weaponId: 'bolt',
    mods: {
      damageMult: 1,
      fireRateMult: 1,
      projectileSpeedMult: 1,
      extraProjectiles: 0,
      pierce: 0,
      areaMult: 1,
      moveSpeedMult: 1,
      magnetMult: 1,
      maxHpBonus: 0,
      regenPerSec: 0,
      splash: 0,
      critChance: 0,
      critMult: 2.25,
      orbiters: 0,
    },
  };
}

describe('xpForLevel', () => {
  it('is strictly increasing', () => {
    for (let l = 1; l < 40; l += 1) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    }
  });
});

describe('rollChoices', () => {
  it('is deterministic for a given rng state and taken set', () => {
    const taken = { damage: 2 };
    const a = rollChoices(makeRng(7), taken);
    const b = rollChoices(makeRng(7), taken);
    expect(a).toEqual(b);
  });

  it('returns three distinct, eligible upgrade ids', () => {
    const ids = rollChoices(makeRng(42), {});
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    for (const id of ids) expect(UPGRADE_BY_ID[id]).toBeDefined();
  });

  it('never offers a maxed-out card', () => {
    const taken: Record<string, number> = {};
    for (const u of UPGRADES) taken[u.id] = u.maxStacks; // everything maxed but two
    taken.damage = 0;
    taken.fortify = 0;
    const ids = rollChoices(makeRng(3), taken);
    expect(ids.sort()).toEqual(['damage', 'fortify']);
  });

  it('guarantees a wildcard (an off-dominant-tag option exists in the draw)', () => {
    const taken = { damage: 3, firerate: 2 }; // dominant tag = offense
    for (let seed = 0; seed < 20; seed += 1) {
      const ids = rollChoices(makeRng(seed), taken);
      const hasOffTag = ids.some((id) => !UPGRADE_BY_ID[id]!.tags.includes('offense'));
      expect(hasOffTag).toBe(true);
    }
  });
});

describe('applyUpgrade', () => {
  it('mutates the run and records the stack', () => {
    const p = freshPlayer();
    const taken: Record<string, number> = {};
    applyUpgrade(p, taken, 'damage');
    expect(p.mods.damageMult).toBeGreaterThan(1);
    expect(taken.damage).toBe(1);
  });
});
