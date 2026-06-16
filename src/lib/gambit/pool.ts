/**
 * Fixed-capacity slot allocator with a freelist. Decouples allocation (this
 * class) from entity data (the caller's parallel typed arrays keyed by slot
 * index), so the hot loops never allocate or GC. Spawns are deterministic
 * given a deterministic spawn/kill sequence, and systems iterate by index
 * order, which is what keeps a seeded run reproducible.
 */
export class Pool {
  readonly capacity: number;
  count = 0;
  /** 1 if the slot holds a live entity. */
  readonly active: Uint8Array;
  private readonly free: number[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.active = new Uint8Array(capacity);
    this.free = [];
    // Push descending so the first spawns hand out 0, 1, 2, ... in order.
    for (let i = capacity - 1; i >= 0; i -= 1) this.free.push(i);
  }

  /** Claim a free slot, or -1 if the pool is at capacity. */
  spawn(): number {
    const i = this.free.pop();
    if (i === undefined) return -1;
    this.active[i] = 1;
    this.count += 1;
    return i;
  }

  /** Release a slot back to the freelist. No-op if already dead. */
  kill(i: number): void {
    if (this.active[i] !== 1) return;
    this.active[i] = 0;
    this.free.push(i);
    this.count -= 1;
  }

  isAlive(i: number): boolean {
    return this.active[i] === 1;
  }

  /** Visit every live slot in ascending index order. */
  forEachAlive(cb: (i: number) => void): void {
    for (let i = 0; i < this.capacity; i += 1) {
      if (this.active[i] === 1) cb(i);
    }
  }
}
