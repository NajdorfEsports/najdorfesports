/**
 * Auto-firing weapons. The player owns several weapons (player.weapons), each
 * fired on its own cadence and dispatched by behavior (WeaponKind):
 *   - bolt:   a fan at the nearest enemy.
 *   - radial: a 360-degree nova.
 *   - lance:  a tight line along the player's AIM (rewards moving).
 *   - seeker: homing bolts.
 *   - orbital/aura: not projectiles; they resolve in systems/collision.ts.
 * Resolved per-shot stats combine each weapon's per-level growth with the run's
 * global PlayerMods, so leveling a weapon AND stacking passives are both felt.
 */
import { ARENA_HALF, MULTISHOT_EXTRA_DAMAGE } from '../constants';
import type { PlayerMods, ResolvedShot, WeaponDef, World } from '../types';
import { WEAPONS } from '../weapons';

/** Per-shot stats for a projectile weapon at a given level + global mods. */
export function resolveWeapon(def: WeaponDef, level: number, mods: PlayerMods): ResolvedShot {
  const n = level - 1;
  const pl = def.perLevel;
  const own = def.baseProjectiles + (pl.projectiles ?? 0) * n;
  return {
    damage: def.baseDamage + (pl.damage ?? 0) * n,
    projectiles: own + mods.extraProjectiles,
    ownProjectiles: own,
    interval: def.baseInterval * Math.pow(pl.interval ?? 1, n),
    pierce: def.basePierce + (pl.pierce ?? 0) * n + mods.pierce,
    radius: def.projectileRadius * Math.pow(pl.radius ?? 1, n) * Math.sqrt(mods.areaMult),
    range: def.baseRange * Math.pow(pl.range ?? 1, n),
    speed: def.baseProjectileSpeed * mods.projectileSpeedMult,
  };
}

/** Blade count / DPS / radius for an orbital or aura weapon (used by collision). */
export function resolveAoe(
  def: WeaponDef,
  level: number,
  mods: PlayerMods,
): { count: number; dps: number; radius: number } {
  const n = level - 1;
  const pl = def.perLevel;
  return {
    count: def.baseProjectiles + (pl.projectiles ?? 0) * n,
    dps: (def.baseDamage + (pl.damage ?? 0) * n) * mods.damageMult,
    radius: def.baseRange * Math.pow(pl.radius ?? 1, n) * Math.sqrt(mods.areaMult),
  };
}

/** Find an owned weapon by id (for collision-resolved orbital/aura weapons). */
export function findWeapon(world: World, id: string): { level: number } | undefined {
  return world.player.weapons.find((w) => w.id === id);
}

function spawnProjectile(
  world: World,
  vx: number,
  vy: number,
  damage: number,
  radius: number,
  pierce: number,
  life: number,
  homing: number,
  kind: number,
): void {
  const p = world.projectiles;
  const i = p.pool.spawn();
  if (i < 0) return;
  const { x, y } = world.player;
  p.x[i] = x;
  p.y[i] = y;
  p.prevX[i] = x;
  p.prevY[i] = y;
  p.vx[i] = vx;
  p.vy[i] = vy;
  p.damage[i] = damage;
  p.radius[i] = radius;
  p.pierce[i] = pierce;
  p.life[i] = life;
  p.homing[i] = homing;
  p.kind[i] = kind;
}

function nearestEnemy(world: World): number {
  const { enemies, player } = world;
  const active = enemies.pool.active;
  let best = -1;
  let bestD2 = Infinity;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    const dx = enemies.x[i]! - player.x;
    const dy = enemies.y[i]! - player.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = i;
    }
  }
  return best;
}

/** Render-tint index per weapon, so projectiles read distinctly. Mirrors the
 *  baked texture order in src/scripts/gambit.ts. */
const KIND_INDEX: Record<string, number> = {
  bolt: 0,
  radial: 1,
  lance: 2,
  seeker: 3,
};

