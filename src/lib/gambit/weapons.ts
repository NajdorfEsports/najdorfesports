/**
 * Weapon table. A run is built by collecting and leveling several of these, each
 * with a distinct BEHAVIOR (see WeaponKind) so builds genuinely diverge:
 *
 *  - bolt    (The Bolt): a precise fan at the nearest enemy. Reliable, ranged.
 *  - volley  (Battery):  a 360-degree nova. Answers "the bolt only hits one side."
 *  - carousel(Carousel): orbiting blades. Rewards moving so foes keep crossing them.
 *  - gambit  (Knight's Gambit): a piercing line along your AIM. Rewards movement:
 *            a still player sprays one arc into empty space.
 *  - sanctum (Bishop's Sanctum): a persistent low-DPS field. Shaves contact damage.
 *  - oracle  (Oracle): homing bolts that pick off flankers. (Commit 2.)
 *
 * Resolved per-shot stats combine a weapon's per-LEVEL growth with the run's
 * global PlayerMods (see systems/weapon.ts resolveWeapon). Orbital and aura
 * weapons resolve in systems/collision.ts, not here. Evolved weapons (Lance,
 * Communion) live at the bottom; see evolutions.ts for how they are earned.
 */
import { COLOR_ACCENT, COLOR_ACCENT2, COLOR_ORBIT, COLOR_PROJECTILE, COLOR_WIN } from './constants';
import type { WeaponDef } from './types';

/** Sensible defaults so each weapon only specifies what differs. */
function weapon(def: Partial<WeaponDef> & Pick<WeaponDef, 'id' | 'kind'>): WeaponDef {
  return {
    maxLevel: 6,
    baseInterval: 1,
    baseDamage: 10,
    baseProjectileSpeed: 600,
    baseProjectiles: 1,
    basePierce: 0,
    baseRange: 600,
    projectileRadius: 7,
    spreadDeg: 0,
    homingTurn: 0,
    tint: COLOR_PROJECTILE,
    perLevel: {},
    ...def,
  };
}

export const BOLT = weapon({
  id: 'bolt',
  kind: 'bolt',
  maxLevel: 6,
  baseInterval: 0.5,
  baseDamage: 16,
  baseProjectileSpeed: 600,
  baseProjectiles: 1,
  baseRange: 720,
  projectileRadius: 7,
  spreadDeg: 8,
  tint: COLOR_PROJECTILE,
  perLevel: { damage: 4, interval: 0.94 },
});

export const VOLLEY = weapon({
  id: 'volley',
  kind: 'radial',
  maxLevel: 6,
  baseInterval: 1.3,
  baseDamage: 13,
  baseProjectileSpeed: 380,
  baseProjectiles: 6,
  baseRange: 360,
  projectileRadius: 6,
  tint: COLOR_ACCENT2,
  perLevel: { projectiles: 1, damage: 5, interval: 0.94 },
});

export const CAROUSEL = weapon({
  id: 'carousel',
  kind: 'orbital',
  maxLevel: 5,
  baseInterval: 1, // unused: resolves continuously in collision.ts
  baseDamage: 88, // DPS per blade base (ORBIT_DPS-equivalent)
  baseProjectiles: 2, // blade count at level 1
  baseRange: 78, // orbit radius
  tint: COLOR_ORBIT,
  perLevel: { projectiles: 1, damage: 20, radius: 1.06 },
});

export const GAMBIT = weapon({
  id: 'gambit',
  kind: 'lance',
  maxLevel: 6,
  baseInterval: 0.45,
  baseDamage: 16,
  baseProjectileSpeed: 680,
  baseProjectiles: 1,
  basePierce: 2,
  baseRange: 540,
  projectileRadius: 7,
  spreadDeg: 7,
  tint: COLOR_ACCENT,
  perLevel: { projectiles: 1, damage: 6, pierce: 1, interval: 0.93 },
});

export const SANCTUM = weapon({
  id: 'sanctum',
  kind: 'aura',
  maxLevel: 5,
  baseInterval: 1, // unused: resolves continuously in collision.ts
  baseDamage: 30, // aura DPS base
  baseProjectiles: 0,
  baseRange: 95, // aura radius
  tint: COLOR_ACCENT2,
  perLevel: { damage: 13, radius: 1.12 },
});

export const ORACLE = weapon({
  id: 'oracle',
  kind: 'seeker',
  maxLevel: 5,
  baseInterval: 0.7,
  baseDamage: 7,
  baseProjectileSpeed: 420,
  baseProjectiles: 1,
  baseRange: 900,
  projectileRadius: 6,
  homingTurn: 3.5,
  tint: 0x9b6bff,
  perLevel: { projectiles: 1, damage: 2, interval: 0.92 },
});

// --- Evolved weapons (earned via evolutions.ts; not offered as base weapons) ---

/** Lance: the Bolt's auto-aim becomes a directional infinite-pierce railgun. The
 *  turret weapon turned into a movement weapon (it fires along your aim). */
export const LANCE = weapon({
  id: 'lance',
  kind: 'lance',
  maxLevel: 1,
  baseInterval: 0.4,
  baseDamage: 34,
  baseProjectileSpeed: 760,
  baseProjectiles: 1,
  basePierce: 999,
  baseRange: 860,
  projectileRadius: 9,
  spreadDeg: 0,
  tint: COLOR_ACCENT,
});

/** Communion: the Sanctum's field gains heal-on-kill (see evolutions.ts grant),
 *  so wading through a horde sustains you. Sustain as a deliberate build. */
export const COMMUNION = weapon({
  id: 'communion',
  kind: 'aura',
  maxLevel: 1,
  baseInterval: 1,
  baseDamage: 42,
  baseProjectiles: 0,
  baseRange: 135,
  tint: COLOR_WIN,
});

export const WEAPONS: Record<string, WeaponDef> = {
  bolt: BOLT,
  volley: VOLLEY,
  carousel: CAROUSEL,
  gambit: GAMBIT,
  sanctum: SANCTUM,
  oracle: ORACLE,
  lance: LANCE,
  communion: COMMUNION,
};

/** Weapons the player can be OFFERED as a brand-new pickup (excludes evolutions
 *  and any future hero-locked weapons). */
export const BASE_WEAPON_IDS = ['bolt', 'volley', 'carousel', 'gambit', 'sanctum', 'oracle'];
