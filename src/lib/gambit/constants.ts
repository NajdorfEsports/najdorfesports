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

export const MAX_ENEMIES = 650;
export const MAX_PROJECTILES = 500;
export const MAX_GEMS = 900;

/** Uniform collision grid cell size (~2x the largest common collider). */
export const GRID_CELL = 72;

/** Enemies spawn on a ring this far from the player (just off-screen on desktop). */
export const SPAWN_DIST = 820;

/** Seconds of invulnerability after taking a contact hit. */
export const PLAYER_IFRAME = 0.65;
/** Mending regen only applies after holding still this many seconds. */
export const STILL_HEAL_DELAY = 2.5;
/** Gems within magnet range home in at this speed (world units/sec). */
export const MAGNET_SPEED = 720;

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
export const COLOR_ORBIT = 0x8be9ff;
export const COLOR_REAPER = 0xff2d55;
export const COLOR_CRIT = 0xffd24a;

/** Director credit accrual at difficulty coefficient 1 (credits/second). */
export const DIRECTOR_BASE_RATE = 1.3;

export const START_CURRENCY = 0;

/** A run is "won" at this mark; play continues into endless after. */
export const RUN_WIN_SECONDS = 10 * 60;
/** The Reaper (climax boss) spawns one minute before the win mark. */
export const REAPER_SECONDS = 9 * 60;

/** Orbiting-blade weapon (the "orbiters" upgrade and the Rook hero). */
export const ORBIT_RADIUS = 78;
export const ORBIT_ANGULAR = 2.6; // radians/sec
export const ORBIT_DPS = 64; // base, before damageMult + level scaling
export const ORBIT_HIT_RADIUS = 20;

/** Crit: base multiplier; chance comes from the crit upgrade. */
export const CRIT_MULT = 2.25;
/** Heavy Bolt splash: fraction of the hit's damage dealt to nearby enemies. */
export const SPLASH_FRACTION = 0.55;

/**
 * Smoothly accelerating difficulty over a run. Drives swarm density via the
 * director credit rate; non-decreasing, so the threat always rises.
 */
export function difficultyCoeff(elapsedS: number): number {
  return 1 + elapsedS / 72 + (elapsedS / 160) ** 2;
}

/**
 * Enemy HP scaling: grows then plateaus (~6x by 20 min) so late enemies stay
 * killable instead of becoming bullet-sponges. Player damage scales with LEVEL
 * (see damageForLevel) to keep pace, so leveling is what makes you stronger.
 */
export function enemyHpScale(elapsedS: number): number {
  return Math.min(6, 1 + elapsedS / 260);
}

/** Contact damage scales gently so late hits sting without one-shotting. */
export function enemyDamageScale(elapsedS: number): number {
  return 1 + elapsedS / 540;
}

/** Enemies speed up over a run, reaching "in your face" pace by the late game
 *  so move speed and active kiting matter (tuned for a 10-minute run). */
export function enemySpeedScale(elapsedS: number): number {
  return 1 + Math.min(elapsedS, 600) / 1300;
}

/** Player damage from LEVEL is intentionally flat (1x): damage comes only from
 *  upgrades, so a leveled player never becomes unkillable and bosses (with big
 *  HP) stay a real fight. Kept as a hook in case a small ramp is wanted later. */
export function damageForLevel(_level: number): number {
  return 1;
}

/** XP required to clear each level. Flatter than a hard quadratic so leveling
 * stays snappy deep into a run (paired with richer gem values). */
export function xpForLevel(level: number): number {
  return Math.round(5 + level * 4 + level * level * 0.12);
}

/** Run-end currency: rewards how well you actually played, plus a win bonus. */
export function currencyForRun(survivalMs: number, kills: number, won: boolean): number {
  return Math.floor(survivalMs / 5000) + Math.floor(kills / 6) + (won ? 60 : 0);
}
