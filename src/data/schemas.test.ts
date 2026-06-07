import { describe, it, expect } from 'vitest';
import { parseData, validateArray, RosterEntrySchema, MatchEntrySchema } from './schemas';

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
    ).toThrowError(/roster\.json[\s\S]*role[\s\S]*Invalid option/);
  });

  it('throws on a missing required field', () => {
    expect(() =>
      parseData(MatchEntrySchema, [{ id: '1', opponent: 'Y' }], [], 'matches'),
    ).toThrowError(/matches\.json/);
  });

  it('throws on a malformed date', () => {
    expect(() =>
      parseData(MatchEntrySchema, [{ ...goodMatch, date: '2026-13-40' }], [], 'matches'),
    ).toThrowError(/date/);
  });

  it('rejects an unknown field (.strict catches Liquipedia layout drift)', () => {
    expect(() =>
      parseData(RosterEntrySchema, [{ ...goodRoster[0], bogus: 1 }], [], 'roster'),
    ).toThrowError(/Unrecognized key|bogus/);
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
