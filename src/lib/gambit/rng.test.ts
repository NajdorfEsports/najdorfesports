import { describe, expect, it } from 'vitest';
import { makeRng } from './rng';

describe('makeRng', () => {
  it('is deterministic for a given seed', () => {
    const a = makeRng(12345);
    const b = makeRng(12345);
    const seqA = Array.from({ length: 16 }, () => a.nextFloat());
    const seqB = Array.from({ length: 16 }, () => b.nextFloat());
    expect(seqA).toEqual(seqB);
  });

  it('diverges across seeds', () => {
    const a = makeRng(1);
    const b = makeRng(2);
    expect(a.nextFloat()).not.toBe(b.nextFloat());
  });

  it('keeps nextFloat in [0, 1) and nextInt in [0, n)', () => {
    const r = makeRng(99);
    for (let i = 0; i < 1000; i += 1) {
      const f = r.nextFloat();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
      const n = r.nextInt(7);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(7);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it('round-trips its state', () => {
    const r = makeRng(555);
    r.nextFloat();
    r.nextFloat();
    const snap = r.getState();
    const after = [r.nextFloat(), r.nextFloat(), r.nextFloat()];
    r.setState(snap);
    expect([r.nextFloat(), r.nextFloat(), r.nextFloat()]).toEqual(after);
  });
});
