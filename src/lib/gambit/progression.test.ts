import { describe, expect, it } from 'vitest';
import { xpForLevel } from './constants';
import { BISHOP } from './heroes';
import { makeRng } from './rng';
import { applyCard, applyUpgrade, availableEvolutions, rollChoices } from './systems/progression';
import { WEAPONS } from './weapons';
import { createWorld } from './world';

/** A fresh Bishop player (owns only the bolt at level 1). */
function freshPlayer() {
  return createWorld(1, BISHOP).player;
}

describe('xpForLevel', () => {
  it('is strictly increasing', () => {
    for (let l = 1; l < 40; l += 1) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    }
  });
});

describe('rollChoices', () => {
  it('is deterministic for a given rng state, player, and taken set', () => {
    const a = rollChoices(makeRng(7), freshPlayer(), { damage: 2 });
    const b = rollChoices(makeRng(7), freshPlayer(), { damage: 2 });
    expect(a).toEqual(b);
  });

  it('returns up to three distinct cards', () => {
    const cards = rollChoices(makeRng(42), freshPlayer(), {});
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(3);
    expect(new Set(cards.map((c) => c.key)).size).toBe(cards.length);
  });

  it('offers brand-new weapons while a weapon slot is free', () => {
    let sawNewWeapon = false;
    for (let s = 0; s < 30 && !sawNewWeapon; s += 1) {
      const cards = rollChoices(makeRng(s), freshPlayer(), {});
      if (cards.some((c) => c.kind === 'newWeapon')) sawNewWeapon = true;
    }
    expect(sawNewWeapon).toBe(true);
  });

  it('surfaces an evolution once its prerequisites are met', () => {
    const p = freshPlayer();
    p.weapons.find((w) => w.id === 'bolt')!.level = WEAPONS.bolt!.maxLevel;
    const taken = { pierce: 3 };
    expect(availableEvolutions(p, taken)).toContain('evoLance');
    const cards = rollChoices(makeRng(1), p, taken);
    expect(cards.some((c) => c.kind === 'evolution' && c.ref === 'evoLance')).toBe(true);
  });
});

describe('applyCard', () => {
  it('adds a new weapon to the loadout', () => {
    const w = createWorld(1, BISHOP);
    const before = w.player.weapons.length;
    applyCard(w, {}, { key: 'volley', kind: 'newWeapon', ref: 'volley' });
    expect(w.player.weapons.length).toBe(before + 1);
    expect(w.player.weapons.some((x) => x.id === 'volley')).toBe(true);
  });

  it('levels an owned weapon', () => {
    const w = createWorld(1, BISHOP);
    applyCard(w, {}, { key: 'lvl:bolt', kind: 'levelWeapon', ref: 'bolt' });
    expect(w.player.weapons.find((x) => x.id === 'bolt')!.level).toBe(2);
  });

  it('evolves the base weapon in place and grants its bonus', () => {
    const w = createWorld(1, BISHOP);
    w.player.weapons.find((x) => x.id === 'bolt')!.level = WEAPONS.bolt!.maxLevel;
    applyCard(w, { pierce: 3 }, { key: 'evo:evoLance', kind: 'evolution', ref: 'evoLance' });
    expect(w.player.weapons.some((x) => x.id === 'lance')).toBe(true);
    expect(w.player.weapons.some((x) => x.id === 'bolt')).toBe(false);
  });
});

describe('applyUpgrade', () => {
  it('mutates the run, records the stack, and diminishes (hyperbolic damage)', () => {
    const p = freshPlayer();
    const taken: Record<string, number> = {};
    applyUpgrade(p, taken, 'damage');
    const firstDelta = p.mods.damageMult - 1;
    expect(firstDelta).toBeGreaterThan(0);
    applyUpgrade(p, taken, 'damage');
    const secondDelta = p.mods.damageMult - 1 - firstDelta;
    expect(secondDelta).toBeLessThan(firstDelta);
    expect(taken.damage).toBe(2);
  });
});
