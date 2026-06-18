import type { MatchEntry } from '../data/site';
import { recordOf, splitMatches } from './matches';

/**
 * Team-level stats derived from matches.json for the player detail pages.
 * HONESTY RULE: Liquipedia gives us team results only, never per-player
 * appearance data, so everything here is the TEAM's record and is labelled
 * that way in the UI (t.playerPage.teamRecordNote). The whole lineup
 * arrived as one acquisition, so season-wide team data with the existing
 * "As Rankers" Stage 1 attribution is the honest framing. Derive, never
 * invent: no joinDate exists in the schema, so there are no fabricated
 * "while rostered" windows.
 */

export interface TournamentRecord {
  tournament: string;
  wins: number;
  losses: number;
}

export interface MapRecord {
  map: string;
  wins: number;
  losses: number;
  played: number;
}

/** Completed matches (newest first), the base for everything below. */
export function completedMatches(matches: ReadonlyArray<MatchEntry>, now: number): MatchEntry[] {
  return splitMatches(matches, now).completed;
}

/** W-L per tournament, in first-seen (chronological, newest first) order. */
export function recordByTournament(completed: ReadonlyArray<MatchEntry>): TournamentRecord[] {
  const byName = new Map<string, MatchEntry[]>();
  for (const m of completed) {
    const arr = byName.get(m.tournament) ?? [];
    arr.push(m);
    byName.set(m.tournament, arr);
  }
  return Array.from(byName.entries()).map(([tournament, ms]) => ({
    tournament,
    ...recordOf(ms),
  }));
}

/**
 * Per-map W-L across all completed matches, sorted by games played then
 * map name. Drawn maps count toward `played` but neither column.
 */
export function mapBreakdown(completed: ReadonlyArray<MatchEntry>): MapRecord[] {
  const byMap = new Map<string, MapRecord>();
  for (const m of completed) {
    for (const s of m.mapScores ?? []) {
      const rec = byMap.get(s.map) ?? { map: s.map, wins: 0, losses: 0, played: 0 };
      rec.played += 1;
      if (s.ourScore > s.theirScore) rec.wins += 1;
      else if (s.theirScore > s.ourScore) rec.losses += 1;
      byMap.set(s.map, rec);
    }
  }
  return Array.from(byMap.values()).sort(
    (a, b) => b.played - a.played || a.map.localeCompare(b.map),
  );
}

/**
 * Headline team numbers for the sponsor-facing "by the numbers" strip on the
 * Partners and About pages. Everything is real or directly derived: the peak
 * is the largest logged OWCS Pacific broadcast peak (self-hiding when none is
 * logged), the win rate is the team series record, and players/countries come
 * from the active roster. No invented or per-player figures.
 */
export interface HeadlineStats {
  peakViewers: number | null;
  matchesPlayed: number;
  winRatePct: number | null;
  countries: number;
  players: number;
}

export function headlineStats(
  matches: ReadonlyArray<MatchEntry>,
  roster: ReadonlyArray<{ role: string; country?: string }>,
  now: number,
): HeadlineStats {
  const completed = completedMatches(matches, now);
  const { wins, losses } = recordOf(completed);
  const decided = wins + losses;
  const peaks = matches
    .map((m) => m.broadcastPeakViewers)
    .filter((n): n is number => typeof n === 'number');
  const players = roster.filter((p) => ['Tank', 'DPS', 'Support', 'Flex'].includes(p.role));
  const countries = new Set(players.map((p) => p.country).filter(Boolean));
  return {
    peakViewers: peaks.length ? Math.max(...peaks) : null,
    matchesPlayed: completed.length,
    winRatePct: decided > 0 ? Math.round((wins / decided) * 100) : null,
    countries: countries.size,
    players: players.length,
  };
}

/** The current win or loss streak, or null with no completed matches. */
export function currentStreak(
  completed: ReadonlyArray<MatchEntry>,
): { kind: 'win' | 'loss'; length: number } | null {
  const first = completed[0];
  if (!first || (first.result !== 'win' && first.result !== 'loss')) return null;
  const kind = first.result;
  let length = 0;
  for (const m of completed) {
    if (m.result !== kind) break;
    length += 1;
  }
  return { kind, length };
}
