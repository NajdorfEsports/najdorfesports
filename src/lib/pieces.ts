/**
 * Chess-piece geometry + ambient-backdrop helpers for the motion system.
 * Ported from the design system's motion-system/_pieces.js (Frame 0). The six
 * pieces share one pedestal (collar -> body -> base -> ground ellipse) and an
 * importance-by-intensity scale that drives BOTH news ranking and motion
 * intensity: Pawn (minor), Knight/Bishop/Rook (standard), Queen (major),
 * King (org-defining).
 *
 * Everything here is geometry + plain numbers, consumed by ChessPiece.astro and
 * PieceBackdrop.astro at BUILD time. The ambient ember/shard placement is
 * generated from a seeded PRNG so a given (piece, seed) always renders the same
 * still HTML: no client JS, no per-build churn, reduced-motion safe by virtue
 * of motion.css. Inline SVG, viewBox 0 0 64 96, stroke currentColor.
 *
 * The pieces are line-art only and are NEVER inked solid, recolored, or
 * stretched (the bishop-mark rule extends to all six). White = clean line
 * (fill:none); black = cobalt hatch fill; ghost = fainter hatch for backdrops.
 */

export type PieceName = 'Pawn' | 'Knight' | 'Bishop' | 'Rook' | 'Queen' | 'King';
export type Treatment = 'white' | 'black' | 'ghost';

/** Shared base every piece sits on: collar, two-step plinth, ground ellipse. */
export const PEDESTAL = `<rect x="20" y="56" width="24" height="6" rx="1"/><path d="M22 62 L42 62 L46 78 L18 78 Z"/><path d="M14 78 L50 78 L52 88 L12 88 Z"/><ellipse cx="32" cy="90" rx="22" ry="3.5"/>`;

/** Per-piece head markup. Drawn mirror-symmetric about x=32 except the Knight,
 *  which is a facing horse-head and is deliberately asymmetric. */
export const HEADS: Record<PieceName, string> = {
  Pawn: `<circle cx="32" cy="32" r="11"/><path d="M25 42 L39 42 L41 50 L23 50 Z"/><path d="M24 50 L40 50 L40 56 L24 56 Z"/>`,
  Knight: `<path d="M27 56 L25 40 L22 34 L25 27 L23 20 L30 13 L34 17 L42 15 L46 23 L43 31 L47 42 L44 56 Z"/><circle cx="31" cy="24" r="1.6"/><path d="M31 16 L40 28"/><path d="M23 33 L29 31"/>`,
  Bishop: `<circle cx="32" cy="9" r="2.6"/><path d="M32 12 C40 22,44 32,44 39 C44 47,38 51,32 51 C26 51,20 47,20 39 C20 32,24 22,32 12 Z"/><path d="M28 18 L38 28 L36 30 L26 20 Z"/><path d="M26 50 L38 50 L38 56 L26 56 Z"/>`,
  Rook: `<path d="M23 26 L23 14 L27 14 L27 18 L30.5 18 L30.5 14 L33.5 14 L33.5 18 L37 18 L37 14 L41 14 L41 26 Z"/><path d="M25 26 L39 26 L41 50 L23 50 Z"/><path d="M24 38 L40 38"/><path d="M26 50 L38 50 L38 56 L26 56 Z"/>`,
  Queen: `<path d="M20 46 L22 24 L24.5 34 L27 20 L29.5 34 L32 16 L34.5 34 L37 20 L39.5 34 L42 24 L44 46 Z"/><circle cx="22" cy="22" r="2.3"/><circle cx="27" cy="18" r="2.3"/><circle cx="32" cy="14" r="2.4"/><circle cx="37" cy="18" r="2.3"/><circle cx="42" cy="22" r="2.3"/><path d="M24 46 L40 46 L40 56 L24 56 Z"/>`,
  King: `<rect x="30.5" y="6" width="3" height="14"/><rect x="27" y="10" width="10" height="3"/><circle cx="32" cy="25" r="2.6"/><path d="M22 47 L24 29 C26 24,30 24,32 28 C34 24,38 24,40 29 L42 47 Z"/><path d="M24 47 L40 47 L40 56 L24 56 Z"/>`,
};

