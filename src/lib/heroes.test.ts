import { describe, it, expect } from 'vitest';
import { resolveHeroIcons, firstHeroIcon } from './heroes';

const MAP = {
  Ana: '/heroes/ana.webp',
  Kiriko: '/heroes/kiriko.webp',
  Genji: '/heroes/genji.webp',
};

describe('resolveHeroIcons (injected map)', () => {
  it('resolves known heroes, drops unknown, preserves order', () => {
    expect(resolveHeroIcons(['Ana', 'Nope', 'Genji'], undefined, MAP)).toEqual([
      { name: 'Ana', iconUrl: '/heroes/ana.webp' },
      { name: 'Genji', iconUrl: '/heroes/genji.webp' },
    ]);
  });

  it('returns [] for undefined names', () => {
    expect(resolveHeroIcons(undefined, undefined, MAP)).toEqual([]);
  });

  it('caps the result at the limit', () => {
    expect(resolveHeroIcons(['Ana', 'Kiriko', 'Genji'], 2, MAP)).toHaveLength(2);
  });
});

describe('firstHeroIcon', () => {
  it('returns the first resolvable icon url', () => {
    expect(firstHeroIcon(['Nope', 'Kiriko', 'Ana'], MAP)).toBe('/heroes/kiriko.webp');
  });

  it('returns undefined when nothing resolves', () => {
    expect(firstHeroIcon(['Nope'], MAP)).toBeUndefined();
    expect(firstHeroIcon(undefined, MAP)).toBeUndefined();
  });
});
