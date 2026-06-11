import { describe, it, expect } from 'vitest';
import type { ImageMetadata } from 'astro';
import { resolveHeroIcons, firstHeroImage } from './heroes';

const img = (name: string): ImageMetadata =>
  ({ src: `/_astro/${name}.webp`, width: 120, height: 120, format: 'webp' }) as ImageMetadata;

const ANA = img('ana');
const KIRIKO = img('kiriko');
const GENJI = img('genji');

const MAP: Record<string, ImageMetadata> = { Ana: ANA, Kiriko: KIRIKO, Genji: GENJI };

describe('resolveHeroIcons (injected map)', () => {
  it('resolves known heroes, drops unknown, preserves order', () => {
    expect(resolveHeroIcons(['Ana', 'Nope', 'Genji'], undefined, MAP)).toEqual([
      { name: 'Ana', image: ANA },
      { name: 'Genji', image: GENJI },
    ]);
  });

  it('returns [] for undefined names', () => {
    expect(resolveHeroIcons(undefined, undefined, MAP)).toEqual([]);
  });

  it('caps the result at the limit', () => {
    expect(resolveHeroIcons(['Ana', 'Kiriko', 'Genji'], 2, MAP)).toHaveLength(2);
  });
});

describe('firstHeroImage', () => {
  it('returns the first resolvable image', () => {
    expect(firstHeroImage(['Nope', 'Kiriko', 'Ana'], MAP)).toBe(KIRIKO);
  });

  it('returns undefined when nothing resolves', () => {
    expect(firstHeroImage(['Nope'], MAP)).toBeUndefined();
    expect(firstHeroImage(undefined, MAP)).toBeUndefined();
  });
});
