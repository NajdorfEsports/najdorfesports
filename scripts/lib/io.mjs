// Shared filesystem helpers for the data-fetch scripts.
import { writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/** True for null/undefined, an empty array, or an object with no own keys. */
export function isEmptyData(data) {
  return (
    data == null ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)
  );
}

/**
 * Atomic JSON write with a NEVER-WRITE-EMPTY guard.
 *
 * Stages to <path>.tmp then renames (atomic on POSIX, all-or-nothing on Windows
 * same-volume), so a crash mid-write can't truncate the file. If `data` is empty
 * (an empty array, or an object with no keys) the existing file is PRESERVED
 * (logs a warning) and nothing is written, unless `allowEmpty` is set. This is
 * the guard the icon fetchers were missing: a total network failure produced an
 * empty `{}` that silently blanked heroes.json / maps.json.
 *
 * Returns true if it wrote, false if it skipped an empty result.
 */
export async function writeJsonAtomic(path, data, { label = path, allowEmpty = false } = {}) {
  if (!allowEmpty && isEmptyData(data)) {
    console.warn(`[io] ${label}: empty result, preserving existing ${path} (no write).`);
    return false;
  }
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  await rename(tmp, path);
  return true;
}
