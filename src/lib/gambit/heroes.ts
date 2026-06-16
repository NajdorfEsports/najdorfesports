/**
 * Original chess-motif heroes. The MVP ships one (the Bishop, the brand mark
 * itself, a diagonal striker); tank (Rook) and support (Knight/Pawn) archetypes
 * are reserved data slots for Stage 2. All original: no Blizzard-derived names,
 * art, or stats.
 */
import type { HeroDef } from './types';

export const BISHOP: HeroDef = {
  id: 'bishop',
  weaponId: 'bolt',
  baseHp: 100,
  baseSpeed: 232,
  radius: 16,
};

export const HEROES: Record<string, HeroDef> = {
  bishop: BISHOP,
};

export const DEFAULT_HERO = BISHOP;
