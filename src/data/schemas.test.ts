import { describe, it, expect, vi } from 'vitest';
import {
  parseData,
  validateArray,
  validateMerged,
  RosterEntrySchema,
  MatchEntrySchema,
} from './schemas';

const goodRoster = [{ handle: 'X', role: 'Tank', country: 'South Korea' }];
const goodMatch = {
  id: '1',
  date: '2026-06-04T14:00:00Z',
  opponent: 'Y',
  tournament: 'T',
  format: 'Bo3',
  result: 'win',
};

describe('parseData', () => {
  it('accepts valid auto + partial manual overrides', () => {
    const { auto, manual } = parseData(
      RosterEntrySchema,
      goodRoster,
      [{ handle: 'X', status: 'inactive' }],
      'roster',
    );
    expect(auto[0].handle).toBe('X');
    expect(manual[0].status).toBe('inactive');
  });

  it('throws an actionable error naming the file, field, and reason on a bad role', () => {
    expect(() =>
      parseData(RosterEntrySchema, [{ handle: 'X', role: 'TANK', country: 'K' }], [], 'roster'),
    ).toThrow(/roster\.json[\s\S]*role[\s\S]*Invalid option/);
  });

  it('throws on a missing required field', () => {
    expect(() => parseData(MatchEntrySchema, [{ id: '1', opponent: 'Y' }], [], 'matches')).toThrow(
      /matches\.json/,
    );
  });

  it('throws on a malformed date', () => {
    expect(() =>
      parseData(MatchEntrySchema, [{ ...goodMatch, date: '2026-13-40' }], [], 'matches'),
    ).toThrow(/date/);
  });

  it('rejects an unknown field (.strict catches Liquipedia layout drift)', () => {
    expect(() =>
      parseData(RosterEntrySchema, [{ ...goodRoster[0], bogus: 1 }], [], 'roster'),
    ).toThrow(/Unrecognized key|bogus/);
  });
});

describe('validateArray', () => {
  it('passes valid data and throws on invalid', () => {
    expect(validateArray(RosterEntrySchema, goodRoster, 'roster')).toHaveLength(1);
    expect(() =>
      validateArray(RosterEntrySchema, [{ handle: 'X', role: 'Bad', country: 'K' }], 'roster'),
    ).toThrow();
  });
});

describe('validateMerged', () => {
  it('drops a stale, partial manual-only orphan instead of throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // An override keyed to a now-changed match id (the Liquipedia time shifted):
    // it has no matching auto row and is only a partial record on its own.
    const merged = [goodMatch, { id: 'stale', opponent: 'Z' }];
    const out = validateMerged(
      MatchEntrySchema,
      merged,
      new Set([goodMatch.id]),
      'id',
      'matches (merged)',
    );
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe(goodMatch.id);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('keeps a complete manual-only entry (a fixture Liquipedia lacks)', () => {
    const manualOnly = { ...goodMatch, id: 'manual-1' };
    const out = validateMerged(
      MatchEntrySchema,
      [goodMatch, manualOnly],
      new Set([goodMatch.id]),
      'id',
      'matches (merged)',
    );
    expect(out.map((m) => m.id)).toEqual([goodMatch.id, 'manual-1']);
  });

  it('still throws LOUDLY when an auto-anchored row is malformed', () => {
    const badAuto = { ...goodMatch, result: 'nope' };
    expect(() =>
      validateMerged(MatchEntrySchema, [badAuto], new Set([badAuto.id]), 'id', 'matches (merged)'),
    ).toThrow(/matches \(merged\)[\s\S]*result/);
  });
});
