/**
 * Weapon evolutions: the build payoff. Each requires a base weapon at its max
 * level AND a catalyst passive at a threshold; once both are met the level-up
 * offer surfaces a one-time gold "evolution" card (see systems/progression.ts).
 * Taking it REPLACES the base weapon in the same slot with an evolved form, and
 * may grant a one-time mod bonus. Evolutions are behavior changes, not just
 * bigger numbers, so setting one up is a real plan across a run.
 */
import type { PlayerMods } from './types';

export interface EvolutionDef {
  id: string;
  /** Base weapon that must be owned at its maxLevel. */
  baseWeaponId: string;
  /** Passive (upgrade card) id that must be stacked to the threshold. */
  catalystId: string;
  catalystThreshold: number;
  /** Weapon id that replaces the base in the same slot. */
  evolvedWeaponId: string;
  /** Optional one-time mod grant when the evolution lands. */
  grant?: (mods: PlayerMods) => void;
}

export const EVOLUTIONS: EvolutionDef[] = [
  // Lance: the auto-aim Bolt becomes a directional infinite-pierce railgun. The
  // thematic anti-turtle capstone (turns the turret weapon into a mover).
  {
    id: 'evoLance',
    baseWeaponId: 'bolt',
    catalystId: 'pierce',
    catalystThreshold: 3,
    evolvedWeaponId: 'lance',
  },
  // Communion: the Sanctum aura gains heal-on-kill, so wading through a horde
  // sustains you. Sustain as a deliberate, earned build, not free regen.
  {
    id: 'evoCommunion',
    baseWeaponId: 'sanctum',
    catalystId: 'regen',
    catalystThreshold: 1,
    evolvedWeaponId: 'communion',
    grant: (m) => {
      m.lifestealOnKill += 0.4;
    },
  },
];

export const EVOLUTION_BY_ID: Record<string, EvolutionDef> = Object.fromEntries(
  EVOLUTIONS.map((e) => [e.id, e]),
);
