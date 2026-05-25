/**
 * Manifest of roster handles that have a REAL portrait photo (not a stub) at
 * `public/roster/{handle}.webp`. Add a lowercase handle to this array as you
 * drop a real `.webp` over the placeholder stub of the same name.
 *
 * PlayerAvatar checks membership in this list to decide between rendering
 * the photo and rendering the monogram fallback. Stubs alone do not flip the
 * UI, they only reserve the URL path.
 *
 * Convention: lowercase, no whitespace, no special characters. So:
 *   - "brysonbtw" → public/roster/brysonbtw.webp
 *   - "OH1YO"     → public/roster/oh1yo.webp
 *   - "Detai1"    → public/roster/detai1.webp
 *
 * Image resolution: source files should be at LEAST 2× the largest display
 * size the avatar gets in the layout (currently 96px on the roster card →
 * 192px file). srcset's `2x` density descriptor tells the browser to treat
 * the file as 2x density; retina displays render sharp without an extra
 * download.
 */
export const rosterPortraits: ReadonlyArray<string> = [
  // (no real portraits yet, every handle still renders the monogram fallback)
];

export function hasPortrait(handle: string): boolean {
  return rosterPortraits.includes(handle.toLowerCase());
}

export function portraitPath(handle: string): string {
  return `/roster/${handle.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.webp`;
}
