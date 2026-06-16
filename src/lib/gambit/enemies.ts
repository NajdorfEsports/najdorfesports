/**
 * Enemy archetypes for the seeded budget director. Cheap fodder (`pawn`,
 * `runner`) carries a `cullAfter` so the mix escalates as the run goes; brutes
 * and knights persist. The elite is spawned by the minute-marker schedule, not
 * the credit budget. All MVP enemies are visible contact-damage seekers (no
 * off-screen one-shots); telegraphed ranged elites are Stage 2.
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
    cullAfter: 190,
    hp: 14,
    speed: 64,
    radius: 13,
    contactDamage: 6,
    gemValue: 1,
    color: 0x8a8f98,
    shape: 'triangle',
  },
  {
    id: 'runner',
    cost: 2,
    unlockAt: 30,
    cullAfter: 320,
    hp: 20,
    speed: 108,
    radius: 12,
    contactDamage: 7,
    gemValue: 2,
    color: 0x6b8dff,
    shape: 'diamond',
  },
  {
    id: 'brute',
    cost: 6,
    unlockAt: 75,
    cullAfter: null,
    hp: 120,
    speed: 52,
    radius: 22,
    contactDamage: 12,
    gemValue: 5,
    color: 0xf87171,
    shape: 'square',
  },
  {
    id: 'knight',
    cost: 11,
    unlockAt: 150,
    cullAfter: null,
    hp: 250,
    speed: 80,
    radius: 19,
    contactDamage: 14,
    gemValue: 9,
    color: 0xfbbf24,
    shape: 'pentagon',
  },
];

export const ELITE: EnemyArchetype = {
  id: 'elite',
  cost: 0,
  unlockAt: 0,
  cullAfter: null,
  hp: 900,
  speed: 66,
  radius: 34,
  contactDamage: 18,
  gemValue: 40,
  color: 0x215bff,
  shape: 'pentagon',
  elite: true,
};

/** Index-stable runtime list; the entity store's `type` indexes into this. */
export const ALL_ARCHETYPES: EnemyArchetype[] = [...ARCHETYPES, ELITE];
export const ELITE_INDEX = ALL_ARCHETYPES.length - 1;

/** Archetypes the credit director may pick at a given elapsed time. */
export function eligibleArchetypes(elapsedS: number): EnemyArchetype[] {
  return ARCHETYPES.filter(
    (a) => a.unlockAt <= elapsedS && (a.cullAfter === null || elapsedS < a.cullAfter),
  );
}
