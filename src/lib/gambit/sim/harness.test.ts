import { describe, expect, it } from 'vitest';
import { kiteBot, runSeed, stationaryBot } from './harness';

const SEEDS = [101, 202, 303, 404, 505];
const CAP = 60 * 120; // 2 minutes

describe('balance tripwire', () => {
  it('skill is monotonic: kiting outlives standing still on average', () => {
    let kiteTotal = 0;
    let stillTotal = 0;
    for (const s of SEEDS) {
      kiteTotal += runSeed(s, kiteBot, CAP).survivalMs;
      stillTotal += runSeed(s, stationaryBot, CAP).survivalMs;
    }
    expect(kiteTotal).toBeGreaterThan(stillTotal);
  });

  it('death times have no single cliff and clear a sanity floor', () => {
    const deaths = SEEDS.map((s) => runSeed(s, stationaryBot, CAP).survivalMs);
    // Spawn variance should spread death times, not stack them on one frame.
    expect(new Set(deaths).size).toBeGreaterThanOrEqual(2);
    // The early game must be survivable for at least a few seconds.
    expect(Math.min(...deaths)).toBeGreaterThan(3000);
  });
});
