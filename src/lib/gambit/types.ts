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
  /** Flat HP healed each time an enemy is killed (Knight passive). */
  lifestealOnKill: number;
  /** Flat damage subtracted from each incoming contact hit (Armor passive). */
  armor: number;
  /** Chance (0..1) to negate an incoming contact hit entirely (Evasion). */
  dodgeChance: number;
  /** Auto-revivals banked: on death, spend one to return at half HP (Revival). */
  revivalCharges: number;
}

/** Behavior family for a weapon; drives how systems/weapon.ts fires it. */
export type WeaponKind =
  | 'bolt' // nearest-target fan (the original)
  | 'radial' // 360-degree nova burst
  | 'orbital' // orbiting contact blades
  | 'lance' // a piercing line along the player's aim
  | 'aura' // a persistent damage field around the player
  | 'seeker'; // homing bolts

/** One weapon the player owns, with its own level and cooldown. */
export interface OwnedWeapon {
  /** Key into the WEAPONS table. */
  id: string;
  level: number;
  /** Seconds until this weapon next fires. */
  cooldown: number;
}

/** A projectile weapon's resolved per-shot stats (level + global mods). */
export interface ResolvedShot {
  damage: number;
  projectiles: number;
  interval: number;
  pierce: number;
  radius: number;
  range: number;
  speed: number;
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
  /** Seconds the player has held still (no input); gates Mending regen. */
  stillTime: number;
  basePickupRadius: number;
  baseMagnetRadius: number;
  kills: number;
  /** Aim direction (normalized): the last movement heading, persisted while
   *  still. Movement-direction weapons (lance) fire along it. */
  aimX: number;
  aimY: number;
  /** Owned weapons, each fired on its own cadence by systems/weapon.ts. */
  weapons: OwnedWeapon[];
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
  kind: WeaponKind;
  /** Highest level this weapon reaches; the level cap interacts with the slot cap. */
  maxLevel: number;
  baseInterval: number;
  baseDamage: number;
  baseProjectileSpeed: number;
  baseProjectiles: number;
  basePierce: number;
  /** Travel distance before a projectile expires, in world units. */
  baseRange: number;
  projectileRadius: number;
  spreadDeg: number;
  /** Homing turn rate (rad/s) for seeker projectiles; 0 for everything else. */
  homingTurn: number;
  /** Render tint (0xRRGGBB) so each weapon's projectiles read distinctly. */
  tint: number;
  /** Per-LEVEL growth applied on top of the base (level 1 = base). */
  perLevel: {
    damage?: number; // +flat per level
    projectiles?: number; // +count per level
    interval?: number; // *= per level (e.g. 0.94 = 6% faster)
    pierce?: number; // +flat per level
    radius?: number; // *= per level
    range?: number; // *= per level
  };
}

export interface HeroDef {
  id: string;
  weaponId: string;
  baseHp: number;
  baseSpeed: number;
  radius: number;
  /** Innate passive mods (deltas) added to the run at start: the hero identity. */
  mods?: Partial<PlayerMods>;
}

export type UpgradeTag = 'offense' | 'defense' | 'utility';

export interface UpgradeCard {
  id: string;
  tags: UpgradeTag[];
  maxStacks: number;
  /** Pure mutation applied when the card is chosen. `stacks` is how many were
   *  already taken (0 on the first), so a card can give diminishing returns. */
  apply: (mods: PlayerMods, player: Player, stacks: number) => void;
}

/** One level-up choice. `kind` lets the renderer style weapon vs passive vs
 *  evolution cards distinctly, and the applier knows what to do with `ref`. */
export type OfferKind = 'newWeapon' | 'levelWeapon' | 'passive' | 'evolution';
export interface OfferCard {
  /** Stable key for the card (also the i18n lookup base). */
  key: string;
  kind: OfferKind;
  /** Weapon id, passive id, or evolution id depending on `kind`. */
  ref: string;
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
  /** Whether the climax Queen has already been spawned. */
  reaperDone: boolean;
  /** Index of the next scheduled closing-wall ring event. */
  nextWallIndex: number;
  /** Enemy-pool slot of the living climax Queen, or -1 when none is alive. */
  reaperIndex: number;
  /** The climax Queen's spawn HP, for computing phase thresholds. */
  reaperMaxHp: number;
  /** Queen fight phase: 0 chase, 1 summon-adds, 2 enrage. */
  reaperPhase: number;
  /** Seconds until the Queen's next add-summon. */
  reaperAddTimer: number;
  /** Seconds until the next endless Queen spawns (after the win mark). */
  endlessTimer: number;
  /** Count of endless Queens spawned, used to escalate each one. */
  endlessQueens: number;
  /** Seconds until living elites next summon adds. */
  eliteSummonTimer: number;
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
  /** When true, runs apply your permanent PowerUps (casual mode). The seeded
   *  daily defaults to false: a pure, fair run for everyone. */
  casual: boolean;
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
  /** Velocity, used only by steered bosses (the Queen) for momentum/overshoot;
   *  plain seekers ignore it and move straight toward the player. */
  vx: Float32Array;
  vy: Float32Array;
  hp: Float32Array;
  /** Spawn HP, for the elite per-hit damage cap (no enemy dies in one shot). */
  maxHp: Float32Array;
  /** Flat damage subtracted from each hit before the cap (elites only). */
  armor: Float32Array;
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
  /** Homing turn rate (rad/s); 0 for straight-flying projectiles. */
  homing: Float32Array;
  /** Render-tint index (which weapon fired it). */
  kind: Uint8Array;
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
