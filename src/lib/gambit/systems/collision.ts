/**
 * Collision and pickups. Rebuilds the enemy grid, then resolves projectile->
 * enemy hits (damage, death, gem drop, pierce), enemy->player contact (damage
 * gated by i-frames), and gem magnet + pickup (XP and level-ups). Health
 * regen lands last. Death sets world.dead and emits the `died` event; the
 * caller stops stepping.
 */
import { MAGNET_SPEED, PLAYER_IFRAME } from '../constants';
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

export function updateCollision(world: World, dt: number): void {
  const { player, enemies, projectiles, gems, grid, events } = world;

  if (player.iframes > 0) player.iframes -= dt;

  // Rebuild the enemy grid in index order (deterministic bucket contents).
  grid.clear();
  const eActive = enemies.pool.active;
  for (let i = 0; i < eActive.length; i += 1) {
    if (eActive[i] === 1) grid.insert(i, enemies.x[i]!, enemies.y[i]!);
  }

  // Projectile -> enemy.
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
      enemies.hp[j] = enemies.hp[j]! - projectiles.damage[p]!;
      if (enemies.hp[j]! <= 0) {
        spawnGem(world, enemies.x[j]!, enemies.y[j]!, enemies.gem[j]!);
        events.push({
          type: 'kill',
          x: enemies.x[j]!,
          y: enemies.y[j]!,
          elite: enemies.elite[j] === 1,
          color: ALL_ARCHETYPES[enemies.type[j]!]!.color,
        });
        player.kills += 1;
        enemies.pool.kill(j);
      }
      if (projectiles.pierce[p]! > 0) {
        projectiles.pierce[p] = projectiles.pierce[p]! - 1;
      } else {
        dead = true;
      }
    });
    if (dead) projectiles.pool.kill(p);
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
