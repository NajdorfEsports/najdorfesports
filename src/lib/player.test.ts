import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ageFromBirth, roleAccent, ROLE_ACCENT, DEFAULT_ACCENT } from './player';

describe('ageFromBirth (UTC, fixed system time 2026-06-07)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-07T00:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns null for missing or shape-invalid input', () => {
    expect(ageFromBirth(undefined)).toBeNull();
    expect(ageFromBirth('')).toBeNull();
    expect(ageFromBirth('not-a-date')).toBeNull();
    expect(ageFromBirth('20060821')).toBeNull();
    expect(ageFromBirth('2006/08/21')).toBeNull();
  });

  it('handles the birthday boundary in UTC', () => {
    expect(ageFromBirth('2005-01-01')).toBe(21); // birthday already passed
    expect(ageFromBirth('2005-06-07')).toBe(21); // birthday is today
    expect(ageFromBirth('2005-12-31')).toBe(20); // birthday later this year
    expect(ageFromBirth('2002-11-13')).toBe(23); // Tom4to
  });

  it('returns null for out-of-range ages', () => {
    expect(ageFromBirth('2030-01-01')).toBeNull(); // future -> negative
    expect(ageFromBirth('1850-01-01')).toBeNull(); // >= 100
  });
});

describe('roleAccent', () => {
  it('maps every known role to its accent', () => {
    for (const role of Object.keys(ROLE_ACCENT) as Array<keyof typeof ROLE_ACCENT>) {
      expect(roleAccent(role)).toBe(ROLE_ACCENT[role]);
    }
    expect(roleAccent('Tank')).toBe('var(--color-accent)');
    expect(roleAccent('Support')).toBe('#4ADE80');
  });

  it('falls back to DEFAULT_ACCENT for unknown roles', () => {
    expect(roleAccent('Mascot')).toBe(DEFAULT_ACCENT);
    expect(roleAccent('')).toBe(DEFAULT_ACCENT);
  });
});
