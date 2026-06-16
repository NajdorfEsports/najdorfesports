/**
 * Collision and pickups. Rebuilds the enemy grid, then resolves: projectile ->
 * enemy hits (damage, Heavy Bolt splash, pierce), the orbiting-blade weapon
 * (continuous contact damage), enemy -> player contact (gated by i-frames), and
 * gem magnet + pickup (XP and level-ups). Elites and the Reaper drop a gem
 * "chest" on death. Health regen lands last. Death sets world.dead and emits
 * `died`; the caller stops stepping.
 */
import {
  MAGNET_SPEED,
  ORBIT_ANGULAR,
  ORBIT_DPS,
  ORBIT_HIT_RADIUS,
  ORBIT_RADIUS,
  PLAYER_IFRAME,
  SPLASH_FRACTION,
  damageForLevel,
} from '../constants';
import { ALL_ARCHETYPES } from '../enemies';
import type { World } from '../types';
import { addXp } from './progression';

function spawnGem(world: World, x: number, y: number, value: number): void {
  const g = world.gems;
  const i = g.pool.spawn();
  if (i < 0) return;
  g.x[i] = x;
  g.y[i] = y;
  g.prevX[i] = x;
  g.prevY[i] = y;
  g.value[i] = value;
}

/** Kill enemy j: drop its gem(s) (a scattered chest for elites), emit, recycle. */
function killEnemy(world: World, j: number): void {
  const { enemies, player, events } = world;
  const elite = enemies.elite[j] === 1;
  const ex = enemies.x[j]!;
  const ey = enemies.y[j]!;
  const gv = enemies.gem[j]!;
  if (elite) {
    const n = 6;
    for (let c = 0; c < n; c += 1) {
      const a = (c / n) * Math.PI * 2;
      spawnGem(world, ex + Math.cos(a) * 28, ey + Math.sin(a) * 28, gv / n);
    }
  } else {
    spawnGem(world, ex, ey, gv);
  }
  events.push({
    type: 'kill',
    x: ex,
    y: ey,
    elite,
    color: ALL_ARCHETYPES[enemies.type[j]!]!.color,
  });
  player.kills += 1;
  enemies.pool.kill(j);
}

export function updateCollision(world: World, dt: number): void {
  const { player, enemies, projectiles, gems, grid, events } = world;

  if (player.iframes > 0) player.iframes -= dt;

  // Rebuild the enemy grid in index order (deterministic bucket contents).
  grid.clear();
  const eActive = enemies.pool.active;
  for (let i = 0; i < eActive.length; i += 1) {
    if (eActive[i] === 1) grid.insert(i, enemies.x[i]!, enemies.y[i]!);
  }

  // Projectile -> enemy (with Heavy Bolt splash).
  const splashR = player.mods.splash;
  const pActive = projectiles.pool.active;
  for (let p = 0; p < pActive.length; p += 1) {
    if (pActive[p] !== 1) continue;
    const px = projectiles.x[p]!;
    const py = projectiles.y[p]!;
    const pr = projectiles.radius[p]!;
    let dead = false;
    grid.queryNeighbors(px, py, (j) => {
      if (dead || enemies.pool.active[j] !== 1) return;
      const rr = pr + enemies.radius[j]!;
      const dx = enemies.x[j]! - px;
      const dy = enemies.y[j]! - py;
      if (dx * dx + dy * dy > rr * rr) return;
      const dmg = projectiles.damage[p]!;
      const hx = enemies.x[j]!;
      const hy = enemies.y[j]!;
      enemies.hp[j] = enemies.hp[j]! - dmg;
      if (enemies.hp[j]! <= 0) killEnemy(world, j);
      if (splashR > 0) {
        const sd = dmg * SPLASH_FRACTION;
        grid.queryNeighbors(hx, hy, (k) => {
          if (k === j || enemies.pool.active[k] !== 1) return;
          const sdx = enemies.x[k]! - hx;
          const sdy = enemies.y[k]! - hy;
          if (sdx * sdx + sdy * sdy > splashR * splashR) return;
          enemies.hp[k] = enemies.hp[k]! - sd;
          if (enemies.hp[k]! <= 0) killEnemy(world, k);
        });
      }
      if (projectiles.pierce[p]! > 0) {
        projectiles.pierce[p] = projectiles.pierce[p]! - 1;
      } else {
        dead = true;
      }
    });
    if (dead) projectiles.pool.kill(p);
  }

  // Orbiting blades: continuous contact damage around the player.
  const orbiters = player.mods.orbiters;
  if (orbiters > 0) {
    const odmg = ORBIT_DPS * player.mods.damageMult * damageForLevel(player.level) * dt;
    const baseA = world.time.elapsedS * ORBIT_ANGULAR;
    for (let o = 0; o < orbiters; o += 1) {
      const a = baseA + (o / orbiters) * Math.PI * 2;
      const ox = player.x + Math.cos(a) * ORBIT_RADIUS;
      const oy = player.y + Math.sin(a) * ORBIT_RADIUS;
      grid.queryNeighbors(ox, oy, (k) => {
        if (enemies.pool.active[k] !== 1) return;
        const rr = enemies.radius[k]! + ORBIT_HIT_RADIUS;
        const dx = enemies.x[k]! - ox;
        const dy = enemies.y[k]! - oy;
        if (dx * dx + dy * dy > rr * rr) return;
        enemies.hp[k] = enemies.hp[k]! - odmg;
        if (enemies.hp[k]! <= 0) killEnemy(world, k);
      });
    }
  }

  // Enemy -> player (first overlap only; i-frames suppress the rest).
  if (player.iframes <= 0) {
    let hitDamage = 0;
    grid.queryNeighbors(player.x, player.y, (j) => {
      if (player.iframes > 0 || enemies.pool.active[j] !== 1) return;
      const rr = enemies.radius[j]! + player.radius;
      const dx = enemies.x[j]! - player.x;
      const dy = enemies.y[j]! - player.y;
      if (dx * dx + dy * dy > rr * rr) return;
      hitDamage = enemies.damage[j]!;
      player.iframes = PLAYER_IFRAME;
    });
    if (hitDamage > 0) {
      player.hp -= hitDamage;
      events.push({ type: 'hit', x: player.x, y: player.y });
      if (player.hp <= 0) {
        player.hp = 0;
        world.dead = true;
        events.push({ type: 'died' });
      }
    }
  }

  // Gems: magnet pull, then pickup -> XP.
  const magnetR = player.baseMagnetRadius * player.mods.magnetMult;
  const pickupR = player.radius + 16;
  const gActive = gems.pool.active;
  for (let i = 0; i < gActive.length; i += 1) {
    if (gActive[i] !== 1) continue;
    gems.prevX[i] = gems.x[i]!;
    gems.prevY[i] = gems.y[i]!;
    const dx = player.x - gems.x[i]!;
    const dy = player.y - gems.y[i]!;
    const d = Math.hypot(dx, dy);
    if (d <= pickupR) {
      addXp(player, gems.value[i]!, events);
      events.push({ type: 'pickup', value: gems.value[i]!, x: player.x, y: player.y });
      gems.pool.kill(i);
    } else if (d <= magnetR && d > 0) {
      const m = (MAGNET_SPEED * dt) / d;
      gems.x[i] = gems.x[i]! + dx * m;
      gems.y[i] = gems.y[i]! + dy * m;
    }
  }

  // Health regen (defense upgrades).
  if (!world.dead && player.mods.regenPerSec > 0) {
    player.hp = Math.min(player.maxHp, player.hp + player.mods.regenPerSec * dt);
  }
}
