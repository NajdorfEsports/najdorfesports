import { describe, it, expect } from 'vitest';
import { formatDate, formatMatchTime, translateTournament, translatePlacement } from './format';

describe('formatDate (pinned to UTC)', () => {
  it('renders the same calendar day for every viewer (en)', () => {
    expect(formatDate('2026-05-23', 'en')).toBe('May 23, 2026');
  });
  it('localizes for Chinese', () => {
    expect(formatDate('2026-05-23', 'zh-CN')).toContain('5');
  });
  it('does not throw on an invalid date', () => {
    expect(typeof formatDate('bogus', 'en')).toBe('string');
  });
});

describe('formatMatchTime (pinned to ICT / UTC+7)', () => {
  it('renders a UTC instant in ICT with the zone label', () => {
    // 14:00Z == 21:00 ICT
    const out = formatMatchTime('2026-06-07T14:00:00Z', 'en');
    expect(out).toMatch(/9:00/);
    expect(out.endsWith(' ICT')).toBe(true);
  });
});

describe('translateTournament', () => {
  it('passes English through unchanged', () => {
    expect(translateTournament('OWCS Pacific Stage 1', 'en')).toBe('OWCS Pacific Stage 1');
  });
  it('translates stage + qualifier terms (zh-CN) while keeping brand fragments', () => {
    const out = translateTournament('OWCS Pacific Stage 1 Open Qualifier', 'zh-CN');
    expect(out).toContain('第一阶段');
    expect(out).toContain('公开预选赛');
    expect(out).toContain('OWCS');
  });
  it('applies the longest match first (Regional Playoffs as a unit)', () => {
    expect(translateTournament('Regional Playoffs', 'zh-CN')).toBe('区域季后赛');
  });
  it('returns an empty string for undefined', () => {
    expect(translateTournament(undefined, 'zh-CN')).toBe('');
  });
});

describe('translatePlacement', () => {
  it('uses podium shortcuts', () => {
    expect(translatePlacement('1st', 'zh-TW')).toBe('冠軍');
    expect(translatePlacement('2nd', 'zh-CN')).toBe('亚军');
    expect(translatePlacement('3rd', 'zh-TW')).toBe('季軍');
  });
  it('handles Top N, ranges, and generic Nth', () => {
    expect(translatePlacement('Top 8', 'zh-CN')).toBe('前 8 名');
    expect(translatePlacement('3rd-4th', 'zh-CN')).toBe('第 3–4 名');
    expect(translatePlacement('5th', 'zh-CN')).toBe('第 5 名');
  });
  it('passes English through and leaves unknown placements as-is', () => {
    expect(translatePlacement('1st', 'en')).toBe('1st');
    expect(translatePlacement('DNF', 'zh-CN')).toBe('DNF');
  });
});
