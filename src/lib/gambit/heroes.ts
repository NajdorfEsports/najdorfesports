/**
 * Original chess-motif heroes, each with a distinct weapon and feel. The Bishop
 * (a precise ranged striker) ships unlocked; the Knight (a fast close-range
 * spread fighter) unlocks by winning a run. All original: no Blizzard-derived
 * names, art, or stats. A Rook tank is a reserved slot for later.
 */
import type { HeroDef } from './types';

// Bishop: a precise long-range striker and a true glass cannon. It crits hard
// and out-ranges everything, but has NO innate sustain: standing still in a
// swarm is lethal, so it lives by spacing and footwork. Ships unlocked.
export const BISHOP: HeroDef = {
  id: 'bishop',
  weaponId: 'bolt',
  baseHp: 100,
  baseSpeed: 236,
  radius: 16,
  mods: { critChance: 0.12 },
};

// Knight: fast and aggressive. Starts with the Gambit lance, which fires along
// your aim, so his identity (dive in, point your body at the threat) is enforced
// from level 1. Heals on every kill and fires fast; trades range for it. Unlock
// by winning a run.
export const KNIGHT: HeroDef = {
  id: 'knight',
  weaponId: 'gambit',
  baseHp: 100,
  baseSpeed: 280,
  radius: 15,
  mods: { lifestealOnKill: 0.35, fireRateMult: 0.18 },
};

export const HEROES: Record<string, HeroDef> = {
  bishop: BISHOP,
  knight: KNIGHT,
};

export const DEFAULT_HERO = BISHOP;

/** Hero ids unlocked from the start. */
export const STARTING_HEROES = ['bishop'];
