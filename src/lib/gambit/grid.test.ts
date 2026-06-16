import { describe, expect, it } from 'vitest';
import { SpatialGrid } from './grid';

describe('SpatialGrid', () => {
  it('returns the 3x3 neighborhood and excludes far cells', () => {
    const g = new SpatialGrid(200, 50);
    g.insert(0, 0, 0); // center cell
    g.insert(1, 60, 0); // one cell over (in neighborhood)
    g.insert(2, 160, 0); // far cell (excluded)
    const hit: number[] = [];
    g.queryNeighbors(0, 0, (i) => hit.push(i));
    expect(hit).toContain(0);
    expect(hit).toContain(1);
    expect(hit).not.toContain(2);
  });

  it('clears between rebuilds', () => {
    const g = new SpatialGrid(200, 50);
    g.insert(0, 0, 0);
    g.clear();
    const hit: number[] = [];
    g.queryNeighbors(0, 0, (i) => hit.push(i));
    expect(hit).toHaveLength(0);
  });

  it('enumerates a bucket in insertion order (deterministic)', () => {
    // All three land in the same cell ([0, 50) on each axis), so the query
    // returns them in insertion order.
    const g = new SpatialGrid(200, 50);
    g.insert(5, 0, 0);
    g.insert(2, 10, 10);
    g.insert(9, 20, 20);
    const hit: number[] = [];
    g.queryNeighbors(0, 0, (i) => hit.push(i));
    expect(hit).toEqual([5, 2, 9]);
  });
});
