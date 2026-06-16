import { describe, expect, it } from 'vitest';
import { DT } from './constants';
import { runSeed, stationaryBot } from './sim/harness';
import { createWorld, step } from './world';

function stateAfter(seed: number, steps: number): number {
  const w = createWorld(seed);
  for (let i = 0; i < steps; i += 1) step(w);
  return w.rng.getState();
}

describe('world.step', () => {
  it('advances time by exactly one fixed step', () => {
    const w = createWorld(1);
    step(w);
    expect(w.time.stepCount).toBe(1);
    expect(w.time.elapsedS).toBeCloseTo(DT, 10);
    expect(Array.isArray(w.events)).toBe(true);
  });
});

describe('determinism (same seed => same run)', () => {
  it('produces an identical RunResult for repeated runs', () => {
    const a = runSeed(0x1234, stationaryBot, 60 * 45);
    const b = runSeed(0x1234, stationaryBot, 60 * 45);
    expect(a).toEqual(b);
  });

  it('drives divergent seeded streams across seeds', () => {
    // Coarse run summaries can coincide, but the seeded streams themselves
    // diverge, which is what gives each daily its own spawn sequence.
    expect(stateAfter(1, 300)).not.toBe(stateAfter(2, 300));
  });
});
