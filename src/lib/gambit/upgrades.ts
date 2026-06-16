/**
 * Level-up upgrade cards: the agency layer. Every card is a real, distinct
 * upgrade (no trap cards, no strictly-better duplicate), so a draw never has an
 * obvious-trash option. Horizontal options (pierce, splash, orbiters, crit,
 * magnet, move speed) sit alongside raw damage so builds genuinely diverge.
 * Heavy Bolt now grants real AoE splash, so it is useful without pierce. Each
 * carries an i18n key (resolved to localized title/description in the DOM by
 * gambit.ts) via its `id`.
 */
import type { UpgradeCard } from './types';

export const UPGRADES: UpgradeCard[] = [
  { id: 'damage', tags: ['offense'], maxStacks: 8, apply: (m) => void (m.damageMult += 0.25) },
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
  { id: 'crit', tags: ['offense'], maxStacks: 5, apply: (m) => void (m.critChance += 0.08) },
  { id: 'orbiters', tags: ['offense'], maxStacks: 3, apply: (m) => void (m.orbiters += 1) },
  {
    id: 'velocity',
    tags: ['utility'],
    maxStacks: 4,
    apply: (m) => void (m.projectileSpeedMult += 0.22),
  },
  { id: 'swift', tags: ['utility'], maxStacks: 5, apply: (m) => void (m.moveSpeedMult += 0.12) },
  { id: 'magnet', tags: ['utility'], maxStacks: 4, apply: (m) => void (m.magnetMult += 0.4) },
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
];

export const UPGRADE_BY_ID: Record<string, UpgradeCard> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);
