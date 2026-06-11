import { describe, it, expect } from 'vitest';
import { completedMatches, recordByTournament, mapBreakdown, currentStreak } from './derived-stats';
import type { MatchEntry } from '../data/site';

const NOW = Date.parse('2026-06-11T12:00:00.000Z');

function match(overrides: Partial<MatchEntry> & { id: string }): MatchEntry {
  return {
    date: '2026-06-01T11:00:00.000Z',
    opponent: 'Opponent',
    tournament: 'Stage 2',
    format: 'BO5',
    result: 'tbd',
    ...overrides,
  } as MatchEntry;
}

const FIXTURES: MatchEntry[] = [
  match({ id: 's1-l', date: '2026-03-26T11:00:00.000Z', tournament: 'Stage 1', result: 'loss' }),
  match({
    id: 's1-w',
    date: '2026-04-02T11:00:00.000Z',
    tournament: 'Stage 1',
    result: 'win',
    mapScores: [
      { map: 'Busan', ourScore: 2, theirScore: 0 },
      { map: 'Rialto', ourScore: 1, theirScore: 2 },
      { map: 'Oasis', ourScore: 2, theirScore: 1 },
    ],
  }),
  match({
    id: 's2-w1',
    date: '2026-06-04T11:00:00.000Z',
    tournament: 'Stage 2',
    result: 'win',
    mapScores: [
      { map: 'Busan', ourScore: 2, theirScore: 1 },
      { map: 'Junkertown', ourScore: 3, theirScore: 3 },
    ],
  }),
  match({ id: 's2-w2', date: '2026-06-09T11:00:00.000Z', tournament: 'Stage 2', result: 'win' }),
  match({ id: 'future', date: '2026-06-20T11:00:00.000Z', result: 'tbd' }),
  match({ id: 'past-tbd', date: '2026-06-10T11:00:00.000Z', result: 'tbd' }),
];

describe('completedMatches', () => {
  it('keeps finals only, newest first', () => {
    const out = completedMatches(FIXTURES, NOW);
    expect(out.map((m) => m.id)).toEqual(['s2-w2', 's2-w1', 's1-w', 's1-l']);
  });
});

describe('recordByTournament', () => {
  it('groups and counts per tournament', () => {
    const out = recordByTournament(completedMatches(FIXTURES, NOW));
    expect(out).toEqual([
      { tournament: 'Stage 2', wins: 2, losses: 0 },
      { tournament: 'Stage 1', wins: 1, losses: 1 },
    ]);
  });
});

describe('mapBreakdown', () => {
  it('aggregates per map, counting draws as played only', () => {
    const out = mapBreakdown(completedMatches(FIXTURES, NOW));
    expect(out[0]).toEqual({ map: 'Busan', wins: 2, losses: 0, played: 2 });
    expect(out).toContainEqual({ map: 'Junkertown', wins: 0, losses: 0, played: 1 });
    expect(out).toContainEqual({ map: 'Rialto', wins: 0, losses: 1, played: 1 });
  });
});

describe('currentStreak', () => {
  it('reads the streak off the newest completed matches', () => {
    expect(currentStreak(completedMatches(FIXTURES, NOW))).toEqual({ kind: 'win', length: 3 });
  });

  it('is null with nothing completed', () => {
    expect(currentStreak([])).toBeNull();
  });
});
