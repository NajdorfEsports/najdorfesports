/**
 * Glyph harvesting for the CJK font subsets. Pure logic, shared by
 * scripts/subset-cjk-fonts.mjs (via Node's TS type-stripping, same as
 * schemas.ts) and the font-coverage tripwire test, so "which characters
 * must the subset contain" has exactly one definition.
 */

/** Codepoint ranges harvested from source text. */
export const CJK_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x3000, 0x303f], // CJK symbols and punctuation
  [0x3400, 0x4dbf], // CJK unified ideographs extension A
  [0x4e00, 0x9fff], // CJK unified ideographs
  [0xf900, 0xfaff], // CJK compatibility ideographs
  [0xff00, 0xffef], // halfwidth and fullwidth forms
];

/** All CJK codepoints (per CJK_RANGES) present in `text`. */
export function extractCjkCodepoints(text: string): Set<number> {
  const out = new Set<number>();
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    for (const [lo, hi] of CJK_RANGES) {
      if (cp >= lo && cp <= hi) {
        out.add(cp);
        break;
      }
    }
  }
  return out;
}

/**
 * Always-included baseline: printable ASCII plus the handful of
 * typographic marks that appear inside mixed-script runs (curly quotes,
 * ellipsis, middle dot, en dash), so a zh sentence quoting a Latin name
 * never falls out of the subset mid-run.
 */
export function baselineCodepoints(): Set<number> {
  const out = new Set<number>();
  for (let cp = 0x20; cp <= 0x7e; cp += 1) out.add(cp);
  for (const ch of '–‘’“”…·') out.add(ch.codePointAt(0)!);
  return out;
}

/** Codepoint set -> string for subset-font's `text` parameter. */
export function toSubsetString(cps: ReadonlySet<number>): string {
  return Array.from(cps)
    .sort((a, b) => a - b)
    .map((cp) => String.fromCodePoint(cp))
    .join('');
}

/** Collapse sorted codepoints into CSS unicode-range syntax. */
export function toUnicodeRange(cps: ReadonlySet<number>): string {
  const sorted = Array.from(cps).sort((a, b) => a - b);
  const parts: string[] = [];
  let start = -1;
  let prev = -2;
  const hex = (n: number) => n.toString(16).toUpperCase();
  const flush = () => {
    if (start < 0) return;
    parts.push(start === prev ? `U+${hex(start)}` : `U+${hex(start)}-${hex(prev)}`);
  };
  for (const cp of sorted) {
    if (cp !== prev + 1) {
      flush();
      start = cp;
    }
    prev = cp;
  }
  flush();
  return parts.join(', ');
}

/**
 * Which subset(s) a source file's CJK glyphs belong to. Locale-suffixed
 * files feed only their own script's font; everything else (coaching.ts,
 * shared components with inline zh literals) can surface in either locale
 * and feeds both. Shared by the subsetting script and the coverage test.
 */
export function localeBucketForPath(path: string): 'tc' | 'sc' | 'both' {
  if (path.includes('zh-TW')) return 'tc';
  if (path.includes('zh-CN')) return 'sc';
  return 'both';
}

/** Parse CSS unicode-range syntax back into a codepoint set (for tests). */
export function fromUnicodeRange(range: string): Set<number> {
  const out = new Set<number>();
  for (const part of range.split(',')) {
    const m = part.trim().match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/);
    if (!m) continue;
    const lo = parseInt(m[1]!, 16);
    const hi = m[2] ? parseInt(m[2], 16) : lo;
    for (let cp = lo; cp <= hi; cp += 1) out.add(cp);
  }
  return out;
}
