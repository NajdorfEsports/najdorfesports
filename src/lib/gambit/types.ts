/**
 * Shared types for Gambit, the chess-motif survivor roguelite
 * (/games/gambit/). Pure data only: no DOM, no Pixi. The simulation
 * (world.ts + systems/*) reads and mutates these; src/scripts/gambit.ts
 * renders them. The World and its entity stores live here too so the
 * systems can type against them without importing world.ts at runtime
 * (a type-only edge, so there is no module cycle).
 */
import type { Pool } from './pool';
import type { SpatialGrid } from './grid';
import type { Rng } from './rng';

export interface Vec2 {
  x: number;
  y: number;
}

/** Run-scoped upgrade modifiers, all resolved into the weapon/player each step. */
export interface PlayerMods {
  damageMult: number;
  fireRateMult: number;
  projectileSpeedMult: number;
  extraProjectiles: number;
  pierce: number;
  areaMult: number;
  moveSpeedMult: number;
  magnetMult: number;
  maxHpBonus: number;
  regenPerSec: number;
  /** Heavy Bolt splash radius (0 = no splash). */
  splash: number;
  critChance: number;
  critMult: number;
  /** Number of orbiting blades (the second weapon). */
  orbiters: number;
}

export interface Player {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  /** Normalized move vector for the current frame, written by input/bot. */
  inputX: number;
  inputY: number;
  hp: number;
  maxHp: number;
  radius: number;
  baseSpeed: number;
  level: number;
  xp: number;
  xpToNext: number;
  /** Seconds of invulnerability remaining after a contact hit. */
  iframes: number;
  basePickupRadius: number;
  baseMagnetRadius: number;
  kills: number;
  /** Weapon cooldown remaining, in seconds. */
  cooldown: number;
  weaponId: string;
  mods: PlayerMods;
}

export type EnemyShape = 'triangle' | 'square' | 'pentagon' | 'diamond';

export interface EnemyArchetype {
  id: string;
  /** Director credit cost to spawn one. */
  cost: number;
  /** Earliest elapsed second this archetype can appear. */
  unlockAt: number;
  /** Elapsed second after which it is filtered out (cheap fodder); null = forever. */
  cullAfter: number | null;
  hp: number;
  speed: number;
  radius: number;
  contactDamage: number;
  gemValue: number;
  color: number;
  shape: EnemyShape;
  elite?: boolean;
}

export interface WeaponDef {
  id: string;
  baseInterval: number;
  baseDamage: number;
  baseProjectileSpeed: number;
  baseProjectiles: number;
  basePierce: number;
  /** Travel distance before a projectile expires, in world units. */
  baseRange: number;
  projectileRadius: number;
  spreadDeg: number;
}

export interface HeroDef {
  id: string;
  weaponId: string;
  baseHp: number;
  baseSpeed: number;
  radius: number;
}

export type UpgradeTag = 'offense' | 'defense' | 'utility';

export interface UpgradeCard {
  id: string;
  tags: UpgradeTag[];
  maxStacks: number;
  /** Pure mutation applied when the card is chosen. */
  apply: (mods: PlayerMods, player: Player) => void;
}

export interface PowerUpDef {
  id: string;
  maxLevel: number;
  costBase: number;
  costStep: number;
  /** Applied to a fresh player at run start for the purchased level. */
  apply: (player: Player, level: number) => void;
}

export interface DirectorState {
  credits: number;
  /** Index of the next scheduled minute-marker event. */
  nextEventIndex: number;
  /** Whether the climax Reaper has already been spawned. */
  reaperDone: boolean;
}

export type SimEvent =
  | { type: 'levelup'; level: number }
  | { type: 'kill'; x: number; y: number; elite: boolean; color: number }
  | { type: 'hit'; x: number; y: number }
  | { type: 'pickup'; value: number; x: number; y: number }
  | { type: 'shoot'; x: number; y: number; angle: number }
  | { type: 'spawn'; x: number; y: number; reaper: boolean }
  | { type: 'win' }
  | { type: 'died' };

export interface RunResult {
  survivalMs: number;
  level: number;
  kills: number;
  currencyEarned: number;
  won: boolean;
}

export interface StoredState {
  version: 1;
  /** Best survival time across all runs, in milliseconds. */
  bestMs: number;
  currency: number;
  /** PowerUp id -> purchased level. */
  powerups: Record<string, number>;
  /** When true, runs ignore PowerUps (the pure skill challenge). */
  standard: boolean;
  /** Number of runs won (survived to the win mark). */
  wins: number;
  /** Currently selected hero id. */
  hero: string;
  /** Hero ids the player has unlocked. */
  unlockedHeroes: string[];
  /** Persisted camera zoom preference. */
  userZoom: number;
}

/** Struct-of-arrays store for one swarm population. */
export interface EnemyStore {
  pool: Pool;
  x: Float32Array;
  y: Float32Array;
  prevX: Float32Array;
  prevY: Float32Array;
  hp: Float32Array;
  radius: Float32Array;
  speed: Float32Array;
  damage: Float32Array;
  gem: Float32Array;
  /** Index into the runtime archetype list (render reads color/shape from it). */
  type: Int32Array;
  elite: Uint8Array;
}

export interface ProjectileStore {
  pool: Pool;
  x: Float32Array;
  y: Float32Array;
  prevX: Float32Array;
  prevY: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  /** Remaining travel distance before expiry. */
  life: Float32Array;
  damage: Float32Array;
  radius: Float32Array;
  /** Remaining enemies this projectile may still pass through. */
  pierce: Float32Array;
}

export interface GemStore {
  pool: Pool;
  x: Float32Array;
  y: Float32Array;
  prevX: Float32Array;
  prevY: Float32Array;
  value: Float32Array;
}

export interface World {
  /** The daily seed, kept so level-up offers can use an independent stream. */
  seed: number;
  rng: Rng;
  player: Player;
  enemies: EnemyStore;
  projectiles: ProjectileStore;
  gems: GemStore;
  grid: SpatialGrid;
  director: DirectorState;
  time: { stepCount: number; elapsedS: number };
  dead: boolean;
  /** Set once the run reaches the win mark; play continues into endless. */
  won: boolean;
  /** Drained by the caller after every step. */
  events: SimEvent[];
}
