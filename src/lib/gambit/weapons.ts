/**
 * Weapon table. The Bishop's `bolt` is a single precise long-range shot; the
 * Knight's `spread` is a fast short-range fan. Resolved per-shot stats combine
 * these bases with the run's PlayerMods and a level-based damage ramp (see
 * systems/weapon.ts), so leveling and upgrades are both felt. The orbiting-blade
 * weapon is handled in systems/collision.ts (the `orbiters` mod), not here.
 */
import type { WeaponDef } from './types';

export const BOLT: WeaponDef = {
  id: 'bolt',
  baseInterval: 0.5,
  baseDamage: 16,
  baseProjectileSpeed: 600,
  baseProjectiles: 1,
  basePierce: 0,
  baseRange: 440,
  projectileRadius: 7,
  spreadDeg: 8,
};

export const SPREAD: WeaponDef = {
  id: 'spread',
  baseInterval: 0.42,
  baseDamage: 8,
  baseProjectileSpeed: 540,
  baseProjectiles: 4,
  basePierce: 0,
  baseRange: 340,
  projectileRadius: 6,
  spreadDeg: 40,
};

export const WEAPONS: Record<string, WeaponDef> = {
  bolt: BOLT,
  spread: SPREAD,
};
