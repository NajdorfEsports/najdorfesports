/**
 * Date and seed helpers for the daily run. The FNV-1a hash and the
 * UTC date arithmetic mirror src/lib/owdle.ts (kept local to the game for
 * the slice; a shared src/lib/daily.ts can later unify both). The daily seed
 * is a pure function of the New York calendar date, so everyone playing on the
 * same NY-day gets the same spawn sequence; at NY midnight the date rolls and a
 * fresh seed begins.
 */

/** First daily run (#1). */
export const GAMBIT_EPOCH = '2026-06-16';
const NY_TZ = 'America/New_York';

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

/** Deterministic seed for a given calendar date. Pure over the date string. */
export function dailySeed(dateStr: string): number {
  return fnv1a(`gambit:v1:${dateStr}`);
}

/** Run number for a date: the epoch day is #1. */
export function dayNumber(dateStr: string): number {
  const toUtc = (s: string): number => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y!, m! - 1, d!);
  };
  return Math.round((toUtc(dateStr) - toUtc(GAMBIT_EPOCH)) / 86_400_000) + 1;
}

/** Current calendar date in New York as YYYY-MM-DD (en-CA gives ISO order). */
export function nyDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: NY_TZ }).format(new Date());
}

/** Seconds remaining until the next New York midnight (DST-correct). */
export function secondsToNyMidnight(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NY_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string): number =>
    Number(parts.find((p) => p.type === type)?.value ?? '0') % (type === 'hour' ? 24 : 60);
  const elapsed = get('hour') * 3600 + get('minute') * 60 + get('second');
  return 86_400 - elapsed;
}
