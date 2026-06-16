/**
 * Original chess-motif heroes, each with a distinct weapon and feel. The Bishop
 * (a precise ranged striker) ships unlocked; the Knight (a fast close-range
 * spread fighter) unlocks by winning a run. All original: no Blizzard-derived
 * names, art, or stats. A Rook tank is a reserved slot for later.
 */
import type { HeroDef } from './types';

export const BISHOP: HeroDef = {
  id: 'bishop',
  weaponId: 'bolt',
  baseHp: 100,
  baseSpeed: 232,
  radius: 16,
};

export const KNIGHT: HeroDef = {
  id: 'knight',
  weaponId: 'spread',
  baseHp: 85,
  baseSpeed: 272,
  radius: 15,
};

export const HEROES: Record<string, HeroDef> = {
  bishop: BISHOP,
  knight: KNIGHT,
};

export const DEFAULT_HERO = BISHOP;

/** Hero ids unlocked from the start. */
export const STARTING_HEROES = ['bishop'];
