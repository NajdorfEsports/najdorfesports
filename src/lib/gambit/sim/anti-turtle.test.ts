/**
 * Anti-turtle balance tripwire. The owner's core complaint was that a skilled
 * player could stand nearly still, max a few offensive upgrades, and out-DPS the
 * whole run. These deterministic bots encode that exploit and its antidote:
 *
 *  - turret / lazyTurret: stand still (or twitch only when an enemy is on top of
 *    you) and greedily take the dominant offensive upgrades. Turtling MUST fail.
 *  - kite: a wide active mover (the Bishop's spacing game) MUST still reach the
 *    climax Queen, so the fix is positional, not a blanket difficulty hike.
 *  - closeKite: tight aggressive movement (the Knight's lifesteal game). The run
 *    MUST be winnable for a hero played to its strength.
 *
 * Bots are pure and seeded, so this is reproducible and needs no analytics. It is
 * deliberately bounded (runs stop at the win mark) to stay fast.
 */
import { describe, expect, it } from 'vitest';
import { RUN_WIN_SECONDS } from '../constants';
import { BISHOP, KNIGHT } from '../heroes';
import { applyUpgrade, offerChoices } from '../systems/progression';
import type { HeroDef, World } from '../types';
import { createWorld, step } from '../world';

type Move = (w: World) => { x: number; y: number };

function nearest(world: World): { dist: number; bx: number; by: number } {
  const { player, enemies } = world;
  const active = enemies.pool.active;
  let bx = 0;
  let by = 0;
  let best = Infinity;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    const dx = enemies.x[i]! - player.x;
    const dy = enemies.y[i]! - player.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < best) {
      best = d2;
      bx = dx;
      by = dy;
    }
  }
  return { dist: Math.sqrt(best), bx, by };
}

/** Flee the inverse-square field of nearby enemies (steer to the open gap). */
function fieldKite(world: World, radius: number): { x: number; y: number } {
  const { player, enemies } = world;
  const active = enemies.pool.active;
  let rx = 0;
  let ry = 0;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    const dx = player.x - enemies.x[i]!;
    const dy = player.y - enemies.y[i]!;
    const d2 = dx * dx + dy * dy;
    if (d2 > radius * radius || d2 < 1) continue;
    const w = 1 / d2;
    rx += dx * w;
    ry += dy * w;
  }
  const rl = Math.hypot(rx, ry) || 1;
  return { x: rx / rl - player.x * 0.0012, y: ry / rl - player.y * 0.0012 };
}

const turret: Move = () => ({ x: 0, y: 0 });
const lazyTurret: Move = (world) => {
  const n = nearest(world);
  return n.dist < 90 ? { x: -n.bx, y: -n.by } : { x: 0, y: 0 };
};
const kite: Move = (world) => fieldKite(world, 320);
const closeKite: Move = (world) => fieldKite(world, 170);

// The four dominant offensive upgrades, then the rest: the abused build.
const PRIORITY = [
  'multishot',
  'firerate',
  'pierce',
  'velocity',
  'damage',
  'crit',
  'area',
  'orbiters',
  'swift',
  'fortify',
  'regen',
  'magnet',
];
function pickGreedy(choices: string[]): string {
  for (const id of PRIORITY) if (choices.includes(id)) return id;
  return choices[0]!;
}

interface Outcome {
  sec: number;
  won: boolean;
  reachedQueen: boolean;
}

/** Play one bounded run: stops at death or the win mark (no endless). */
function run(seed: number, hero: HeroDef, move: Move): Outcome {
  const world = createWorld(seed, hero, {});
  const taken: Record<string, number> = {};
  const maxSteps = 60 * 60 * 11;
  while (!world.dead && !world.won && world.time.stepCount < maxSteps) {
    const m = move(world);
    world.player.inputX = m.x;
    world.player.inputY = m.y;
    step(world);
    for (const ev of world.events) {
      if (ev.type === 'levelup') {
        const choices = offerChoices(world.seed, ev.level, taken);
        if (choices.length > 0) applyUpgrade(world.player, taken, pickGreedy(choices));
      }
    }
  }
  const sec = (world.time.stepCount / 60) | 0;
  return { sec, won: world.won, reachedQueen: world.time.elapsedS >= RUN_WIN_SECONDS - 60 };
}

const SEEDS = [101, 202, 303, 404];
const TIMEOUT = 60_000;

describe('anti-turtle balance tripwire', () => {
  it(
    'standing perfectly still never wins and almost never reaches the Queen',
    () => {
      let wins = 0;
      let reached = 0;
      for (const hero of [BISHOP, KNIGHT]) {
        for (const s of SEEDS) {
          const r = run(s, hero, turret);
          if (r.won) wins += 1;
          if (r.reachedQueen) reached += 1;
        }
      }
      expect(wins).toBe(0);
      expect(reached).toBeLessThanOrEqual(1); // out of 8 runs
    },
    TIMEOUT,
  );

  it(
    'a near-stationary turtle (the owner exploit) never wins',
    () => {
      let wins = 0;
      for (const hero of [BISHOP, KNIGHT]) {
        for (const s of SEEDS) if (run(s, hero, lazyTurret).won) wins += 1;
      }
      expect(wins).toBe(0);
    },
    TIMEOUT,
  );

  it(
    'an active wide-kiting Bishop still reaches the climax Queen',
    () => {
      let reached = 0;
      for (const s of SEEDS) if (run(s, BISHOP, kite).reachedQueen) reached += 1;
      expect(reached).toBeGreaterThanOrEqual(3); // >= 3/4: the fix is positional
    },
    TIMEOUT,
  );

  it(
    'the run is winnable for a hero played to its strength (aggressive Knight)',
    () => {
      let wins = 0;
      for (const s of SEEDS) if (run(s, KNIGHT, closeKite).won) wins += 1;
      expect(wins).toBeGreaterThanOrEqual(1);
    },
    TIMEOUT,
  );
});
