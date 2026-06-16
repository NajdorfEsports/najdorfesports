/**
 * Level-up upgrade cards: the agency layer. Every card is a real, distinct
 * upgrade (no trap cards, no strictly-better duplicate of another), so a draw
 * never has an obvious-trash option and the choice is genuine. Each carries an
 * i18n key (resolved to localized title/description in the DOM by gambit.ts)
 * via its `id`; the pure logic here only knows ids, tags, stack caps, and the
 * mutation to apply. Horizontal options (area, pierce, magnet, move speed) sit
 * alongside raw damage so a build keeps making decisions instead of stacking
 * one number. Reroll/ban, pity, and weapon evolutions are Stage 2.
 */
import type { UpgradeCard } from './types';

export const UPGRADES: UpgradeCard[] = [
  { id: 'damage', tags: ['offense'], maxStacks: 8, apply: (m) => void (m.damageMult += 0.18) },
  { id: 'firerate', tags: ['offense'], maxStacks: 6, apply: (m) => void (m.fireRateMult += 0.15) },
  {
    id: 'multishot',
    tags: ['offense'],
    maxStacks: 4,
    apply: (m) => void (m.extraProjectiles += 1),
  },
  { id: 'pierce', tags: ['offense'], maxStacks: 3, apply: (m) => void (m.pierce += 1) },
  { id: 'area', tags: ['offense'], maxStacks: 5, apply: (m) => void (m.areaMult += 0.2) },
  {
    id: 'velocity',
    tags: ['utility'],
    maxStacks: 4,
    apply: (m) => void (m.projectileSpeedMult += 0.2),
  },
  { id: 'swift', tags: ['utility'], maxStacks: 5, apply: (m) => void (m.moveSpeedMult += 0.12) },
  { id: 'magnet', tags: ['utility'], maxStacks: 4, apply: (m) => void (m.magnetMult += 0.3) },
  {
    id: 'fortify',
    tags: ['defense'],
    maxStacks: 6,
    apply: (m, p) => {
      m.maxHpBonus += 20;
      p.maxHp += 20;
      p.hp = Math.min(p.maxHp, p.hp + 20);
    },
  },
  { id: 'regen', tags: ['defense'], maxStacks: 4, apply: (m) => void (m.regenPerSec += 0.6) },
];

export const UPGRADE_BY_ID: Record<string, UpgradeCard> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);
