/**
 * News banner chess pieces: the six approved outline pieces that draw
 * themselves on when an article banner scrolls into view.
 *
 * These are the OWNER-APPROVED single-path outlines (from the
 * `Najdorf_Chess_Pieces.html` reference): one closed `<path d="...">` per
 * piece, viewBox 0 0 64 96, rendered fill:none with the brand accent stroke.
 * They are intentionally separate from the composed `HEADS` + `PEDESTAL`
 * geometry in `pieces.ts` (which drives the ambient PieceBackdrop motion
 * layer): that art is a multi-part watermark, this art is a single continuous
 * outline so `stroke-dasharray` can draw it on in one stroke.
 *
 * The piece a news article shows is chosen by its importance ("severity"):
 * pawn = least important, king = an org-defining, direction-changing
 * announcement. The article controls this through the `piece` front-matter
 * field; see `src/content.config.ts` and `PieceBanner.astro`.
 *
 * Outline only, NEVER inked solid (the bishop-mark rule extends to all six).
 */

/** Severity ladder, least to most important. */
export type NewsPiece = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

/** Six tiers low -> high. Lets an importance number map onto a piece. */
export const NEWS_PIECE_ORDER: NewsPiece[] = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];

/**
 * Exact path data for each piece. The knight faces left, matching the
 * approved reference. Do not "tidy" these strings: they reproduce the
 * approved draw-on artwork verbatim.
 */
