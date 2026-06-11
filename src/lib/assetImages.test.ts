import { describe, it, expect } from 'vitest';
import type { ImageMetadata } from 'astro';
import { slugFromPath, imageForName } from './assetImages';

const img = (name: string): ImageMetadata =>
  ({ src: `/_astro/${name}.webp`, width: 600, height: 340, format: 'webp' }) as ImageMetadata;

describe('slugFromPath', () => {
  it('extracts the slug from a glob path', () => {
    expect(slugFromPath('/src/assets/maps/kings-row.webp')).toBe('kings-row');
    expect(slugFromPath('/src/assets/heroes/jetpack-cat.webp')).toBe('jetpack-cat');
  });
});

describe('imageForName', () => {
  const KINGS_ROW = img('kings-row');
  const nameToSlug = { "King's Row": 'kings-row', Oasis: 'oasis' };
  const bySlug = { 'kings-row': KINGS_ROW };

  it('joins name -> slug -> image', () => {
    expect(imageForName("King's Row", nameToSlug, bySlug)).toBe(KINGS_ROW);
  });

  it('is undefined for a JSON entry whose file is missing', () => {
    expect(imageForName('Oasis', nameToSlug, bySlug)).toBeUndefined();
  });

  it('is undefined for an unknown or missing name', () => {
    expect(imageForName('Numbani', nameToSlug, bySlug)).toBeUndefined();
    expect(imageForName(undefined, nameToSlug, bySlug)).toBeUndefined();
  });
});
