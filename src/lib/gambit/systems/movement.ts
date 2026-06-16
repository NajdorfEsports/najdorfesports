/**
 * Movement integration. The player moves by the normalized input vector at the
 * resolved speed; every enemy seeks the player. Each entity records prevX/prevY
 * first so the renderer can interpolate between fixed steps. No enemy-enemy
 * separation (swarms overlap by design).
 */
import { ARENA_HALF } from '../constants';
import type { World } from '../types';

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function updateMovement(world: World, dt: number): void {
  const { player, enemies } = world;

  player.prevX = player.x;
  player.prevY = player.y;
  const ilen = Math.hypot(player.inputX, player.inputY);
  if (ilen > 0) {
    const speed = player.baseSpeed * player.mods.moveSpeedMult;
    player.x = clamp(player.x + (player.inputX / ilen) * speed * dt, -ARENA_HALF, ARENA_HALF);
    player.y = clamp(player.y + (player.inputY / ilen) * speed * dt, -ARENA_HALF, ARENA_HALF);
  }

  const active = enemies.pool.active;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    enemies.prevX[i] = enemies.x[i]!;
    enemies.prevY[i] = enemies.y[i]!;
    const dx = player.x - enemies.x[i]!;
    const dy = player.y - enemies.y[i]!;
    const d = Math.hypot(dx, dy) || 1;
    const step = enemies.speed[i]! * dt;
    enemies.x[i] = enemies.x[i]! + (dx / d) * step;
    enemies.y[i] = enemies.y[i]! + (dy / d) * step;
  }
}
