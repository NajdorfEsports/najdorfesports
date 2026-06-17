/**
 * Hostile fire: the threat the player must DODGE no matter how fast it clears
 * the melee swarm. Ranged enemies (the Diviner caster) kite and loose aimed
 * bolts; elites add a slow telegraphed spread; the Queen fires a phase-escalating
 * pattern (aimed spreads, then rings) so her fight is a dodge test, not a DPS
 * race. Bolts travel at or under the player's move speed, so a moving player
 * threads them and a still one is hit. This runs after collision so it respects
 * the i-frames that frame's contact may have set.
 */
import {
  ARENA_HALF,
  ELITE_BOLT_DAMAGE,
  ELITE_BOLT_SPEED,
  ELITE_FIRE_INTERVAL,
  ENEMY_BOLT_LIFE,
  ENEMY_BOLT_RADIUS,
  QUEEN_BOLT_DAMAGE,
  QUEEN_BOLT_SPEED,
  QUEEN_FIRE_INTERVAL,
  enemyDamageScale,
} from '../constants';
import { ALL_ARCHETYPES, ELITE_INDEX, REAPER_INDEX } from '../enemies';
import type { World } from '../types';
import { hitPlayer } from './collision';

function spawnBolt(
  world: World,
  x: number,
  y: number,
  vx: number,
  vy: number,
  damage: number,
): void {
  const ep = world.enemyProjectiles;
  const i = ep.pool.spawn();
  if (i < 0) return;
  ep.x[i] = x;
  ep.y[i] = y;
  ep.prevX[i] = x;
  ep.prevY[i] = y;
  ep.vx[i] = vx;
  ep.vy[i] = vy;
  ep.damage[i] = damage;
  ep.radius[i] = ENEMY_BOLT_RADIUS;
  ep.life[i] = ENEMY_BOLT_LIFE;
}

/** Fire `n` bolts aimed at the player, fanned across `spread` radians. */
function fireSpread(
  world: World,
  x: number,
  y: number,
  n: number,
  spread: number,
  speed: number,
  damage: number,
): void {
  const base = Math.atan2(world.player.y - y, world.player.x - x);
  for (let k = 0; k < n; k += 1) {
    const off = n === 1 ? 0 : (k / (n - 1) - 0.5) * spread;
    const a = base + off;
    spawnBolt(world, x, y, Math.cos(a) * speed, Math.sin(a) * speed, damage);
  }
}

/** Fire `n` bolts evenly in a 360-degree ring (spaced so there are gaps to thread). */
function fireRing(
  world: World,
  x: number,
  y: number,
  n: number,
  speed: number,
  damage: number,
  phase: number,
): void {
  for (let k = 0; k < n; k += 1) {
    const a = phase + (k / n) * Math.PI * 2;
    // Offset the origin outward so adjacent bolts already have a gap point-blank.
    spawnBolt(
      world,
      x + Math.cos(a) * 36,
      y + Math.sin(a) * 36,
      Math.cos(a) * speed,
      Math.sin(a) * speed,
      damage,
    );
  }
}

/** The Queen's attack pattern, escalating with her fight phase. */
function fireQueen(world: World, j: number): void {
  const phase = world.director.reaperPhase;
  const x = world.enemies.x[j]!;
  const y = world.enemies.y[j]!;
  const t = world.time.elapsedS;
  if (phase >= 2) {
    fireRing(world, x, y, 14, QUEEN_BOLT_SPEED, QUEEN_BOLT_DAMAGE, t);
    fireSpread(world, x, y, 5, 0.5, QUEEN_BOLT_SPEED * 1.1, QUEEN_BOLT_DAMAGE);
  } else if (phase >= 1) {
    fireRing(world, x, y, 11, QUEEN_BOLT_SPEED, QUEEN_BOLT_DAMAGE, t);
    fireSpread(world, x, y, 4, 0.4, QUEEN_BOLT_SPEED, QUEEN_BOLT_DAMAGE);
  } else {
    fireSpread(world, x, y, 3, 0.35, QUEEN_BOLT_SPEED, QUEEN_BOLT_DAMAGE);
  }
}

export function updateEnemyFire(world: World, dt: number): void {
  const { enemyProjectiles, enemies, player } = world;

  // Advance hostile bolts; expire; check against the player (respecting i-frames).
  const active = enemyProjectiles.pool.active;
  const bound = ARENA_HALF + 60;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    enemyProjectiles.prevX[i] = enemyProjectiles.x[i]!;
    enemyProjectiles.prevY[i] = enemyProjectiles.y[i]!;
    const x = enemyProjectiles.x[i]! + enemyProjectiles.vx[i]! * dt;
    const y = enemyProjectiles.y[i]! + enemyProjectiles.vy[i]! * dt;
    enemyProjectiles.x[i] = x;
    enemyProjectiles.y[i] = y;
    enemyProjectiles.life[i] = enemyProjectiles.life[i]! - dt;
    if (enemyProjectiles.life[i]! <= 0 || x < -bound || x > bound || y < -bound || y > bound) {
      enemyProjectiles.pool.kill(i);
      continue;
    }
    if (player.iframes <= 0) {
      const dx = player.x - x;
      const dy = player.y - y;
      const rr = enemyProjectiles.radius[i]! + player.radius;
      if (dx * dx + dy * dy <= rr * rr) {
        hitPlayer(world, enemyProjectiles.damage[i]!);
        enemyProjectiles.pool.kill(i);
      }
    }
  }

  // Enemy firing: the Queen, elites, and ranged archetypes (casters).
  const elapsed = world.time.elapsedS;
  const dmgScale = enemyDamageScale(elapsed);
  const eActive = enemies.pool.active;
  for (let j = 0; j < eActive.length; j += 1) {
    if (eActive[j] !== 1) continue;
    const type = enemies.type[j]!;
    const isQueen = type === REAPER_INDEX;
    const isElite = type === ELITE_INDEX;
    const a = ALL_ARCHETYPES[type]!;
    if (!isQueen && !isElite && !a.ranged) continue;
    enemies.fireTimer[j] = enemies.fireTimer[j]! - dt;
    if (enemies.fireTimer[j]! > 0) continue;
    if (isQueen) {
      enemies.fireTimer[j] =
        world.director.reaperPhase >= 2 ? QUEEN_FIRE_INTERVAL * 0.6 : QUEEN_FIRE_INTERVAL;
      fireQueen(world, j);
    } else if (isElite) {
      enemies.fireTimer[j] = ELITE_FIRE_INTERVAL;
      fireSpread(
        world,
        enemies.x[j]!,
        enemies.y[j]!,
        3,
        0.5,
        ELITE_BOLT_SPEED,
        ELITE_BOLT_DAMAGE * dmgScale,
      );
    } else {
      enemies.fireTimer[j] = a.fireInterval ?? 2.5;
      fireSpread(
        world,
        enemies.x[j]!,
        enemies.y[j]!,
        1,
        0,
        a.projSpeed ?? 230,
        (a.projDamage ?? 12) * dmgScale,
      );
    }
  }
}
