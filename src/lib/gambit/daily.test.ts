import { describe, expect, it } from 'vitest';
import {
  GAMBIT_EPOCH,
  dailySeed,
  dayNumber,
  fnv1a,
  nextDate,
  nyDate,
  previousDate,
  secondsToNyMidnight,
} from './daily';

describe('daily seed + date helpers', () => {
  it('dailySeed is a pure function of the date string', () => {
    expect(dailySeed('2026-06-16')).toBe(dailySeed('2026-06-16'));
    expect(dailySeed('2026-06-16')).not.toBe(dailySeed('2026-06-17'));
  });

  it('fnv1a is stable and returns an unsigned 32-bit int', () => {
    const h = fnv1a('gambit');
    expect(h).toBe(fnv1a('gambit'));
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('nextDate and previousDate are inverses', () => {
    expect(previousDate(nextDate('2026-06-16'))).toBe('2026-06-16');
    expect(nextDate('2026-02-28')).toBe('2026-03-01');
  });

  it('numbers runs from the epoch', () => {
    expect(dayNumber(GAMBIT_EPOCH)).toBe(1);
    expect(dayNumber(nextDate(GAMBIT_EPOCH))).toBe(2);
  });

  it('nyDate is ISO-shaped and the countdown stays in range', () => {
    expect(nyDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const s = secondsToNyMidnight();
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(86_400);
  });
});
