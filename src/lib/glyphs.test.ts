import { describe, it, expect } from 'vitest';
import {
  extractCjkCodepoints,
  baselineCodepoints,
  toSubsetString,
  toUnicodeRange,
  fromUnicodeRange,
} from './glyphs';

describe('extractCjkCodepoints', () => {
  it('finds ideographs and fullwidth punctuation, ignores Latin', () => {
    const cps = extractCjkCodepoints('賽程 schedule，勝');
    expect(cps.has('賽'.codePointAt(0)!)).toBe(true);
    expect(cps.has('程'.codePointAt(0)!)).toBe(true);
    expect(cps.has('，'.codePointAt(0)!)).toBe(true);
    expect(cps.has('勝'.codePointAt(0)!)).toBe(true);
    expect(cps.has('s'.codePointAt(0)!)).toBe(false);
    expect(cps.has(' '.codePointAt(0)!)).toBe(false);
  });

  it('ignores emoji and flags', () => {
    const cps = extractCjkCodepoints('🇰🇷⚡');
    expect(cps.size).toBe(0);
  });
});

describe('baselineCodepoints', () => {
  it('includes ASCII letters, digits, and typographic marks', () => {
    const cps = baselineCodepoints();
    expect(cps.has('A'.codePointAt(0)!)).toBe(true);
    expect(cps.has('7'.codePointAt(0)!)).toBe(true);
    expect(cps.has('…'.codePointAt(0)!)).toBe(true);
    expect(cps.has(0x1f).valueOf()).toBe(false);
  });
});

describe('toSubsetString', () => {
  it('round-trips every codepoint exactly once', () => {
    const cps = new Set([0x4e00, 0x4e01, 0x52dd]);
    const s = toSubsetString(cps);
    expect([...s]).toHaveLength(3);
    expect(s).toContain('勝');
  });
});

describe('unicode-range round trip', () => {
  it('collapses contiguous runs and parses back', () => {
    const cps = new Set([0x4e00, 0x4e01, 0x4e02, 0x52dd, 0x52de]);
    const range = toUnicodeRange(cps);
    expect(range).toBe('U+4E00-4E02, U+52DD-52DE');
    expect(fromUnicodeRange(range)).toEqual(cps);
  });

  it('renders singletons without a dash', () => {
    expect(toUnicodeRange(new Set([0x52dd]))).toBe('U+52DD');
  });
});
