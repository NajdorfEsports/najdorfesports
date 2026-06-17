/**
 * Enemy archetypes for the seeded budget director. The roster is tuned for
 * THREAT through variety, not HP-sponging: fast fodder (pawn/runner), a fast
 * late harrier (shade), heavy bruisers (brute/knight), a late charger (lancer)
 * that closes even on a moving player, a rewarding minute-marker elite, an
 * event-only closing Wall, and the climax Queen. Cheap types carry a `cullAfter`
 * so the mix escalates. Elites/Queen drop a gem "chest" on death (collision.ts).
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
    cullAfter: null,
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
    cullAfter: null,
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
    speed: 88,
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
    speed: 172,
    radius: 12,
    contactDamage: 13,
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
  {
    // Lancer: a late charger. Cruises, then accelerates hard when it has a line
    // on you (see systems/movement.ts), so a player cannot simply back-pedal
    // away from it. Forces a sideways juke, not a straight retreat.
    id: 'lancer',
    cost: 5,
    unlockAt: 240,
    cullAfter: null,
    hp: 44,
    speed: 132,
    radius: 14,
    contactDamage: 20,
    gemValue: 7,
    color: 0xf59e0b,
    shape: 'diamond',
  },
];

export const ELITE: EnemyArchetype = {
  id: 'elite',
  cost: 0,
  unlockAt: 0,
  cullAfter: null,
  hp: 900,
  speed: 98,
  radius: 32,
  contactDamage: 18,
  gemValue: 110,
  color: 0x215bff,
  shape: 'pentagon',
  elite: true,
};

/** Closing Wall: an event-only ring of tough bodies dropped around the player in
 *  the back half (see systems/director.ts). A single forward kill-cone cannot
 *  punch through all of it before the far arc arrives, so the player must step
 *  out through the thinning seam. Cost 0 and absent from ARCHETYPES, so the
 *  credit director never spawns it on its own. */
export const WALL: EnemyArchetype = {
  id: 'wall',
  cost: 0,
  unlockAt: 0,
  cullAfter: null,
  hp: 140,
  speed: 96,
  radius: 18,
  contactDamage: 16,
  gemValue: 14,
  color: 0x6b8dff,
  shape: 'square',
};

/** The climax boss: a fast, steered Queen with momentum (she overshoots when you
 *  juke), a moderate HP pool, and lethal contact. She is a real fight because she
 *  summons adds that the auto-weapon retargets onto, not because she is a sponge.
 *  Her HP and damage are set directly (not time-scaled) in the director. */
export const REAPER: EnemyArchetype = {
  id: 'reaper',
  cost: 0,
  unlockAt: 0,
  cullAfter: null,
  hp: 32000,
  speed: 240,
  radius: 42,
  contactDamage: 40,
  gemValue: 320,
  color: 0xff2d55,
  shape: 'pentagon',
  elite: true,
};

/** Index-stable runtime list; the entity store's `type` indexes into this. */
export const ALL_ARCHETYPES: EnemyArchetype[] = [...ARCHETYPES, ELITE, WALL, REAPER];
export const ELITE_INDEX = ALL_ARCHETYPES.indexOf(ELITE);
export const WALL_INDEX = ALL_ARCHETYPES.indexOf(WALL);
export const REAPER_INDEX = ALL_ARCHETYPES.indexOf(REAPER);
export const LANCER_INDEX = ALL_ARCHETYPES.findIndex((a) => a.id === 'lancer');
export const SHADE_INDEX = ALL_ARCHETYPES.findIndex((a) => a.id === 'shade');
export const BRUTE_INDEX = ALL_ARCHETYPES.findIndex((a) => a.id === 'brute');

/** Archetypes the credit director may pick at a given elapsed time. */
export function eligibleArchetypes(elapsedS: number): EnemyArchetype[] {
  return ARCHETYPES.filter(
    (a) => a.unlockAt <= elapsedS && (a.cullAfter === null || elapsedS < a.cullAfter),
  );
}
