/**
 * Weapon table. The MVP ships one auto-firing weapon (the Bishop's bolt);
 * weapon+passive evolutions and additional weapons are Stage 2. Resolved
 * per-shot stats combine these bases with the run's PlayerMods (see
 * systems/weapon.ts).
 */
import type { WeaponDef } from './types';

export const BOLT: WeaponDef = {
  id: 'bolt',
  baseInterval: 0.62,
  baseDamage: 12,
  baseProjectileSpeed: 560,
  baseProjectiles: 1,
  basePierce: 0,
  baseRange: 740,
  projectileRadius: 7,
  spreadDeg: 9,
};

export const WEAPONS: Record<string, WeaponDef> = {
  bolt: BOLT,
};