export const NEWS_PIECE_PATHS: Record<NewsPiece, string> = {
  pawn: 'M 27.0 4.7 L 20.3 9.7 L 17.8 14.7 L 17.8 22.2 L 20.3 27.2 L 27.0 32.2 L 17.0 35.5 L 18.7 38.0 L 26.2 39.7 L 24.5 53.8 L 21.2 62.2 L 19.5 63.8 L 15.3 63.8 L 13.7 65.5 L 16.2 68.8 L 7.0 76.3 L 6.2 80.5 L 7.8 83.8 L 3.7 86.3 L 3.7 90.5 L 57.8 91.3 L 59.5 90.5 L 59.5 85.5 L 56.2 83.8 L 57.0 77.2 L 47.0 68.8 L 49.5 67.2 L 49.5 64.7 L 44.5 63.8 L 42.8 62.2 L 37.8 47.2 L 37.8 39.7 L 42.8 38.8 L 47.0 36.3 L 44.5 33.8 L 37.0 32.2 L 42.8 28.0 L 46.2 22.2 L 45.3 12.2 L 40.3 6.3 L 37.0 4.7 Z',
  knight:
    'M 29.3 3.8 L 28.7 5.7 L 30.5 12.9 L 22.6 15.9 L 18.4 22.6 L 6.9 31.1 L 6.9 38.9 L 8.7 40.7 L 11.7 40.1 L 11.7 42.6 L 13.5 44.4 L 16.6 43.2 L 19.6 39.5 L 22.6 37.7 L 32.9 38.3 L 17.2 53.4 L 14.2 58.9 L 12.9 65.5 L 19.0 67.4 L 19.6 69.2 L 16.0 71.0 L 17.2 75.8 L 12.3 81.3 L 14.2 84.9 L 11.1 86.7 L 10.5 89.1 L 11.7 91.6 L 52.3 91.6 L 54.1 90.3 L 53.5 86.7 L 50.5 84.9 L 52.3 81.9 L 46.8 75.2 L 46.8 74.0 L 48.6 72.2 L 48.6 70.4 L 45.6 69.8 L 44.4 68.6 L 50.5 65.5 L 53.5 55.9 L 56.5 40.1 L 55.9 28.0 L 52.9 20.8 L 46.8 13.5 L 40.8 9.3 L 39.0 10.5 L 31.1 3.8 Z',
  bishop:
    'M 30.7 3.8 L 28.5 6.0 L 28.5 7.6 L 30.1 9.7 L 25.3 14.5 L 21.6 23.6 L 21.6 29.0 L 24.2 34.9 L 24.2 36.0 L 22.1 38.1 L 24.8 39.2 L 25.8 40.8 L 24.8 41.8 L 20.5 41.8 L 20.0 44.5 L 25.3 45.1 L 26.4 46.1 L 24.8 61.1 L 22.6 68.6 L 18.9 70.2 L 18.9 71.3 L 21.0 72.9 L 15.1 79.8 L 15.7 85.7 L 13.0 87.3 L 13.0 91.1 L 49.4 91.6 L 50.5 90.6 L 50.5 88.4 L 49.4 86.8 L 47.3 85.7 L 48.3 84.1 L 48.3 80.4 L 42.4 73.4 L 44.0 71.8 L 44.0 69.7 L 41.4 69.1 L 40.3 68.1 L 37.1 52.5 L 37.1 45.6 L 43.0 45.1 L 43.5 44.0 L 42.4 41.8 L 37.6 41.3 L 38.2 39.2 L 40.8 38.6 L 40.8 37.0 L 38.7 35.4 L 41.9 27.9 L 41.4 22.6 L 38.2 15.1 L 33.3 9.7 L 34.4 8.1 L 34.4 5.4 L 32.3 3.8 Z',
  rook: 'M 13.5 3.8 L 13.5 18.8 L 19.2 21.6 L 16.3 22.4 L 15.6 24.5 L 20.6 25.9 L 19.9 36.6 L 16.3 58.7 L 12.1 60.8 L 14.2 65.8 L 12.8 68.7 L 7.1 74.4 L 6.4 78.6 L 7.1 80.8 L 9.2 82.2 L 5.6 84.3 L 4.9 90.7 L 58.4 90.7 L 58.4 85.0 L 54.8 82.2 L 56.9 80.1 L 56.9 74.4 L 50.5 67.9 L 49.1 64.4 L 51.9 62.2 L 51.9 60.8 L 49.1 60.1 L 47.0 56.5 L 43.4 31.6 L 43.4 25.9 L 47.7 25.2 L 48.4 23.8 L 47.7 22.4 L 44.8 21.6 L 50.5 18.1 L 50.5 4.6 L 43.4 3.8 L 42.7 11.7 L 37.0 12.4 L 36.3 3.8 L 27.7 3.8 L 27.7 11.7 L 21.3 12.4 L 20.6 3.8 Z',
  queen:
    'M 31.5 3.8 L 29.7 6.6 L 28.8 9.8 L 28.8 13.9 L 30.6 16.6 L 29.7 18.4 L 27.9 19.8 L 25.6 17.5 L 25.6 15.7 L 23.8 15.2 L 22.9 16.1 L 22.9 17.0 L 24.3 18.4 L 23.4 21.1 L 21.5 20.7 L 20.6 19.8 L 20.6 18.4 L 19.7 18.0 L 17.9 18.9 L 17.9 20.2 L 19.7 21.1 L 21.1 23.0 L 25.2 32.1 L 25.2 33.4 L 23.4 34.8 L 23.4 36.2 L 25.2 36.6 L 25.6 37.5 L 22.4 38.0 L 21.5 38.9 L 21.5 40.3 L 26.1 41.2 L 26.5 50.3 L 25.6 57.6 L 22.9 68.5 L 19.3 69.4 L 19.3 71.2 L 21.1 72.6 L 15.6 79.9 L 15.6 84.0 L 17.0 85.8 L 14.2 87.2 L 14.2 91.2 L 49.3 91.2 L 49.3 87.6 L 48.8 86.7 L 46.6 85.8 L 47.9 84.0 L 47.9 79.9 L 42.5 73.0 L 44.3 71.2 L 44.3 69.4 L 41.1 68.9 L 40.2 67.6 L 37.0 52.1 L 37.0 41.2 L 41.1 40.7 L 42.0 39.8 L 41.1 38.0 L 37.9 37.5 L 40.2 35.7 L 40.2 34.8 L 37.9 33.4 L 41.6 24.3 L 42.9 22.1 L 45.7 19.8 L 45.7 18.9 L 43.8 18.0 L 41.6 20.7 L 40.2 21.1 L 39.3 19.8 L 39.3 18.4 L 40.6 16.6 L 39.7 15.2 L 38.4 15.2 L 37.5 16.1 L 37.9 17.5 L 35.2 19.8 L 33.8 18.9 L 32.9 16.6 L 34.3 14.8 L 34.3 8.4 L 32.9 5.2 Z',
  king: 'M 29.2 3.8 L 28.7 4.8 L 30.6 9.0 L 30.1 9.4 L 26.9 7.6 L 25.5 8.0 L 26.0 13.1 L 30.1 11.3 L 30.6 11.7 L 28.7 15.0 L 28.7 17.3 L 26.9 18.3 L 23.6 18.3 L 22.2 19.2 L 19.0 19.6 L 19.0 21.0 L 21.8 24.3 L 25.0 32.2 L 24.6 33.1 L 22.7 33.6 L 22.7 35.0 L 24.1 35.4 L 25.0 37.3 L 20.8 37.8 L 19.9 39.2 L 21.3 40.6 L 25.0 40.6 L 26.0 42.0 L 26.4 54.5 L 24.1 68.0 L 23.2 69.4 L 21.3 69.4 L 20.4 70.3 L 21.8 73.6 L 16.7 79.6 L 16.7 84.3 L 17.6 85.7 L 15.3 87.0 L 14.8 90.8 L 15.7 91.7 L 47.8 91.7 L 48.7 90.8 L 48.7 87.5 L 45.9 85.7 L 47.3 83.3 L 47.3 80.5 L 46.4 78.2 L 41.8 73.1 L 43.2 71.7 L 43.2 69.8 L 39.9 68.9 L 37.6 57.3 L 38.0 41.0 L 42.2 40.6 L 43.6 39.6 L 43.2 37.8 L 39.0 37.3 L 39.0 36.4 L 41.3 34.5 L 40.4 33.1 L 39.0 32.7 L 42.2 23.8 L 45.0 20.1 L 44.1 19.2 L 37.1 18.3 L 35.3 17.3 L 33.4 11.7 L 33.9 11.3 L 37.6 13.1 L 38.0 7.6 L 33.9 9.0 L 33.4 8.0 L 34.8 3.8 Z',
};
