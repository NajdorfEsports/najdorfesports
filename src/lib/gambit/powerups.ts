/**
 * Permanent meta-progression. PowerUps lower the floor, never the ceiling:
 * small marginal buffs bought with run-earned currency, freely respec-able, and
 * a run is always winnable at zero PowerUps (the "Standard" daily zeroes them).
 * They never gate difficulty or enable a required strategy; broad VARIETY
 * unlocks (heroes, weapons, stages) are Stage 2. Applied to a fresh player at
 * run start.
 */
import type { Player, PowerUpDef } from './types';

export const POWERUPS: PowerUpDef[] = [
  {
    id: 'might',
    maxLevel: 5,
    costBase: 40,
    costStep: 30,
    apply: (p, l) => void (p.mods.damageMult += 0.05 * l),
  },
  {
    id: 'vigor',
    maxLevel: 5,
    costBase: 40,
    costStep: 30,
    apply: (p, l) => {
      const bonus = 10 * l;
      p.maxHp += bonus;
      p.hp += bonus;
    },
  },
  {
    id: 'haste',
    maxLevel: 5,
    costBase: 40,
    costStep: 30,
    apply: (p, l) => void (p.mods.moveSpeedMult += 0.04 * l),
  },
  {
    id: 'greed',
    maxLevel: 5,
    costBase: 50,
    costStep: 40,
    apply: (p, l) => void (p.mods.magnetMult += 0.1 * l),
  },
];

export const POWERUP_BY_ID: Record<string, PowerUpDef> = Object.fromEntries(
  POWERUPS.map((p) => [p.id, p]),
);

/** Currency cost to buy the next level of a PowerUp (0-indexed current level). */
export function powerupCost(def: PowerUpDef, currentLevel: number): number {
  return def.costBase + def.costStep * currentLevel;
}

/** Apply every purchased PowerUp to a fresh player (skipped in Standard mode). */
export function applyPowerups(player: Player, levels: Record<string, number>): void {
  for (const def of POWERUPS) {
    const lvl = levels[def.id] ?? 0;
    if (lvl > 0) def.apply(player, lvl);
  }
}
