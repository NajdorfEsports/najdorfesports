/**
 * Collision and pickups. Rebuilds the enemy grid, then resolves: projectile ->
 * enemy hits (damage, splash, pierce, with an elite armor + per-hit cap so
 * minibosses survive focused fire), the orbital and aura weapons (continuous
 * damage from the player's owned weapons), enemy -> player contact (gated by
 * i-frames, reduced by armor, negated by dodge, and survivable once via a
 * revival charge), and gem magnet + pickup (XP and level-ups). Elites and the
 * Queen drop a gem "chest" on death. Mending regen lands last. Death sets
 * world.dead and emits `died`; the caller stops stepping.
 */
import {
  ELITE_HIT_CAP_FRAC,
  MAGNET_SPEED,
  MENDING_BLOCK_COUNT,
  MENDING_BLOCK_R,
  ORBIT_ANGULAR,
  ORBIT_HIT_RADIUS,
  PLAYER_IFRAME,
  SPLASH_FRACTION,
  STILL_HEAL_DELAY,
} from '../constants';
import { ALL_ARCHETYPES } from '../enemies';
import type { World } from '../types';
import { WEAPONS } from '../weapons';
import { addXp } from './progression';
import { resolveAoe } from './weapon';

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

/** Apply `raw` damage to enemy j. Elites subtract armor and cap each DISCRETE
 *  hit at a fraction of their max HP, so no single shot deletes a miniboss;
 *  continuous damage (orbital/aura) bypasses the cap but still chips them. */
function damageEnemy(world: World, j: number, raw: number, discrete: boolean): void {
  const { enemies } = world;
  let dmg = raw;
  if (discrete && enemies.elite[j] === 1) {
    dmg = Math.max(1, dmg - enemies.armor[j]!);
    const cap = enemies.maxHp[j]! * ELITE_HIT_CAP_FRAC;
    if (dmg > cap) dmg = cap;
  }
  enemies.hp[j] = enemies.hp[j]! - dmg;
  if (enemies.hp[j]! <= 0) killEnemy(world, j);
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
  if (player.mods.lifestealOnKill > 0) {
    player.hp = Math.min(player.maxHp, player.hp + player.mods.lifestealOnKill);
  }
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

  // Projectile -> enemy (with splash).
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
      damageEnemy(world, j, dmg, true);
      if (splashR > 0) {
        const sd = dmg * SPLASH_FRACTION;
        grid.queryNeighbors(hx, hy, (k) => {
          if (k === j || enemies.pool.active[k] !== 1) return;
          const sdx = enemies.x[k]! - hx;
          const sdy = enemies.y[k]! - hy;
          if (sdx * sdx + sdy * sdy > splashR * splashR) return;
          damageEnemy(world, k, sd, true);
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

  // Orbital + aura weapons: continuous damage from the player's owned weapons.
  for (const w of player.weapons) {
    const def = WEAPONS[w.id];
    if (!def) continue;
    if (def.kind === 'orbital') {
      const { count, dps, radius } = resolveAoe(def, w.level, player.mods);
      const odmg = dps * dt;
      const blades = Math.max(1, Math.round(count));
      const baseA = world.time.elapsedS * ORBIT_ANGULAR;
      for (let o = 0; o < blades; o += 1) {
        const a = baseA + (o / blades) * Math.PI * 2;
        const ox = player.x + Math.cos(a) * radius;
        const oy = player.y + Math.sin(a) * radius;
        grid.queryNeighbors(ox, oy, (k) => {
          if (enemies.pool.active[k] !== 1) return;
          const rr = enemies.radius[k]! + ORBIT_HIT_RADIUS;
          const dx = enemies.x[k]! - ox;
          const dy = enemies.y[k]! - oy;
          if (dx * dx + dy * dy > rr * rr) return;
          damageEnemy(world, k, odmg, false);
        });
      }
    } else if (def.kind === 'aura') {
      const { dps, radius } = resolveAoe(def, w.level, player.mods);
      const admg = dps * dt;
      grid.queryNeighbors(player.x, player.y, (k) => {
        if (enemies.pool.active[k] !== 1) return;
        const rr = enemies.radius[k]! + radius;
        const dx = enemies.x[k]! - player.x;
        const dy = enemies.y[k]! - player.y;
        if (dx * dx + dy * dy > rr * rr) return;
        damageEnemy(world, k, admg, false);
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
      const dodged = player.mods.dodgeChance > 0 && world.rng.chance(player.mods.dodgeChance);
      if (!dodged) {
        player.hp -= Math.max(1, hitDamage - player.mods.armor);
        events.push({ type: 'hit', x: player.x, y: player.y });
        if (player.hp <= 0) {
          if (player.mods.revivalCharges > 0) {
            player.mods.revivalCharges -= 1;
            player.hp = player.maxHp * 0.5;
            player.iframes = PLAYER_IFRAME * 3; // brief mercy after an undeath
          } else {
            player.hp = 0;
            world.dead = true;
            events.push({ type: 'died' });
          }
        }
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

  // Mending regen: a deliberate, risky choice. It needs you held still long
  // enough AND a cleared pocket (few enemies nearby), and it is fully off while
  // the climax Queen is alive. So healing rewards EARNING space, never parking
  // in a swarm or out-sustaining the final boss.
  if (
    !world.dead &&
    player.mods.regenPerSec > 0 &&
    player.stillTime >= STILL_HEAL_DELAY &&
    world.director.reaperIndex < 0
  ) {
    let near = 0;
    grid.queryNeighbors(player.x, player.y, (j) => {
      if (enemies.pool.active[j] !== 1) return;
      const dx = enemies.x[j]! - player.x;
      const dy = enemies.y[j]! - player.y;
      if (dx * dx + dy * dy <= MENDING_BLOCK_R * MENDING_BLOCK_R) near += 1;
    });
    if (near < MENDING_BLOCK_COUNT) {
      player.hp = Math.min(player.maxHp, player.hp + player.mods.regenPerSec * dt);
    }
  }
}
