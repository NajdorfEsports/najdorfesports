/**
 * Pure game logic for OWdle (/games/owdle/): hero search normalization,
 * the per-column comparison engine, the deterministic daily answer, and
 * the share text. No DOM and no Date.now() in the deterministic parts,
 * so vitest can pin every rule; src/scripts/owdle.ts owns the DOM.
 */
import heroesJson from '../data/owdle/heroes.json';
import type { OwdleHero } from '../data/owdle/types';

export const HEROES = heroesJson as OwdleHero[];

/** First daily puzzle (#1). Also the floor for "yesterday's answer". */
export const OWDLE_EPOCH = '2026-06-12';

/** A repeat answer cannot occur within this many previous days. */
export const NO_REPEAT_WINDOW = 30;

/** "Close" bands for the numeric columns (partial instead of miss). */
export const HP_BAND = 25;
export const YEAR_BAND = 1;

export const COLUMNS = [
  'role',
  'subRole',
  'gender',
  'nationality',
  'baseHp',
  'attackType',
  'releaseYear',
] as const;
export type ColumnKey = (typeof COLUMNS)[number];

export type CellState = 'exact' | 'partial' | 'miss';

export interface CellResult {
  column: ColumnKey;
  state: CellState;
  /** For numeric columns on a non-exact match: the answer is higher/later
   *  ('up') or lower/earlier ('down') than the guess. */
  direction?: 'up' | 'down';
}

/**
 * Fold case, accents, and punctuation so "Lúcio", "lucio", "D.Va", "dva",
 * "soldier: 76", and "Torbjörn" all collapse to comparable keys.
 */
export function normalizeName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function searchKeys(hero: OwdleHero): string[] {
  return [normalizeName(hero.name), ...hero.aliases.map(normalizeName)];
}

/**
 * Type-ahead matches for the guess input: prefix matches first, then
 * substring matches, alphabetical within each group. Already-guessed
 * heroes are excluded by id.
 */
export function searchHeroes(
  heroes: OwdleHero[],
  query: string,
  excludeIds: ReadonlySet<string>,
): OwdleHero[] {
  const q = normalizeName(query);
  if (!q) return [];
  const prefix: OwdleHero[] = [];
  const substring: OwdleHero[] = [];
  for (const hero of heroes) {
    if (excludeIds.has(hero.id)) continue;
    const keys = searchKeys(hero);
    if (keys.some((k) => k.startsWith(q))) prefix.push(hero);
    else if (keys.some((k) => k.includes(q))) substring.push(hero);
  }
  const byName = (a: OwdleHero, b: OwdleHero) => a.name.localeCompare(b.name);
  return [...prefix.sort(byName), ...substring.sort(byName)];
}

/** Exact-name resolution of a typed guess (name or alias). */
export function findHero(heroes: OwdleHero[], input: string): OwdleHero | undefined {
  const q = normalizeName(input);
  if (!q) return undefined;
  return heroes.find((hero) => searchKeys(hero).includes(q));
}

function setCompare(guess: readonly string[], answer: readonly string[]): CellState {
  const a = new Set(answer);
  const shared = guess.filter((v) => a.has(v));
  if (shared.length === guess.length && guess.length === answer.length) return 'exact';
  return shared.length > 0 ? 'partial' : 'miss';
}

function numberCompare(guess: number, answer: number, band: number): CellResult['state'] {
  if (guess === answer) return 'exact';
  return Math.abs(guess - answer) <= band ? 'partial' : 'miss';
}

