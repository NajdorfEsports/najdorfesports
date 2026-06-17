/**
 * Movement integration. The player moves by the normalized input vector at the
 * resolved speed. Most enemies are plain seekers (straight at the player). Two
 * exceptions force active play: the Lancer surges when it closes in, and the
 * Queen is steered with momentum (a limited turn rate) so she overshoots when
 * the player jukes sideways, which is the boss's skill-based counterplay. Each
 * entity records prevX/prevY first so the renderer can interpolate. No
 * enemy-enemy separation (swarms overlap by design).
 */
import {
  ARENA_HALF,
  LANCER_LUNGE_CAP,
  LANCER_LUNGE_DIST,
  LANCER_LUNGE_MULT,
  REAPER_ACCEL,
  REAPER_CRUISE,
  REAPER_LOCK_DIST,
  REAPER_LOCK_SPEED,
  REAPER_TURN,
} from '../constants';
import { LANCER_INDEX, REAPER_INDEX } from '../enemies';
import type { World } from '../types';

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** The Queen: steer her velocity toward the player with a capped turn rate and
 *  distance-based acceleration, then integrate by velocity so she carries
 *  momentum. Returns nothing; mutates the store in place. */
function stepReaper(world: World, i: number, dt: number): void {
  const { enemies, player } = world;
  const x = enemies.x[i]!;
  const y = enemies.y[i]!;
  const ddx = player.x - x;
  const ddy = player.y - y;
  const dist = Math.hypot(ddx, ddy) || 1;
  const dirx = ddx / dist;
  const diry = ddy / dist;

  let vx = enemies.vx[i]!;
  let vy = enemies.vy[i]!;
  let speed = Math.hypot(vx, vy);
  let hx: number;
  let hy: number;
  if (speed < 1) {
    hx = dirx;
    hy = diry;
    speed = REAPER_CRUISE;
  } else {
    hx = vx / speed;
    hy = vy / speed;
  }

  // Rotate the heading toward the player by at most REAPER_TURN per second.
  const cross = hx * diry - hy * dirx;
  const dot = hx * dirx + hy * diry;
  const turn = clamp(Math.atan2(cross, dot), -REAPER_TURN * dt, REAPER_TURN * dt);
  const cs = Math.cos(turn);
  const sn = Math.sin(turn);
  const nhx = hx * cs - hy * sn;
  const nhy = hx * sn + hy * cs;

  // Accelerate toward the locked speed when she has a line on you, else cruise.
  const target = dist < REAPER_LOCK_DIST ? REAPER_LOCK_SPEED : REAPER_CRUISE;
  speed += clamp(target - speed, -REAPER_ACCEL * dt, REAPER_ACCEL * dt);

  vx = nhx * speed;
  vy = nhy * speed;
  enemies.vx[i] = vx;
  enemies.vy[i] = vy;
  enemies.x[i] = clamp(x + vx * dt, -ARENA_HALF, ARENA_HALF);
  enemies.y[i] = clamp(y + vy * dt, -ARENA_HALF, ARENA_HALF);
}

export function updateMovement(world: World, dt: number): void {
  const { player, enemies } = world;

  player.prevX = player.x;
  player.prevY = player.y;
  const ilen = Math.hypot(player.inputX, player.inputY);
  if (ilen > 0.01) {
    player.stillTime = 0;
    // Aim follows your heading and persists while still, so movement-direction
    // weapons (the lance) fire one frozen arc for a stationary player.
    player.aimX = player.inputX / ilen;
    player.aimY = player.inputY / ilen;
    const speed = player.baseSpeed * player.mods.moveSpeedMult;
    player.x = clamp(player.x + (player.inputX / ilen) * speed * dt, -ARENA_HALF, ARENA_HALF);
    player.y = clamp(player.y + (player.inputY / ilen) * speed * dt, -ARENA_HALF, ARENA_HALF);
  } else {
    player.stillTime += dt;
  }

  const active = enemies.pool.active;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    enemies.prevX[i] = enemies.x[i]!;
    enemies.prevY[i] = enemies.y[i]!;

    if (enemies.type[i] === REAPER_INDEX) {
      stepReaper(world, i, dt);
      continue;
    }

    const dx = player.x - enemies.x[i]!;
    const dy = player.y - enemies.y[i]!;
    const d = Math.hypot(dx, dy) || 1;
    let speed = enemies.speed[i]!;
    // Lancer: surge toward the player once it has closed inside lunge range.
    if (enemies.type[i] === LANCER_INDEX && d < LANCER_LUNGE_DIST) {
      speed = Math.min(speed * LANCER_LUNGE_MULT, LANCER_LUNGE_CAP);
    }
    const stepLen = speed * dt;
    enemies.x[i] = enemies.x[i]! + (dx / d) * stepLen;
    enemies.y[i] = enemies.y[i]! + (dy / d) * stepLen;
  }
}