/** Fire one projectile weapon this activation. Orbital/aura do nothing here. */
function fireWeapon(world: World, def: WeaponDef, stats: ResolvedShot): void {
  const { player, enemies } = world;
  const m = player.mods;
  let damage = stats.damage * m.damageMult;
  if (m.critChance > 0 && world.rng.chance(m.critChance)) damage *= m.critMult;
  const count = Math.max(1, Math.round(stats.projectiles));
  const own = Math.max(1, Math.round(stats.ownProjectiles));
  const tint = KIND_INDEX[def.kind] ?? 0;

  // Choose the base aim angle by behavior.
  let base: number;
  if (def.kind === 'lance') {
    base = Math.atan2(player.aimY, player.aimX);
  } else {
    const target = nearestEnemy(world);
    if (target < 0 && def.kind !== 'radial') return; // nothing to shoot at
    base =
      target >= 0
        ? Math.atan2(enemies.y[target]! - player.y, enemies.x[target]! - player.x)
        : Math.atan2(player.aimY, player.aimX);
  }
  world.events.push({ type: 'shoot', x: player.x, y: player.y, angle: base });

  const spread = (def.spreadDeg * Math.PI) / 180;
  for (let k = 0; k < count; k += 1) {
    let angle: number;
    if (def.kind === 'radial') {
      angle = (k / count) * Math.PI * 2; // even 360 ring
    } else if (count === 1) {
      angle = base;
    } else {
      angle = base + (k / (count - 1) - 0.5) * spread * (count - 1);
    }
    // The weapon's own shots hit full; Multishot extras (k >= own) hit for half.
    const shotDamage = k < own ? damage : damage * MULTISHOT_EXTRA_DAMAGE;
    spawnProjectile(
      world,
      Math.cos(angle) * stats.speed,
      Math.sin(angle) * stats.speed,
      shotDamage,
      stats.radius,
      stats.pierce,
      stats.range,
      def.homingTurn,
      tint,
    );
  }
}

export function updateWeapon(world: World, dt: number): void {
  const { player, projectiles, enemies } = world;

  // Advance and expire projectiles (homing ones steer toward the nearest foe).
  const active = projectiles.pool.active;
  const bound = ARENA_HALF + 80;
  let homingTarget = -1;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    projectiles.prevX[i] = projectiles.x[i]!;
    projectiles.prevY[i] = projectiles.y[i]!;
    const turn = projectiles.homing[i]!;
    if (turn > 0) {
      if (homingTarget < 0 || enemies.pool.active[homingTarget] !== 1) {
        homingTarget = nearestEnemy(world);
      }
      if (homingTarget >= 0) {
        const vx = projectiles.vx[i]!;
        const vy = projectiles.vy[i]!;
        const sp = Math.hypot(vx, vy) || 1;
        const dx = enemies.x[homingTarget]! - projectiles.x[i]!;
        const dy = enemies.y[homingTarget]! - projectiles.y[i]!;
        const dl = Math.hypot(dx, dy) || 1;
        const cross = (vx / sp) * (dy / dl) - (vy / sp) * (dx / dl);
        const dot = (vx / sp) * (dx / dl) + (vy / sp) * (dy / dl);
        let a = Math.atan2(cross, dot);
        const max = turn * dt;
        if (a > max) a = max;
        else if (a < -max) a = -max;
        const cs = Math.cos(a);
        const sn = Math.sin(a);
        projectiles.vx[i] = vx * cs - vy * sn;
        projectiles.vy[i] = vx * sn + vy * cs;
      }
    }
    const stepX = projectiles.vx[i]! * dt;
    const stepY = projectiles.vy[i]! * dt;
    projectiles.x[i] = projectiles.x[i]! + stepX;
    projectiles.y[i] = projectiles.y[i]! + stepY;
    projectiles.life[i] = projectiles.life[i]! - Math.hypot(stepX, stepY);
    const px = projectiles.x[i]!;
    const py = projectiles.y[i]!;
    if (projectiles.life[i]! <= 0 || px < -bound || px > bound || py < -bound || py > bound) {
      projectiles.pool.kill(i);
    }
  }

  // Fire each owned weapon on its own cadence.
  for (const w of player.weapons) {
    const def = WEAPONS[w.id];
    if (!def) continue;
    w.cooldown -= dt;
    if (w.cooldown > 0) continue;
    if (def.kind === 'orbital' || def.kind === 'aura') {
      w.cooldown = 0.25; // a slow tick; the weapon resolves continuously in collision
      continue;
    }
    const stats = resolveWeapon(def, w.level, player.mods);
    w.cooldown = stats.interval / player.mods.fireRateMult;
    fireWeapon(world, def, stats);
  }
}
