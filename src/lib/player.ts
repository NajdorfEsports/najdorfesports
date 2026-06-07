import type { Role } from '../data/site';

/**
 * Role -> accent color. Values are CSS color expressions: var() refs for
 * Tank/DPS (track the theme) and fixed hex for the rest. Consumed in inline
 * `style=` attributes by PlayerCard and PlayerDetailBody, so the role->token
 * mapping has to live in TS (a pure-CSS approach can't pick the token).
 */
export const ROLE_ACCENT: Record<Role, string> = {
  Tank: 'var(--color-accent)',
  DPS: 'var(--color-accent-2)',
  Support: '#4ADE80',
  Flex: '#A78BFA',
  Coach: '#60A5FA',
  Manager: '#60A5FA',
};

export const DEFAULT_ACCENT = 'var(--color-accent-2)';

/** Accent color for a role, falling back to DEFAULT_ACCENT for unknown input. */
export function roleAccent(role: string): string {
  return ROLE_ACCENT[role as Role] ?? DEFAULT_ACCENT;
}

/**
 * Age in whole years from an ISO "YYYY-MM-DD" birth date, computed in UTC so
 * the build machine's timezone can't shift it. Returns null for missing or
 * malformed input, or an out-of-range age.
 */
export function ageFromBirth(iso?: string): number | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const now = new Date();
  let age = now.getUTCFullYear() - Number(y);
  const todayMD = now.getUTCMonth() * 100 + now.getUTCDate();
  const birthMD = (Number(mo) - 1) * 100 + Number(d);
  if (todayMD < birthMD) age -= 1;
  return age >= 0 && age < 100 ? age : null;
}
