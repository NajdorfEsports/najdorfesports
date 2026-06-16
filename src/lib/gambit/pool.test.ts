import { describe, expect, it } from 'vitest';
import { Pool } from './pool';

describe('Pool', () => {
  it('hands out ascending indices and refuses past capacity', () => {
    const p = new Pool(3);
    expect(p.spawn()).toBe(0);
    expect(p.spawn()).toBe(1);
    expect(p.spawn()).toBe(2);
    expect(p.spawn()).toBe(-1);
    expect(p.count).toBe(3);
  });

  it('frees and reuses a killed slot', () => {
    const p = new Pool(3);
    p.spawn();
    p.spawn();
    p.spawn();
    p.kill(1);
    expect(p.count).toBe(2);
    expect(p.isAlive(1)).toBe(false);
    expect(p.spawn()).toBe(1);
    expect(p.count).toBe(3);
  });

  it('forEachAlive visits only live slots in order', () => {
    const p = new Pool(4);
    p.spawn();
    p.spawn();
    p.spawn();
    p.kill(1);
    const seen: number[] = [];
    p.forEachAlive((i) => seen.push(i));
    expect(seen).toEqual([0, 2]);
  });
});
