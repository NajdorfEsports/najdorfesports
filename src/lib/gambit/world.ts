/**
 * World assembly and the fixed-step simulation tick. `createWorld(seed, hero,
 * powerupLevels)` builds the entity stores, the player (with PowerUps applied),
 * the seeded RNG, and the director; `step(world)` runs the systems in a fixed
 * order by exactly DT seconds and republishes `world.events` for the caller.
 * Pure: no DOM, no Pixi, no wall-clock. Survival time is derived from the step
 * count, so a paused or backgrounded game contributes nothing.
 */
import { ARENA_HALF, DT, DT_MS, GRID_CELL, currencyForRun, xpForLevel } from './constants';
import { SpatialGrid } from './grid';
import { DEFAULT_HERO } from './heroes';
import { Pool } from './pool';
import { applyPowerups } from './powerups';
import { makeRng } from './rng';
import { updateCollision } from './systems/collision';
import { updateDirector } from './systems/director';
import { updateMovement } from './systems/movement';
import { updateWeapon } from './systems/weapon';
import type {
  EnemyStore,
  GemStore,
  HeroDef,
  Player,
  ProjectileStore,
  RunResult,
  World,
} from './types';
import { MAX_ENEMIES, MAX_GEMS, MAX_PROJECTILES } from './constants';

function makeEnemyStore(cap: number): EnemyStore {
  return {
    pool: new Pool(cap),
    x: new Float32Array(cap),
    y: new Float32Array(cap),
    prevX: new Float32Array(cap),
    prevY: new Float32Array(cap),
    hp: new Float32Array(cap),
    radius: new Float32Array(cap),
    speed: new Float32Array(cap),
    damage: new Float32Array(cap),
    gem: new Float32Array(cap),
    type: new Int32Array(cap),
    elite: new Uint8Array(cap),
  };
}

function makeProjectileStore(cap: number): ProjectileStore {
  return {
    pool: new Pool(cap),
    x: new Float32Array(cap),
    y: new Float32Array(cap),
    prevX: new Float32Array(cap),
    prevY: new Float32Array(cap),
    vx: new Float32Array(cap),
    vy: new Float32Array(cap),
    life: new Float32Array(cap),
    damage: new Float32Array(cap),
    radius: new Float32Array(cap),
    pierce: new Float32Array(cap),
  };
}

function makeGemStore(cap: number): GemStore {
  return {
    pool: new Pool(cap),
    x: new Float32Array(cap),
    y: new Float32Array(cap),
    prevX: new Float32Array(cap),
    prevY: new Float32Array(cap),
    value: new Float32Array(cap),
  };
}

export function createWorld(
  seed: number,
  hero: HeroDef = DEFAULT_HERO,
  powerupLevels: Record<string, number> = {},
): World {
  const player: Player = {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    inputX: 0,
    inputY: 0,
    hp: hero.baseHp,
    maxHp: hero.baseHp,
    radius: hero.radius,
    baseSpeed: hero.baseSpeed,
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    iframes: 0,
    basePickupRadius: 16,
    baseMagnetRadius: 130,
    kills: 0,
    cooldown: 0,
    weaponId: hero.weaponId,
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
    },
  };
  applyPowerups(player, powerupLevels);

  return {
    seed,
    rng: makeRng(seed),
    player,
    enemies: makeEnemyStore(MAX_ENEMIES),
    projectiles: makeProjectileStore(MAX_PROJECTILES),
    gems: makeGemStore(MAX_GEMS),
    grid: new SpatialGrid(ARENA_HALF, GRID_CELL),
    director: { credits: 0, nextEventIndex: 0 },
    time: { stepCount: 0, elapsedS: 0 },
    dead: false,
    events: [],
  };
}

/** Advance the simulation by one fixed DT step. */
export function step(world: World): void {
  world.events.length = 0;
  world.time.stepCount += 1;
  world.time.elapsedS = world.time.stepCount * DT;
  updateDirector(world, DT);
  updateMovement(world, DT);
  updateWeapon(world, DT);
  updateCollision(world, DT);
}

export function runResult(world: World): RunResult {
  const survivalMs = world.time.stepCount * DT_MS;
  return {
    survivalMs,
    level: world.player.level,
    kills: world.player.kills,
    currencyEarned: currencyForRun(survivalMs, world.player.kills),
  };
}
