import { describe, expect, it } from 'vitest';
import { kiteBot, runSeed, stationaryBot } from './harness';

const SEEDS = [101, 202, 303];
// 2 minutes: long enough that a stationary player is overrun (the on-ramp is
// gentle now, so a shorter cap leaves nothing dead and gives no signal), short
// enough to stay fast. Each sim step is heavy at high enemy counts, so every sim
// test carries an explicit timeout (the default 5s flakes on slow CI).
const CAP = 60 * 120;
const TIMEOUT = 30_000;

describe('balance tripwire', () => {
  it(
    'skill is monotonic: kiting outlives standing still on average',
    () => {
      let kiteTotal = 0;
      let stillTotal = 0;
      for (const s of SEEDS) {
        kiteTotal += runSeed(s, kiteBot, CAP).survivalMs;
        stillTotal += runSeed(s, stationaryBot, CAP).survivalMs;
      }
      expect(kiteTotal).toBeGreaterThan(stillTotal);
    },
    TIMEOUT,
  );

  it(
    'death times have no single cliff and clear a sanity floor',
    () => {
      const deaths = SEEDS.map((s) => runSeed(s, stationaryBot, CAP).survivalMs);
      // Spawn variance should spread death times, not stack them on one frame.
      expect(new Set(deaths).size).toBeGreaterThanOrEqual(2);
      // The early game must be survivable for at least a few seconds.
      expect(Math.min(...deaths)).toBeGreaterThan(3000);
    },
    TIMEOUT,
  );
});