/** One row of column feedback for a guess against the answer. */
export function compareHeroes(guess: OwdleHero, answer: OwdleHero): CellResult[] {
  const origin: CellState =
    guess.nationality === answer.nationality
      ? 'exact'
      : guess.regionTags.some((t) => answer.regionTags.includes(t))
        ? 'partial'
        : 'miss';
  return [
    { column: 'role', state: guess.role === answer.role ? 'exact' : 'miss' },
    { column: 'subRole', state: guess.subRole === answer.subRole ? 'exact' : 'miss' },
    { column: 'gender', state: guess.gender === answer.gender ? 'exact' : 'miss' },
    { column: 'nationality', state: origin },
    {
      column: 'baseHp',
      state: numberCompare(guess.baseHp, answer.baseHp, HP_BAND),
      ...(guess.baseHp === answer.baseHp
        ? {}
        : { direction: answer.baseHp > guess.baseHp ? ('up' as const) : ('down' as const) }),
    },
    { column: 'attackType', state: setCompare(guess.attackType, answer.attackType) },
    {
      column: 'releaseYear',
      state: numberCompare(guess.releaseYear, answer.releaseYear, YEAR_BAND),
      ...(guess.releaseYear === answer.releaseYear
        ? {}
        : {
            direction: answer.releaseYear > guess.releaseYear ? ('up' as const) : ('down' as const),
          }),
    },
  ];
}

/** Heroes that exist in the game on a given puzzle date (release gating). */
export function playableHeroes(heroes: OwdleHero[], dateStr: string): OwdleHero[] {
  return heroes.filter((h) => !h.releaseDate || h.releaseDate <= dateStr);
}

/** The daily answer pool: playable AND fully verified facts. */
export function answerPool(heroes: OwdleHero[], dateStr: string): OwdleHero[] {
  return playableHeroes(heroes, dateStr)
    .filter((h) => !h.needsVerification)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** 32-bit FNV-1a; Math.imul keeps it identical across JS engines. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function nextDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!) + 86_400_000).toISOString().slice(0, 10);
}

export function previousDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!) - 86_400_000).toISOString().slice(0, 10);
}

/** Puzzle number for a date: the epoch day is #1. Negative before epoch. */
export function puzzleNumber(dateStr: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y!, m! - 1, d!);
  };
  return Math.round((toUtc(dateStr) - toUtc(OWDLE_EPOCH)) / 86_400_000) + 1;
}

/**
 * Deterministic global daily answer: every visitor derives the same hero
 * from the date alone, no backend. The sequence is replayed from the
 * epoch maintaining a sliding no-repeat window; when the date hash lands
 * on a recent answer, a salted re-hash advances deterministically. Pure
 * over (dataset, date), so "yesterday's answer" is just a second call.
 * (A dataset change can shift PAST answers; only that day's display of
 * "yesterday" would briefly disagree, local stats are keyed by date and
 * unaffected.)
 */
export function dailyAnswer(heroes: OwdleHero[], dateStr: string): OwdleHero | undefined {
  if (dateStr < OWDLE_EPOCH) return undefined;
  const recent: string[] = [];
  let cursor = OWDLE_EPOCH;
  for (;;) {
    const pool = answerPool(heroes, cursor);
    if (pool.length === 0) return undefined;
    const window = Math.min(NO_REPEAT_WINDOW, pool.length - 1);
    let pick = pool[fnv1a(cursor) % pool.length]!;
    for (let attempt = 1; recent.slice(-window).includes(pick.id); attempt += 1) {
      pick = pool[fnv1a(`${cursor}#${attempt}`) % pool.length]!;
    }
    if (cursor === dateStr) return pick;
    recent.push(pick.id);
    if (recent.length > NO_REPEAT_WINDOW) recent.shift();
    cursor = nextDate(cursor);
  }
}

const SHARE_EMOJI: Record<CellState, string> = { exact: '🟩', partial: '🟧', miss: '🟥' };
const SHARE_MAX_ROWS = 8;

/**
 * Spoiler-free Wordle-style share text: name, puzzle number, guess count,
 * one emoji row per guess (oldest first, capped to the last 8), URL.
 * Never includes the hero name.
 */
export function shareText(number: number, rows: CellState[][], url: string): string {
  const shown = rows.slice(-SHARE_MAX_ROWS);
  const skipped = rows.length - shown.length;
  const lines = [
    `OWdle #${number} in ${rows.length} ${rows.length === 1 ? 'guess' : 'guesses'}`,
    ...(skipped > 0 ? [`(+${skipped} earlier guesses)`] : []),
    ...shown.map((row) => row.map((s) => SHARE_EMOJI[s]).join('')),
    url,
  ];
  return lines.join('\n');
}
