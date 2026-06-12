/**
 * OWdle game-logic tests. Comparison rules run against synthetic fixtures
 * (never live hero values, which shift with balance patches); determinism
 * tests run against the real dataset but assert properties, not specific
 * heroes.
 */
import { describe, expect, it } from 'vitest';
import type { OwdleHero } from '../data/owdle/types';
import {
  HEROES,
  NO_REPEAT_WINDOW,
  OWDLE_EPOCH,
  answerPool,
  compareHeroes,
  dailyAnswer,
  findHero,
  fnv1a,
  nextDate,
  normalizeName,
  playableHeroes,
  previousDate,
  puzzleNumber,
  searchHeroes,
  shareText,
} from './owdle';

function fixture(overrides: Partial<OwdleHero> & { id: string }): OwdleHero {
  return {
    name: overrides.id,
    aliases: [],
    role: 'damage',
    subRole: 'flanker',
    gender: 'female',
    nationality: 'Japan',
    regionTags: ['asia'],
    baseHp: 250,
    attackType: ['projectile'],
    releaseYear: 2016,
    needsVerification: false,
    sourceNote: 'test fixture',
    source: {},
    ...overrides,
  };
}

describe('normalizeName', () => {
  it('folds case, accents, and punctuation', () => {
    expect(normalizeName('D.Va')).toBe('dva');
    expect(normalizeName('Dva')).toBe('dva');
    expect(normalizeName('Soldier: 76')).toBe('soldier76');
    expect(normalizeName('soldier 76')).toBe('soldier76');
    expect(normalizeName('Torbjörn')).toBe('torbjorn');
    expect(normalizeName('Lúcio')).toBe('lucio');
    expect(normalizeName('Wrecking Ball')).toBe('wreckingball');
  });
});

describe('findHero / searchHeroes (live dataset)', () => {
  it('resolves punctuation and accent variants', () => {
    expect(findHero(HEROES, 'dva')?.id).toBe('dva');
    expect(findHero(HEROES, 'soldier 76')?.id).toBe('soldier-76');
    expect(findHero(HEROES, 'Torbjorn')?.id).toBe('torbjorn');
    expect(findHero(HEROES, 'LÚCIO')?.id).toBe('lucio');
  });

  it('resolves real-name and former-handle aliases', () => {
    expect(findHero(HEROES, 'Hana Song')?.id).toBe('dva');
    expect(findHero(HEROES, 'McCree')?.id).toBe('cassidy');
    expect(findHero(HEROES, 'Hammond')?.id).toBe('wrecking-ball');
  });

  it('excludes already-guessed heroes from suggestions', () => {
    const all = searchHeroes(HEROES, 'a', new Set());
    expect(all.length).toBeGreaterThan(0);
    const first = all[0]!;
    const rest = searchHeroes(HEROES, 'a', new Set([first.id]));
    expect(rest.map((h) => h.id)).not.toContain(first.id);
  });

  it('returns nothing for an empty query', () => {
    expect(searchHeroes(HEROES, '  ', new Set())).toEqual([]);
  });

  it('puts prefix matches before substring matches', () => {
    const results = searchHeroes(HEROES, 'me', new Set());
    const names = results.map((h) => h.id);
    expect(names.indexOf('mei')).toBeLessThan(names.indexOf('symmetra'));
  });
});

describe('compareHeroes', () => {
  const answer = fixture({
    id: 'answer',
    role: 'support',
    subRole: 'medic',
    gender: 'female',
    nationality: 'Japan',
    regionTags: ['asia'],
    baseHp: 250,
    attackType: ['projectile'],
    releaseYear: 2022,
  });

  it('marks a correct guess all-exact with no arrows', () => {
    const row = compareHeroes(answer, answer);
    expect(row).toHaveLength(7);
    for (const cell of row) {
      expect(cell.state).toBe('exact');
      expect(cell.direction).toBeUndefined();
    }
  });

  it('scores single-value columns green or red only', () => {
    const guess = fixture({ id: 'g', role: 'tank', subRole: 'medic', gender: 'male' });
    const row = compareHeroes(guess, answer);
    expect(row.find((c) => c.column === 'role')?.state).toBe('miss');
    expect(row.find((c) => c.column === 'subRole')?.state).toBe('exact');
    expect(row.find((c) => c.column === 'gender')?.state).toBe('miss');
  });

  it('scores origin orange on a region overlap, red when disjoint', () => {
    const sameRegion = fixture({ id: 'g', nationality: 'China', regionTags: ['asia'] });
    const disjoint = fixture({ id: 'g2', nationality: 'France', regionTags: ['europe'] });
    expect(compareHeroes(sameRegion, answer).find((c) => c.column === 'nationality')?.state).toBe(
      'partial',
    );
    expect(compareHeroes(disjoint, answer).find((c) => c.column === 'nationality')?.state).toBe(
      'miss',
    );
  });

  it('scores attack type by set identity and overlap', () => {
    const identical = fixture({ id: 'g', attackType: ['projectile'] });
    const overlap = fixture({ id: 'g2', attackType: ['projectile', 'melee'] });
    const disjoint = fixture({ id: 'g3', attackType: ['hitscan'] });
    expect(compareHeroes(identical, answer).find((c) => c.column === 'attackType')?.state).toBe(
      'exact',
    );
    expect(compareHeroes(overlap, answer).find((c) => c.column === 'attackType')?.state).toBe(
      'partial',
    );
    expect(compareHeroes(disjoint, answer).find((c) => c.column === 'attackType')?.state).toBe(
      'miss',
    );
  });

  it('gives numeric columns arrows and a proximity band', () => {
    const lowHp = fixture({ id: 'g', baseHp: 200, releaseYear: 2023 });
    const row = compareHeroes(lowHp, answer);
    const hp = row.find((c) => c.column === 'baseHp')!;
    expect(hp.state).toBe('miss');
    expect(hp.direction).toBe('up'); // answer (250) is higher than the guess (200)
    const year = row.find((c) => c.column === 'releaseYear')!;
    expect(year.state).toBe('partial'); // 2023 vs 2022 is within the 1-year band
    expect(year.direction).toBe('down'); // answer (2022) is earlier than the guess (2023)

    const nearHp = fixture({ id: 'g2', baseHp: 275 });
    expect(compareHeroes(nearHp, answer).find((c) => c.column === 'baseHp')?.state).toBe('partial');
  });
});

