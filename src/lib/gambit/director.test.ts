import { describe, expect, it } from 'vitest';
import { difficultyCoeff } from './constants';
import { eligibleArchetypes } from './enemies';
import { step, createWorld } from './world';

describe('difficultyCoeff', () => {
  it('is non-decreasing over a run', () => {
    let prev = -Infinity;
    for (let t = 0; t <= 600; t += 5) {
      const c = difficultyCoeff(t);
      expect(c).toBeGreaterThanOrEqual(prev);
      prev = c;
    }
  });
});

describe('eligibleArchetypes (unlocks)', () => {
  it('unlocks archetypes over time; cheap fodder is not culled', () => {
    const early = eligibleArchetypes(0).map((a) => a.id);
    expect(early).toContain('pawn');
    expect(early).not.toContain('brute'); // unlocks at 70s
    expect(early).not.toContain('lancer'); // unlocks at 240s

    const late = eligibleArchetypes(560).map((a) => a.id);
    // Pawns now spawn the whole run (no cull) so density keeps climbing, not dips.
    expect(late).toContain('pawn');
    expect(late).toContain('knight');
    expect(late).toContain('lancer'); // a late-game charger
  });
});

describe('director budget', () => {
  it('never overspends credits', () => {
    const world = createWorld(0xabc);
    for (let i = 0; i < 60 * 60; i += 1) {
      step(world);
      expect(world.director.credits).toBeGreaterThanOrEqual(0);
      if (world.dead) break;
    }
  });
});
