/**
 * Pure (de)serialization for the saved state under key `najdorf:gambit:v1`:
 * best survival time, currency, purchased PowerUps, and the Standard-mode flag.
 * Node-testable; the localStorage IIFE with its in-memory fallback lives in the
 * bootstrap (src/scripts/gambit.ts), the same split OWdle uses. Any malformed or
 * old blob migrates to a clean empty state.
 */
import { POWERUP_BY_ID } from './powerups';
import type { StoredState } from './types';

export const STORAGE_KEY = 'najdorf:gambit:v1';

export function emptyState(): StoredState {
  return { version: 1, bestMs: 0, currency: 0, powerups: {}, standard: false };
}

function sanitizePowerups(input: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!input || typeof input !== 'object') return out;
  for (const [id, raw] of Object.entries(input as Record<string, unknown>)) {
    const def = POWERUP_BY_ID[id];
    if (!def) continue;
    const lvl = typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : 0;
    if (lvl > 0) out[id] = Math.min(def.maxLevel, lvl);
  }
  return out;
}

/** Parse and migrate a raw saved string into a valid StoredState. */
export function deserialize(raw: string | null): StoredState {
  if (!raw) return emptyState();
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (!o || o.version !== 1) return emptyState();
    return {
      version: 1,
      bestMs: typeof o.bestMs === 'number' && o.bestMs >= 0 ? o.bestMs : 0,
      currency: typeof o.currency === 'number' && o.currency >= 0 ? Math.floor(o.currency) : 0,
      powerups: sanitizePowerups(o.powerups),
      standard: o.standard === true,
    };
  } catch {
    return emptyState();
  }
}

export function serialize(state: StoredState): string {
  return JSON.stringify(state);
}
