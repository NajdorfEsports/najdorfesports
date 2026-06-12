/**
 * Runtime schemas for the crossword data, mirroring the schemas.ts pattern:
 * one zod (the explicit v4 dep), strict objects, loud failures. The entry
 * corpus is validated by entries.test.ts; the committed puzzle JSON under
 * public/games/crossword/puzzles/ is validated by puzzles.test.ts, so a
 * bad generator run fails CI instead of shipping a broken board.
 *
 * Imports ONLY 'zod' (plus the local types), so the plain-Node generator
 * can import it directly (Node >= 22.18 strips TS types at runtime).
 */
import { z } from 'zod';

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const CategorySchema = z.enum([
  'hero',
  'realname',
  'ability',
  'map',
  'mode',
  'jargon',
  'meta',
  'esports',
  'lore',
  'community',
]);

/** U+2014 must never appear, repo-wide rule. The CI guard scans files; this
 *  catches it at the data layer too, with a precise entry-level message.
 *  The character is built from its code point so this file itself stays
 *  clean under the repo-wide literal scan (same trick as ci.yml's printf). */
const EM_DASH = String.fromCharCode(0x2014);
const noEmDash = (s: string) => !s.includes(EM_DASH);

const clueText = z
  .string()
  .min(8, 'clue is suspiciously short')
  .refine(noEmDash, { message: 'clue contains an em-dash (U+2014), banned repo-wide' });

export const CrosswordEntrySchema = z
  .object({
    answer: z
      .string()
      .regex(/^[A-Z]{3,12}$/, 'answer must be 3-12 uppercase A-Z letters, no digits or symbols'),
    category: CategorySchema,
    clues: z
      .object({
        easy: clueText.optional(),
        medium: clueText.optional(),
        hard: clueText.optional(),
      })
      .strict()
      .refine((c) => c.easy !== undefined || c.medium !== undefined || c.hard !== undefined, {
        message: 'entry needs at least one difficulty clue',
      }),
    verified: z.boolean(),
    sourceNote: z.string().min(1),
  })
  .strict()
  .refine(
    (e) =>
      (['easy', 'medium', 'hard'] as const).every(
        (d) => !e.clues[d] || !e.clues[d]!.toUpperCase().includes(e.answer),
      ),
    { message: 'a clue contains its own answer' },
  );

const isoDate = z
  .string()
  .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)), {
    message: 'must be an ISO calendar date "YYYY-MM-DD"',
  });

export const PuzzleSlotSchema = z
  .object({
    number: z.number().int().positive(),
    row: z.number().int().nonnegative(),
    col: z.number().int().nonnegative(),
    dir: z.enum(['across', 'down']),
    answer: z.string().regex(/^[A-Z]{3,12}$/),
    clue: clueText,
  })
  .strict();

export const PuzzleSchema = z
  .object({
    date: isoDate,
    difficulty: DifficultySchema,
    size: z.number().int().min(5).max(7),
    grid: z.array(z.string().regex(/^[A-Z#]+$/)),
    // Rail-pattern minis carry 5-6 words (see generate-crosswords.mjs for
    // why denser interlock is impossible with a themed vocabulary).
    entries: z.array(PuzzleSlotSchema).min(5),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.grid.length !== p.size || p.grid.some((row) => row.length !== p.size)) {
      ctx.addIssue({ code: 'custom', message: `grid must be ${p.size} rows of ${p.size} chars` });
      return;
    }
    const seen = new Set<string>();
    for (const slot of p.entries) {
      if (seen.has(slot.answer)) {
        ctx.addIssue({ code: 'custom', message: `duplicate answer ${slot.answer}` });
      }
      seen.add(slot.answer);
      if (slot.answer.length < 3) {
        ctx.addIssue({ code: 'custom', message: `two-letter word ${slot.answer}` });
      }
      // Every slot must match the grid letters exactly.
      for (let i = 0; i < slot.answer.length; i += 1) {
        const r = slot.dir === 'across' ? slot.row : slot.row + i;
        const c = slot.dir === 'across' ? slot.col + i : slot.col;
        const cell = p.grid[r]?.[c];
        if (cell !== slot.answer[i]) {
          ctx.addIssue({
            code: 'custom',
            message: `${slot.dir} ${slot.number} (${slot.answer}) does not match grid at r${r}c${c}`,
          });
          break;
        }
      }
    }
    // Full white-cell connectivity: one flood fill must reach every letter.
    const white: Array<[number, number]> = [];
    for (let r = 0; r < p.size; r += 1) {
      for (let c = 0; c < p.size; c += 1) {
        if (p.grid[r]![c] !== '#') white.push([r, c]);
      }
    }
    if (white.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'grid has no white cells' });
      return;
    }
    const key = (r: number, c: number) => r * p.size + c;
    const seenCells = new Set<number>([key(white[0]![0], white[0]![1])]);
    const queue = [white[0]!];
    while (queue.length > 0) {
      const [r, c] = queue.pop()!;
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= p.size || nc >= p.size) continue;
        if (p.grid[nr]![nc] === '#' || seenCells.has(key(nr, nc))) continue;
        seenCells.add(key(nr, nc));
        queue.push([nr, nc]);
      }
    }
    if (seenCells.size !== white.length) {
      ctx.addIssue({ code: 'custom', message: 'white cells are not fully connected' });
    }
  });

export type CrosswordEntryParsed = z.infer<typeof CrosswordEntrySchema>;
export type PuzzleParsed = z.infer<typeof PuzzleSchema>;
