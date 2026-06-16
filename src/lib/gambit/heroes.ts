/**
 * Original chess-motif heroes, each with a distinct weapon and feel. The Bishop
 * (a precise ranged striker) ships unlocked; the Knight (a fast close-range
 * spread fighter) unlocks by winning a run. All original: no Blizzard-derived
 * names, art, or stats. A Rook tank is a reserved slot for later.
 */
import type { HeroDef } from './types';

// Bishop: a precise long-range striker. Crits hard and recovers a little on each
// kill, so it survives by picking enemies off at range rather than diving in.
// The steady, safe option, and the one that ships unlocked.
export const BISHOP: HeroDef = {
  id: 'bishop',
  weaponId: 'bolt',
  baseHp: 110,
  baseSpeed: 236,
  radius: 16,
  mods: { critChance: 0.12, lifestealOnKill: 0.25 },
};

// Knight: fast and aggressive (close-range 4-shot fan, faster fire), and it heals
// hard on every kill, so diving into the swarm sustains it. Trades range and HP
// for that aggression: higher ceiling, riskier, the reward for winning a run.
export const KNIGHT: HeroDef = {
  id: 'knight',
  weaponId: 'spread',
  baseHp: 90,
  baseSpeed: 280,
  radius: 15,
  mods: { lifestealOnKill: 0.7, fireRateMult: 0.18 },
};

export const HEROES: Record<string, HeroDef> = {
  bishop: BISHOP,
  knight: KNIGHT,
};

export const DEFAULT_HERO = BISHOP;

/** Hero ids unlocked from the start. */
export const STARTING_HEROES = ['bishop'];
