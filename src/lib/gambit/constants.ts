/**
 * Single source of truth for every tunable number in Gambit. Balancing is a
 * data edit here (and in the enemies/weapons/upgrades tables), never a code
 * change. Colors are 0xRRGGBB ints so the Pixi renderer can use them directly;
 * they mirror the brand tokens in src/styles/global.css.
 */

/** Fixed simulation timestep. The sim only ever advances by DT seconds. */
export const DT_MS = 1000 / 60;
export const DT = DT_MS / 1000;
/** A frame longer than this (a tab-out stall) is clamped before accumulating. */
export const MAX_FRAME_MS = 250;
/** Hard catch-up cap: at most this many sim steps per rendered frame. */
export const MAX_STEPS = 5;

/** Half-width of the square arena, in world units. The player is clamped inside. */
export const ARENA_HALF = 1400;

export const MAX_ENEMIES = 600;
export const MAX_PROJECTILES = 400;
export const MAX_GEMS = 800;

/** Uniform collision grid cell size (~2x the largest common collider). */
export const GRID_CELL = 72;

/** Enemies spawn on a ring this far from the player (just off-screen on desktop). */
export const SPAWN_DIST = 780;

/** Seconds of invulnerability after taking a contact hit. */
export const PLAYER_IFRAME = 0.65;
/** Gems within magnet range home in at this speed (world units/sec). */
export const MAGNET_SPEED = 640;

// Brand palette (ints for Pixi; CSS vars carry the same hexes in the DOM HUD).
export const COLOR_BG = 0x0b0b0f;
export const COLOR_BOARD_LIGHT = 0x15151c;
export const COLOR_BOARD_DARK = 0x101015;
export const COLOR_ACCENT = 0x215bff;
export const COLOR_ACCENT2 = 0x6b8dff;
export const COLOR_WIN = 0x4ade80;
export const COLOR_LOSS = 0xf87171;
export const COLOR_GEM = 0x6b8dff;
export const COLOR_PROJECTILE = 0xe9ecf1;
export const COLOR_PLAYER = 0xe9ecf1;
export const COLOR_PLAYER_RING = 0x215bff;

/** Director credit accrual at difficulty coefficient 1 (credits/second). */
export const DIRECTOR_BASE_RATE = 1.15;

export const START_CURRENCY = 0;

/**
 * Smoothly accelerating difficulty over a run. ~1 at t0, ~2 by 60s, ~4 by
 * 150s, ~8 by 300s. Non-decreasing, so the threat always rises.
 */
export function difficultyCoeff(elapsedS: number): number {
  return 1 + elapsedS / 60 + (elapsedS / 150) ** 2;
}

/** Spawned enemy HP scales up with elapsed time so the mix never gets stale. */
export function enemyHpScale(elapsedS: number): number {
  return 1 + elapsedS / 150;
}

/** Contact damage scales gently so late hits sting without one-shotting. */
export function enemyDamageScale(elapsedS: number): number {
  return 1 + elapsedS / 420;
}

/** Strictly increasing XP required to clear each level. */
export function xpForLevel(level: number): number {
  return Math.round(5 + level * 4 + level * level * 0.6);
}

/** Run-end currency: rewards how well you actually played, not time hoarded. */
export function currencyForRun(survivalMs: number, kills: number): number {
  return Math.floor(survivalMs / 6000) + Math.floor(kills / 8);
}
