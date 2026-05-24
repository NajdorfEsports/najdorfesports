/**
 * Locale-aware formatters for dates, currency, and country names. Centralized
 * here so every component renders the same way for a given locale, and so
 * fallbacks (e.g. Intl.DisplayNames absent) are handled in one place.
 */
import type { Locale } from './index';

export function formatDate(
  date: Date | string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    // timeZone: 'UTC' so a 2026-05-23 ISO date doesn't slide a day backward
    // for US viewers, the same fix we applied to the news dates earlier.
    return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** Format USD prize money for the active locale. Falls back to a $1,000-style
 *  rendering if Intl misbehaves. Chinese locales render as "US$1,000.00". */
export function formatCurrencyUSD(amount: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString('en-US')}`;
  }
}

/** Country display name for the active locale. roster.json uses lowercase
 *  ISO 3166-1 alpha-2 country codes (e.g. "hk", "tw", "cn"). When the code
 *  is missing or Intl can't resolve it, we fall back to the English name
 *  that ships with the roster entry. */
export function displayCountry(
  code: string | undefined,
  fallbackName: string | undefined,
  locale: Locale,
): string {
  if (!code) return fallbackName ?? '';
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    return dn.of(code.toUpperCase()) ?? (fallbackName ?? code.toUpperCase());
  } catch {
    return fallbackName ?? code.toUpperCase();
  }
}

/**
 * Translate well-known tournament-name fragments into the active locale.
 * Tournament names live in matches.json / achievements.json in canonical
 * English form ("OWCS Pacific 2026 · Stage 1 Open Qualifier"); this swaps
 * the structural words ("Stage 1", "Open Qualifier", "Main Event") for the
 * Chinese equivalents while preserving the OWCS / Pacific brand fragments.
 *
 * English passes through untouched.
 */
const TOURNAMENT_TERMS: Record<Exclude<Locale, 'en'>, Array<[string, string]>> = {
  'zh-TW': [
    ['Open Qualifier',    '公開預選賽'],
    ['Main Event',        '主賽事'],
    ['Regional Playoffs', '區域季後賽'],
    ['Midseason Championship', '季中錦標賽'],
    ['Stage 1',           '第一階段'],
    ['Stage 2',           '第二階段'],
    ['Stage 3',           '第三階段'],
  ],
  'zh-CN': [
    ['Open Qualifier',    '公开预选赛'],
    ['Main Event',        '主赛事'],
    ['Regional Playoffs', '区域季后赛'],
    ['Midseason Championship', '季中锦标赛'],
    ['Stage 1',           '第一阶段'],
    ['Stage 2',           '第二阶段'],
    ['Stage 3',           '第三阶段'],
  ],
};

export function translateTournament(name: string | undefined, locale: Locale): string {
  if (!name || locale === 'en') return name ?? '';
  const repls = TOURNAMENT_TERMS[locale];
  if (!repls) return name;
  let out = name;
  for (const [en, zh] of repls) out = out.split(en).join(zh);
  return out;
}

/**
 * Translate a placement string ("1st", "2nd", "Top 8", "3rd-4th") for display.
 * Chinese uses 第N名 / 第N位; podium positions get specific words.
 */
export function translatePlacement(placement: string, locale: Locale): string {
  if (locale === 'en') return placement;
  const isTW = locale === 'zh-TW';

  // Exact-podium shortcuts read more naturally.
  if (/^1(st)?\b/i.test(placement)) return isTW ? '冠軍' : '冠军';
  if (/^2(nd)?\b/i.test(placement)) return isTW ? '亞軍' : '亚军';
  if (/^3(rd)?\b/i.test(placement)) return isTW ? '季軍' : '季军';

  // "Top 8" → "前 8 名"
  const top = placement.match(/^Top\s+(\d+)$/i);
  if (top) return isTW ? `前 ${top[1]} 名` : `前 ${top[1]} 名`;

  // "3rd-4th", "5th-8th" → keep numbers, replace -th suffixes with 名
  const range = placement.match(/^(\d+)(?:st|nd|rd|th)\s*[–-]\s*(\d+)(?:st|nd|rd|th)$/i);
  if (range) return isTW ? `第 ${range[1]}–${range[2]} 名` : `第 ${range[1]}–${range[2]} 名`;

  // Generic "Nth"
  const nth = placement.match(/^(\d+)(?:st|nd|rd|th)$/i);
  if (nth) return `第 ${nth[1]} 名`;

  return placement; // anything weird, leave as-is
}
