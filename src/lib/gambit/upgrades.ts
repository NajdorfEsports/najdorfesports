/**
 * Passive upgrade cards: the stat layer that lifts ALL owned weapons (weapons
 * themselves are picked and leveled separately, see progression.ts). Every card
 * is a real, distinct upgrade. Two anti-dominance rules from the design pass:
 *  - `damage`/`crit` stack HYPERBOLICALLY (the Nth stack adds less), so a fifth
 *    damage card is worth less than a fresh weapon or a survival pick.
 *  - defensive axes (`armor`, `evasion`, `revival`) give DIFFERENT failure-mode
 *    coverage than HP/regen, so survival can't be solved by one stat.
 * Each card's `apply` receives how many were already taken, for the curve. The
 * `id` resolves to a localized title/description in the DOM via gambit.ts.
 */
import type { UpgradeCard } from './types';

export const UPGRADES: UpgradeCard[] = [
  // Offense (universal: lifts every weapon).
  {
    id: 'damage',
    tags: ['offense'],
    maxStacks: 6,
    apply: (m, _p, s) => void (m.damageMult += 0.22 / (1 + 0.5 * s)),
  },
  { id: 'firerate', tags: ['offense'], maxStacks: 6, apply: (m) => void (m.fireRateMult *= 1.12) },
  {
    id: 'multishot',
    tags: ['offense'],
    maxStacks: 4,
    apply: (m) => void (m.extraProjectiles += 1),
  },
  { id: 'pierce', tags: ['offense'], maxStacks: 3, apply: (m) => void (m.pierce += 1) },
  {
    id: 'area',
    tags: ['offense'],
    maxStacks: 5,
    apply: (m) => {
      m.areaMult += 0.18;
      m.splash += 28;
    },
  },
  {
    id: 'crit',
    tags: ['offense'],
    maxStacks: 5,
    apply: (m, _p, s) => void (m.critChance += 0.08 / (1 + 0.4 * s)),
  },
  { id: 'wrath', tags: ['offense'], maxStacks: 4, apply: (m) => void (m.critMult += 0.4) },
  // Utility.
  {
    id: 'velocity',
    tags: ['utility'],
    maxStacks: 4,
    apply: (m) => void (m.projectileSpeedMult += 0.22),
  },
  { id: 'swift', tags: ['utility'], maxStacks: 5, apply: (m) => void (m.moveSpeedMult += 0.12) },
  { id: 'magnet', tags: ['utility'], maxStacks: 4, apply: (m) => void (m.magnetMult += 0.4) },
  // Defense (each a different failure mode).
  {
    id: 'fortify',
    tags: ['defense'],
    maxStacks: 8,
    apply: (m, p) => {
      m.maxHpBonus += 25;
      p.maxHp += 25;
      p.hp = Math.min(p.maxHp, p.hp + 25);
    },
  },
  { id: 'regen', tags: ['defense'], maxStacks: 5, apply: (m) => void (m.regenPerSec += 1.7) },
  { id: 'armor', tags: ['defense'], maxStacks: 5, apply: (m) => void (m.armor += 4) },
  {
    id: 'evasion',
    tags: ['defense'],
    maxStacks: 5,
    apply: (m) => void (m.dodgeChance = Math.min(0.5, m.dodgeChance + 0.1)),
  },
  { id: 'revival', tags: ['defense'], maxStacks: 1, apply: (m) => void (m.revivalCharges += 1) },
];

export const UPGRADE_BY_ID: Record<string, UpgradeCard> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);
