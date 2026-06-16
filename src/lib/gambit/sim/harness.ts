/**
 * Headless balance harness. Because the sim is pure and seeded, a simple bot
 * can play full runs with no Pixi/DOM, which lets vitest assert balance
 * properties (the death-time band has no cliff; better play survives longer)
 * without any live analytics. Bots are deterministic, so a given seed replays
 * identically. Used by sim/harness.test.ts and world.test.ts.
 */
import { DEFAULT_HERO } from '../heroes';
import { applyUpgrade, offerChoices } from '../systems/progression';
import type { RunResult, World } from '../types';
import { createWorld, runResult, step } from '../world';

export interface BotMove {
  x: number;
  y: number;
}
export type BotPolicy = (world: World) => BotMove;

/** Does nothing: the worst possible play, dies the soonest. */
export const stationaryBot: BotPolicy = () => ({ x: 0, y: 0 });

/** Flees the nearest enemy and drifts back toward center: real skill. */
export const kiteBot: BotPolicy = (world) => {
  const { player, enemies } = world;
  const active = enemies.pool.active;
  let bx = 0;
  let by = 0;
  let bestD2 = Infinity;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1) continue;
    const dx = enemies.x[i]! - player.x;
    const dy = enemies.y[i]! - player.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      bx = dx;
      by = dy;
    }
  }
  // Away from the nearest enemy, with a gentle pull toward the arena center.
  return { x: -bx - player.x * 0.0025, y: -by - player.y * 0.0025 };
};

/** Play one full run with a bot, auto-picking the first offered card on level-up. */
export function runSeed(
  seed: number,
  policy: BotPolicy = kiteBot,
  maxSteps = 60 * 60 * 8,
  powerupLevels: Record<string, number> = {},
): RunResult {
  const world = createWorld(seed, DEFAULT_HERO, powerupLevels);
  const taken: Record<string, number> = {};
  while (!world.dead && world.time.stepCount < maxSteps) {
    const move = policy(world);
    world.player.inputX = move.x;
    world.player.inputY = move.y;
    step(world);
    for (const ev of world.events) {
      if (ev.type === 'levelup') {
        const choices = offerChoices(world.seed, ev.level, taken);
        if (choices.length > 0) applyUpgrade(world.player, taken, choices[0]!);
      }
    }
  }
  return runResult(world);
}
