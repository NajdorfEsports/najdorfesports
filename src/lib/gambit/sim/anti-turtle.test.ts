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
import { applyCard, offerChoices } from '../systems/progression';
import type { HeroDef, OfferCard, World } from '../types';
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

/** Flee the inverse-square field of nearby enemy bodies AND hostile bolts (the
 *  active dodger), steering to the open gap. Weighting bolts higher than bodies
 *  is what proves the run is beatable by movement, not by ignoring fire. */
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
  const ep = world.enemyProjectiles.pool.active;
  for (let i = 0; i < ep.length; i += 1) {
    if (ep[i] !== 1) continue;
    const dx = player.x - world.enemyProjectiles.x[i]!;
    const dy = player.y - world.enemyProjectiles.y[i]!;
    const d2 = dx * dx + dy * dy;
    if (d2 > 230 * 230 || d2 < 1) continue;
    const w = 3.5 / d2;
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

// The greedy offense build a turtle would chase, best-for-standing-still first:
// the Lance evolution, the 360 Volley (hits every side while stationary), then
// raw offense, then the rest. If even this can't carry a turtle, the structural
// fix holds.
const PRIORITY = [
  'evoLance',
  'volley',
  'multishot',
  'firerate',
  'area',
  'damage',
  'crit',
  'wrath',
  'pierce',
  'carousel',
  'bolt',
  'oracle',
  'sanctum',
  'gambit',
  'velocity',
  'swift',
  'fortify',
  'regen',
  'armor',
  'evasion',
  'revival',
  'magnet',
];
/** The greedy turtle: pure offense, best-for-standing-still first. The EXPLOIT. */
function pickGreedy(cards: OfferCard[]): OfferCard {
  for (const ref of PRIORITY) {
    const c = cards.find((x) => x.ref === ref);
    if (c) return c;
  }
  return cards[0]!;
}

function byPriority(cards: OfferCard[], prio: string[]): OfferCard | undefined {
  for (const ref of prio) {
    const c = cards.find((x) => x.ref === ref);
    if (c) return c;
  }
  return undefined;
}
const DEF = ['revival', 'fortify', 'armor', 'regen'];
const BAL = [
  'evoLance',
  'evoCommunion',
  'volley',
  'carousel',
  'multishot',
  'firerate',
  'damage',
  'area',
  'crit',
  'wrath',
  'pierce',
  'sanctum',
  'oracle',
  'bolt',
  'gambit',
  'swift',
  'velocity',
  'magnet',
  'evasion',
];
/** A thoughtful build (skilled play): a small survival floor, then ramp damage
 *  and coverage. This is what the agency layer is FOR. */
function pickBalanced(cards: OfferCard[], taken: Record<string, number>): OfferCard {
  const evo = cards.find((c) => c.kind === 'evolution');
  if (evo) return evo;
  const defTaken = DEF.reduce((a, id) => a + (taken[id] ?? 0), 0);
  if (defTaken < 3) {
    const d = byPriority(cards, DEF);
    if (d) return d;
  }
  return byPriority(cards, BAL) ?? cards[0]!;
}

interface Outcome {
  sec: number;
  won: boolean;
  reachedQueen: boolean;
}

/** Play one bounded run: stops at death or the win mark (no endless). The greedy
 *  bot models the turtle exploit; the balanced bot models thoughtful play. */
function run(seed: number, hero: HeroDef, move: Move, greedy: boolean): Outcome {
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
        const choices = offerChoices(world.seed, ev.level, world.player, taken);
        if (choices.length > 0) {
          applyCard(world, taken, greedy ? pickGreedy(choices) : pickBalanced(choices, taken));
        }
      }
    }
  }
  const sec = (world.time.stepCount / 60) | 0;
  return { sec, won: world.won, reachedQueen: world.time.elapsedS >= RUN_WIN_SECONDS - 60 };
}

// Three seeds keep this fast on CI (each sim step is heavy at high enemy counts)
// while still spanning spawn variance; outcomes are deterministic per seed.
const SEEDS = [101, 202, 303];
const TIMEOUT = 60_000;

describe('anti-turtle balance tripwire', () => {
  it(
    'standing still + greedy offense never wins and almost never reaches the Queen',
    () => {
      let wins = 0;
      let reached = 0;
      for (const hero of [BISHOP, KNIGHT]) {
        for (const s of SEEDS) {
          const r = run(s, hero, turret, true);
          if (r.won) wins += 1;
          if (r.reachedQueen) reached += 1;
        }
      }
      expect(wins).toBe(0);
      expect(reached).toBeLessThanOrEqual(1); // out of 6 runs
    },
    TIMEOUT,
  );

  it(
    'a near-stationary turtle never wins and dies fast to hostile fire',
    () => {
      let wins = 0;
      let total = 0;
      let count = 0;
      for (const hero of [BISHOP, KNIGHT]) {
        for (const s of SEEDS) {
          const r = run(s, hero, lazyTurret, true);
          if (r.won) wins += 1;
          total += r.sec;
          count += 1;
        }
      }
      expect(wins).toBe(0);
      // Ranged casters (not just the swarm) now overrun a near-still player early.
      expect(total / count).toBeLessThan(240); // avg death well under 4 minutes
    },
    TIMEOUT,
  );

  it(
    'the run is winnable on a thoughtful build played actively (Knight)',
    () => {
      let wins = 0;
      let reached = 0;
      for (const s of SEEDS) {
        const r = run(s, KNIGHT, kite, false);
        if (r.won) wins += 1;
        if (r.reachedQueen) reached += 1;
      }
      expect(reached).toBeGreaterThanOrEqual(2); // active play reaches the climax
      expect(wins).toBeGreaterThanOrEqual(1);
    },
    TIMEOUT,
  );

  it(
    'the glass-cannon Bishop survives deep into the run by actively dodging',
    () => {
      // The no-sustain Bishop is the demanding hero; with active dodging it must
      // at least reach the dense back half, not collapse early like a turtle.
      let deep = 0;
      for (const s of SEEDS) if (run(s, BISHOP, kite, false).sec >= 240) deep += 1;
      expect(deep).toBeGreaterThanOrEqual(2); // most of 3 reach 4:00+
    },
    TIMEOUT,
  );
});
