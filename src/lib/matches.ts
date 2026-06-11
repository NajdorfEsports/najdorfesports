import type { MatchEntry } from '../data/site';

/**
 * Pure match bucketing and record logic, shared by the home page, the
 * matches page, and the press kit. Lives outside the components so the
 * core honesty rule, an unscored match never counts toward the record
 * and never renders as a win or a loss, is unit tested in one place
 * instead of re-derived per surface.
 */

export interface MatchBuckets {
  /** Matches at or after `now`, soonest first. */
  upcoming: MatchEntry[];
  /** Matches before `now`, newest first. Includes unscored matches. */
  past: MatchEntry[];
  /** Past matches with a final result (win or loss), newest first. */
  completed: MatchEntry[];
  /** Past matches whose result is still `tbd`, newest first. */
  awaitingResult: MatchEntry[];
}

/**
 * Split matches around `now`. A match dated exactly `now` counts as
 * upcoming (matches the long-standing `>= now` page semantics).
 */
export function splitMatches(matches: ReadonlyArray<MatchEntry>, now: number): MatchBuckets {
  const upcoming = matches
    .filter((m) => new Date(m.date).getTime() >= now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const past = matches
    .filter((m) => new Date(m.date).getTime() < now)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return {
    upcoming,
    past,
    completed: past.filter((m) => m.result === 'win' || m.result === 'loss'),
    awaitingResult: past.filter((m) => m.result === 'tbd'),
  };
}

/** Win/loss record across the given matches. `tbd` never counts. */
export function recordOf(matches: ReadonlyArray<MatchEntry>): { wins: number; losses: number } {
  let wins = 0;
  let losses = 0;
  for (const m of matches) {
    if (m.result === 'win') wins += 1;
    else if (m.result === 'loss') losses += 1;
  }
  return { wins, losses };
}

/**
 * Map-count series score ("3 to 2") derived from per-map scores.
 * Returns null when the match has no map data. Drawn maps count for
 * neither side.
 */
export function seriesScore(match: MatchEntry): { ours: number; theirs: number } | null {
  if (!match.mapScores || match.mapScores.length === 0) return null;
  let ours = 0;
  let theirs = 0;
  for (const s of match.mapScores) {
    if (s.ourScore > s.theirScore) ours += 1;
    else if (s.theirScore > s.ourScore) theirs += 1;
  }
  return { ours, theirs };
}
