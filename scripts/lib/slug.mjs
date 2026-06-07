// Shared slug helper for the icon fetchers. Both fetch-hero-icons and
// fetch-map-icons previously defined identical accent-stripping slug logic;
// this is the single copy.

/** Strip combining diacritics via NFD (e.g. 'Esperança' -> 'Esperanca'),
 *  matching how Liquipedia's older file uploads transliterate accents. */
export function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Filename/path slug: accent-stripped, lowercased, punctuation removed, spaces
 *  to hyphens. Reproduces the prior hero + map slug output exactly. */
export function slugify(name) {
  return stripAccents(name)
    .toLowerCase()
    .replace(/[:.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
