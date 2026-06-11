/**
 * The Najdorf Variation of the Sicilian Defence, the org's namesake:
 * 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6. Used as quiet visual
 * annotation (section indexes on the home page, a margin note on About).
 * Algebraic notation is locale-neutral, so it is never translated, and it
 * always renders aria-hidden: decoration for sighted visitors, silence
 * for screen readers.
 */
export const NAJDORF_LINE = [
  'e4',
  'c5',
  'Nf3',
  'd6',
  'd4',
  'cxd4',
  'Nxd4',
  'Nf6',
  'Nc3',
  'a6',
] as const;

/**
 * Scoresheet label for the half-move at `index` (0-based):
 * 0 -> "1. e4" (White), 1 -> "1... c5" (Black), 2 -> "2. Nf3", and so on.
 * Indexes past the line return null so a page with more sections than
 * moves degrades to plain headers instead of inventing chess.
 */
export function moveLabel(index: number): string | null {
  const move = NAJDORF_LINE[index];
  if (!move) return null;
  const number = Math.floor(index / 2) + 1;
  const isWhite = index % 2 === 0;
  return `${number}.${isWhite ? '' : '..'} ${move}`;
}

/** The full line on one row, for the About margin annotation. */
export function fullLine(): string {
  const parts: string[] = [];
  for (let i = 0; i < NAJDORF_LINE.length; i += 2) {
    const number = i / 2 + 1;
    const white = NAJDORF_LINE[i];
    const black = NAJDORF_LINE[i + 1];
    parts.push(black ? `${number}.${white} ${black}` : `${number}.${white}`);
  }
  return parts.join(' ');
}
