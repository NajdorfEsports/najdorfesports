import { describe, it, expect } from 'vitest';
import { NAJDORF_LINE, moveLabel, fullLine } from './notation';

describe('NAJDORF_LINE', () => {
  it('is the Najdorf Variation, ten half-moves', () => {
    expect(NAJDORF_LINE).toHaveLength(10);
    expect(NAJDORF_LINE[0]).toBe('e4');
    expect(NAJDORF_LINE[9]).toBe('a6');
  });
});

describe('moveLabel', () => {
  it('numbers White and Black half-moves scoresheet-style', () => {
    expect(moveLabel(0)).toBe('1. e4');
    expect(moveLabel(1)).toBe('1... c5');
    expect(moveLabel(2)).toBe('2. Nf3');
    expect(moveLabel(5)).toBe('3... cxd4');
    expect(moveLabel(9)).toBe('5... a6');
  });

  it('returns null past the end of the line', () => {
    expect(moveLabel(10)).toBeNull();
    expect(moveLabel(-1)).toBeNull();
  });
});

describe('fullLine', () => {
  it('renders the whole variation on one row', () => {
    expect(fullLine()).toBe('1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6');
  });
});