export interface PieceMeta {
  /** Importance label. */
  role: 'Minor' | 'Standard' | 'Major' | 'Org-defining';
  /** Drives shard count (1..3). */
  dots: number;
  /** Ember count. */
  embers: number;
  /** Sway amplitude. */
  amp: string;
  /** Sway duration. */
  dur: string;
  /** Shard drift duration. */
  sdur: string;
}

/** Importance scale -> motion params. Higher importance = more embers, faster
 *  and wider sway, faster shards. */
export const PIECE_META: Record<PieceName, PieceMeta> = {
  Pawn: { role: 'Minor', dots: 1, embers: 2, amp: '0.6deg', dur: '13s', sdur: '20s' },
  Knight: { role: 'Standard', dots: 2, embers: 4, amp: '1.1deg', dur: '11s', sdur: '18s' },
  Bishop: { role: 'Standard', dots: 2, embers: 4, amp: '1.1deg', dur: '11s', sdur: '18s' },
  Rook: { role: 'Standard', dots: 2, embers: 5, amp: '1.3deg', dur: '10.5s', sdur: '17s' },
  Queen: { role: 'Major', dots: 3, embers: 7, amp: '1.8deg', dur: '9s', sdur: '15s' },
  King: { role: 'Org-defining', dots: 4, embers: 9, amp: '2.4deg', dur: '7.5s', sdur: '13s' },
};

/** Six tiers low -> high. Index a value into a piece for importance-driven art. */
export const PIECE_ORDER: PieceName[] = ['Pawn', 'Knight', 'Bishop', 'Rook', 'Queen', 'King'];

/** Process-unique id source for per-instance SVG hatch patterns. The module is
 *  evaluated once per build worker and a page renders in one worker, so the
 *  returned id is unique within any single page (which is all url(#id) needs). */
let _uid = 0;
export function nextPieceUid(): string {
  _uid += 1;
  return _uid.toString(36);
}

/** Deterministic PRNG (mulberry32) so a seed renders identical static HTML. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash an arbitrary string to a 32-bit seed (FNV-1a). */
export function seedFrom(input: string | number): number {
  const s = String(input);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface EmberSpec {
  left: number;
  dur: string;
  delay: string;
  drift: number;
  rise: number;
  rmx: number;
  rmy: number;
  alt: boolean;
}

export interface ShardSpec {
  size: number;
  left: number;
  top: number;
  sx: number;
  sy: number;
  delay: string;
  sdur: string;
}

/** Build `count` ember specs from a seeded RNG (mirrors fillBackdrop). */
export function emberSpecs(count: number, rng: () => number): EmberSpec[] {
  const out: EmberSpec[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      left: +(8 + rng() * 84).toFixed(2),
      dur: (7 + rng() * 5).toFixed(1),
      delay: (rng() * 7).toFixed(1),
      drift: (rng() * 16 - 8) | 0,
      rise: (-50 - rng() * 40) | 0,
      rmx: (rng() * 12 - 6) | 0,
      rmy: (-16 - rng() * 28) | 0,
      alt: rng() > 0.5,
    });
  }
  return out;
}

/** Build shard specs from a seeded RNG. Count derives from `dots`. */
export function shardSpecs(dots: number, sdur: string, rng: () => number): ShardSpec[] {
  const count = dots >= 3 ? 3 : dots >= 2 ? 2 : 1;
  const out: ShardSpec[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      size: (14 + rng() * 16) | 0,
      left: +(8 + rng() * 78).toFixed(2),
      top: +(8 + rng() * 70).toFixed(2),
      sx: (rng() * 16 - 8) | 0,
      sy: (-10 - rng() * 12) | 0,
      delay: (rng() * 5).toFixed(1),
      sdur,
    });
  }
  return out;
}
