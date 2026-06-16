/**
 * Uniform spatial hash for swarm-scale collision. Rebuilt each step (clear +
 * bucket every live entity), then queries only the 3x3 cell neighborhood, so
 * projectile-vs-enemy and enemy-vs-player stay roughly O(n) instead of O(n^2).
 * Buckets enumerate in insertion order (entity index order), so queries are
 * deterministic.
 */
export class SpatialGrid {
  private readonly cell: number;
  private readonly half: number;
  private readonly cols: number;
  private readonly buckets: number[][];

  constructor(half: number, cell: number) {
    this.cell = cell;
    this.half = half;
    this.cols = Math.ceil((half * 2) / cell) + 1;
    this.buckets = Array.from({ length: this.cols * this.cols }, () => []);
  }

  private col(v: number): number {
    const c = Math.floor((v + this.half) / this.cell);
    return c < 0 ? 0 : c >= this.cols ? this.cols - 1 : c;
  }

  clear(): void {
    for (const b of this.buckets) b.length = 0;
  }

  insert(i: number, x: number, y: number): void {
    const cx = this.col(x);
    const cy = this.col(y);
    this.buckets[cy * this.cols + cx]!.push(i);
  }

  /** Invoke cb with every entity index in the 3x3 cells around (x, y). */
  queryNeighbors(x: number, y: number, cb: (i: number) => void): void {
    const cx = this.col(x);
    const cy = this.col(y);
    for (let oy = -1; oy <= 1; oy += 1) {
      const ny = cy + oy;
      if (ny < 0 || ny >= this.cols) continue;
      for (let ox = -1; ox <= 1; ox += 1) {
        const nx = cx + ox;
        if (nx < 0 || nx >= this.cols) continue;
        const bucket = this.buckets[ny * this.cols + nx]!;
        for (let k = 0; k < bucket.length; k += 1) cb(bucket[k]!);
      }
    }
  }
}
