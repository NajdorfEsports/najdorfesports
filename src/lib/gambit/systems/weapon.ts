/**
 * Auto-firing weapon. Advances live projectiles, then fires on cadence at the
 * nearest enemy, fanning out extra projectiles within the weapon's spread.
 * Per-shot stats combine the WeaponDef bases with the run's PlayerMods, so
 * every upgrade is felt here. Projectiles expire by travel distance or arena
 * bounds.
 */
import { ARENA_HALF } from '../constants';
import type { World } from '../types';
import { WEAPONS } from '../weapons';

function spawnProjectile(
  world: World,
  x: number,
  y: number,
  vx: number,
  vy: number,
  damage: number,
  radius: number,
  pierce: number,
  life: number,
): void {
  const p = world.projectiles;
  const i = p.pool.spawn();
  if (i < 0) return;
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

function fire(world: World, target: number): void {
  const { player, enemies } = world;
  const def = WEAPONS[player.weaponId]!;
  const m = player.mods;
  const damage = def.baseDamage * m.damageMult;
  const speed = def.baseProjectileSpeed * m.projectileSpeedMult;
  const radius = def.projectileRadius * Math.sqrt(m.areaMult);
  const pierce = def.basePierce + m.pierce;
  const count = def.baseProjectiles + m.extraProjectiles;

  const dx = enemies.x[target]! - player.x;
  const dy = enemies.y[target]! - player.y;
  const base = Math.atan2(dy, dx);
  world.events.push({ type: 'shoot', x: player.x, y: player.y, angle: base });
  const spread = (def.spreadDeg * Math.PI) / 180;
  for (let k = 0; k < count; k += 1) {
    const offset = count === 1 ? 0 : (k / (count - 1) - 0.5) * spread * (count - 1);
    const angle = base + offset;
    spawnProjectile(
      world,
      player.x,
      player.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      damage,
      radius,
      pierce,
      def.baseRange,
    );
  }
}

export function updateWeapon(world: World, dt: number): void {
  const { player, projectiles } = world;

  // Advance and expire projectiles.
  const active = projectiles.pool.active;
  const bound = ARENA_HALF + 80;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    projectiles.prevX[i] = projectiles.x[i]!;
    projectiles.prevY[i] = projectiles.y[i]!;
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

  // Fire on cadence.
  player.cooldown -= dt;
  if (player.cooldown <= 0) {
    const def = WEAPONS[player.weaponId]!;
    player.cooldown = def.baseInterval / player.mods.fireRateMult;
    const target = nearestEnemy(world);
    if (target >= 0) fire(world, target);
  }
}