describe('daily answer', () => {
  it('is deterministic for a given date', () => {
    expect(dailyAnswer(HEROES, '2026-07-01')?.id).toBe(dailyAnswer(HEROES, '2026-07-01')?.id);
  });

  it('is undefined before the epoch', () => {
    expect(dailyAnswer(HEROES, previousDate(OWDLE_EPOCH))).toBeUndefined();
  });

  it('always comes from the verified answer pool', () => {
    let date = OWDLE_EPOCH;
    for (let i = 0; i < 40; i += 1) {
      const pick = dailyAnswer(HEROES, date)!;
      expect(pick.needsVerification).toBe(false);
      const pool = answerPool(HEROES, date).map((h) => h.id);
      expect(pool).toContain(pick.id);
      date = nextDate(date);
    }
  });

  it('never repeats within the no-repeat window', () => {
    const ids: string[] = [];
    let date = OWDLE_EPOCH;
    for (let i = 0; i < 90; i += 1) {
      ids.push(dailyAnswer(HEROES, date)!.id);
      date = nextDate(date);
    }
    const window = Math.min(NO_REPEAT_WINDOW, answerPool(HEROES, OWDLE_EPOCH).length - 1);
    for (let i = 0; i < ids.length; i += 1) {
      const recent = ids.slice(Math.max(0, i - window), i);
      expect(recent, `repeat at day ${i}`).not.toContain(ids[i]);
    }
  });

  it('gates future-dated heroes out of the game until their release day', () => {
    const future = fixture({ id: 'future-hero', releaseDate: '2099-01-01' });
    const roster = [...HEROES, future];
    expect(playableHeroes(roster, '2098-12-31').map((h) => h.id)).not.toContain('future-hero');
    expect(playableHeroes(roster, '2099-01-01').map((h) => h.id)).toContain('future-hero');
  });
});

describe('puzzle numbering and share text', () => {
  it('numbers the epoch day #1', () => {
    expect(puzzleNumber(OWDLE_EPOCH)).toBe(1);
    expect(puzzleNumber('2026-06-13')).toBe(2);
  });

  it('formats a spoiler-free share grid', () => {
    const text = shareText(
      3,
      [
        ['miss', 'partial', 'exact', 'miss', 'miss', 'exact', 'partial'],
        ['exact', 'exact', 'exact', 'exact', 'exact', 'exact', 'exact'],
      ],
      'https://najdorfesports.gg/games/owdle/',
    );
    expect(text).toContain('OWdle #3 in 2 guesses');
    expect(text).toContain('🟥🟧🟩🟥🟥🟩🟧');
    expect(text).toContain('🟩🟩🟩🟩🟩🟩🟩');
    expect(text).toContain('https://najdorfesports.gg/games/owdle/');
    expect(text).not.toContain(String.fromCharCode(0x2014));
  });

  it('caps the share grid and counts the earlier guesses', () => {
    const rows = Array.from({ length: 12 }, () => ['miss'] as ['miss']);
    const text = shareText(5, rows, 'https://example.com');
    expect(text).toContain('in 12 guesses');
    expect(text).toContain('(+4 earlier guesses)');
    expect(text.split('\n').filter((l) => l.includes('🟥'))).toHaveLength(8);
  });

  it('fnv1a is stable', () => {
    expect(fnv1a('2026-06-12')).toBe(fnv1a('2026-06-12'));
    expect(fnv1a('2026-06-12')).not.toBe(fnv1a('2026-06-13'));
  });
});
