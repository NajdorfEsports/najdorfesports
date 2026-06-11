import { describe, it, expect } from 'vitest';
import { splitMatches, recordOf, seriesScore } from './matches';
import type { MatchEntry } from '../data/site';

const NOW = Date.parse('2026-06-11T12:00:00.000Z');

function match(overrides: Partial<MatchEntry> & { id: string }): MatchEntry {
  return {
    date: '2026-06-01T11:00:00.000Z',
    opponent: 'Opponent',
    tournament: 'OWCS Pacific 2026 · Stage 2',
    format: 'BO5',
    result: 'tbd',
    ...overrides,
  } as MatchEntry;
}

describe('splitMatches', () => {
  it('buckets by date and sorts upcoming asc, past desc', () => {
    const a = match({ id: 'a', date: '2026-06-01T11:00:00.000Z', result: 'win' });
    const b = match({ id: 'b', date: '2026-06-09T11:00:00.000Z', result: 'loss' });
    const c = match({ id: 'c', date: '2026-06-20T11:00:00.000Z' });
    const d = match({ id: 'd', date: '2026-06-14T11:00:00.000Z' });
    const out = splitMatches([a, c, b, d], NOW);
    expect(out.upcoming.map((m) => m.id)).toEqual(['d', 'c']);
    expect(out.past.map((m) => m.id)).toEqual(['b', 'a']);
  });

  it('a past-dated tbd match never lands in completed', () => {
    const played = match({ id: 'played', date: '2026-06-09T11:00:00.000Z', result: 'win' });
    const unscored = match({ id: 'unscored', date: '2026-06-11T11:00:00.000Z', result: 'tbd' });
    const out = splitMatches([played, unscored], NOW);
    expect(out.past.map((m) => m.id)).toEqual(['unscored', 'played']);
    expect(out.completed.map((m) => m.id)).toEqual(['played']);
    expect(out.awaitingResult.map((m) => m.id)).toEqual(['unscored']);
  });

  it('a match dated exactly now counts as upcoming', () => {
    const edge = match({ id: 'edge', date: new Date(NOW).toISOString() });
    const out = splitMatches([edge], NOW);
    expect(out.upcoming.map((m) => m.id)).toEqual(['edge']);
    expect(out.past).toEqual([]);
  });
});

describe('recordOf', () => {
  it('counts wins and losses and ignores tbd', () => {
    const matches = [
      match({ id: 'w1', result: 'win' }),
      match({ id: 'w2', result: 'win' }),
      match({ id: 'l1', result: 'loss' }),
      match({ id: 't1', result: 'tbd' }),
    ];
    expect(recordOf(matches)).toEqual({ wins: 2, losses: 1 });
  });

  it('is all zeroes for an empty list', () => {
    expect(recordOf([])).toEqual({ wins: 0, losses: 0 });
  });
});

describe('seriesScore', () => {
  it('derives the map count and skips drawn maps', () => {
    const m = match({
      id: 'm',
      result: 'win',
      mapScores: [
        { map: 'Busan', ourScore: 2, theirScore: 1 },
        { map: 'Junkertown', ourScore: 3, theirScore: 3 },
        { map: 'Rialto', ourScore: 0, theirScore: 2 },
        { map: 'Oasis', ourScore: 2, theirScore: 0 },
      ],
    });
    expect(seriesScore(m)).toEqual({ ours: 2, theirs: 1 });
  });

  it('returns null without map data', () => {
    expect(seriesScore(match({ id: 'x' }))).toBeNull();
    expect(seriesScore(match({ id: 'y', mapScores: [] }))).toBeNull();
  });
});
