/**
 * Types for the daily Overwatch mini-crossword (/games/crossword/).
 *
 * The entry corpus (entries.ts) is the single hand-authored source; the
 * offline generator (scripts/generate-crosswords.mjs) compiles it into
 * date-keyed puzzle JSON under public/games/crossword/puzzles/, and the
 * client engine (src/scripts/crossword.ts) consumes that JSON. Keep this
 * module dependency-free so both the Node generator (via type stripping)
 * and the browser bundle can import it.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export type Category =
  | 'hero'
  | 'realname'
  | 'ability'
  | 'map'
  | 'mode'
  | 'jargon'
  | 'meta'
  | 'esports'
  | 'lore'
  | 'community';

export interface CrosswordEntry {
  /** Uppercase A-Z only. Answers longer than 7 letters never fit the
   *  current 5x5 to 7x7 grids; they are kept only when iconic (JETPACKCAT)
   *  and wait for larger grids. */
  answer: string;
  category: Category;
  /**
   * English clue text per difficulty tier. Presence of a tier makes the
   * entry eligible for that tier's puzzles. zh-TW / zh-CN clue text ships
   * separately after native review (owner decision 2026-06-11): the puzzle
   * JSON stays English-only until then.
   */
  clues: Partial<Record<Difficulty, string>>;
  /** False = a fact in the clue is not fully confirmed. Unverified entries
   *  are listed in REVIEW.md and excluded from generation. */
  verified: boolean;
  /** Where the fact comes from, for review. */
  sourceNote: string;
}

/** One placed word in a generated puzzle. */
export interface PuzzleSlot {
  number: number;
  row: number;
  col: number;
  dir: 'across' | 'down';
  answer: string;
  clue: string;
}

/** A generated daily puzzle, served as static JSON. */
export interface Puzzle {
  /** America/New_York calendar date, YYYY-MM-DD. */
  date: string;
  difficulty: Difficulty;
  /** Grid is size x size. */
  size: number;
  /** Rows of uppercase letters, '#' for black squares. */
  grid: string[];
  entries: PuzzleSlot[];
}
