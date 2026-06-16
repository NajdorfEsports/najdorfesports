/**
 * Enemy archetypes for the seeded budget director. The roster is tuned for
 * THREAT through variety, not HP-sponging: fast fodder (pawn/runner), a fast
 * late harrier (shade), heavy bruisers (brute/knight), a rewarding minute-marker
 * elite, and the climax Reaper. Cheap types carry a `cullAfter` so the mix
 * escalates. Elites/Reaper drop a gem "chest" on death (see collision.ts).
 *
 * ALL_ARCHETYPES is the runtime list the entity store indexes into by `type`,
 * so the renderer can read color/shape from a single source.
 */
import type { EnemyArchetype } from './types';

export const ARCHETYPES: EnemyArchetype[] = [
  {
    id: 'pawn',
    cost: 1,
    unlockAt: 0,
    cullAfter: 220,
    hp: 11,
    speed: 72,
    radius: 13,
    contactDamage: 6,
    gemValue: 1,
    color: 0xb9c2d6,
    shape: 'triangle',
  },
  {
    id: 'runner',
    cost: 2,
    unlockAt: 25,
    cullAfter: 420,
    hp: 16,
    speed: 122,
    radius: 12,
    contactDamage: 7,
    gemValue: 2,
    color: 0x6b8dff,
    shape: 'diamond',
  },
  {
    id: 'brute',
    cost: 6,
    unlockAt: 70,
    cullAfter: null,
    hp: 78,
    speed: 78,
    radius: 22,
    contactDamage: 12,
    gemValue: 9,
    color: 0xf87171,
    shape: 'square',
  },
  {
    id: 'shade',
    cost: 4,
    unlockAt: 120,
    cullAfter: null,
    hp: 30,
    speed: 156,
    radius: 12,
    contactDamage: 10,
    gemValue: 4,
    color: 0x9b6bff,
    shape: 'diamond',
  },
  {
    id: 'knight',
    cost: 11,
    unlockAt: 165,
    cullAfter: null,
    hp: 180,
    speed: 92,
    radius: 19,
    contactDamage: 15,
    gemValue: 18,
    color: 0xfbbf24,
    shape: 'pentagon',
  },
];

export const ELITE: EnemyArchetype = {
  id: 'elite',
  cost: 0,
  unlockAt: 0,
  cullAfter: null,
  hp: 460,
  speed: 98,
  radius: 32,
  contactDamage: 18,
  gemValue: 110,
  color: 0x215bff,
  shape: 'pentagon',
  elite: true,
};

/** The climax boss: very fast, very tanky, very dangerous. Spawns once. */
export const REAPER: EnemyArchetype = {
  id: 'reaper',
  cost: 0,
  unlockAt: 0,
  cullAfter: null,
  hp: 4500,
  speed: 178,
  radius: 40,
  contactDamage: 46,
  gemValue: 320,
  color: 0xff2d55,
  shape: 'pentagon',
  elite: true,
};

/** Index-stable runtime list; the entity store's `type` indexes into this. */
export const ALL_ARCHETYPES: EnemyArchetype[] = [...ARCHETYPES, ELITE, REAPER];
export const ELITE_INDEX = ALL_ARCHETYPES.indexOf(ELITE);
export const REAPER_INDEX = ALL_ARCHETYPES.indexOf(REAPER);

/** Archetypes the credit director may pick at a given elapsed time. */
export function eligibleArchetypes(elapsedS: number): EnemyArchetype[] {
  return ARCHETYPES.filter(
    (a) => a.unlockAt <= elapsedS && (a.cullAfter === null || elapsedS < a.cullAfter),
  );
}
