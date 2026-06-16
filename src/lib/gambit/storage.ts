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
  return {
    version: 1,
    bestMs: 0,
    currency: 0,
    powerups: {},
    casual: false,
    wins: 0,
    hero: 'bishop',
    unlockedHeroes: ['bishop'],
    userZoom: 1,
  };
}

const KNOWN_HEROES = ['bishop', 'knight'];

function sanitizeHeroes(input: unknown): string[] {
  const out = new Set(['bishop']);
  if (Array.isArray(input)) {
    for (const h of input) if (typeof h === 'string' && KNOWN_HEROES.includes(h)) out.add(h);
  }
  return [...out];
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
    const unlockedHeroes = sanitizeHeroes(o.unlockedHeroes);
    const hero = typeof o.hero === 'string' && unlockedHeroes.includes(o.hero) ? o.hero : 'bishop';
    const zoom = typeof o.userZoom === 'number' && Number.isFinite(o.userZoom) ? o.userZoom : 1;
    return {
      version: 1,
      bestMs: typeof o.bestMs === 'number' && o.bestMs >= 0 ? o.bestMs : 0,
      currency: typeof o.currency === 'number' && o.currency >= 0 ? Math.floor(o.currency) : 0,
      powerups: sanitizePowerups(o.powerups),
      casual: o.casual === true,
      wins: typeof o.wins === 'number' && o.wins >= 0 ? Math.floor(o.wins) : 0,
      hero,
      unlockedHeroes,
      userZoom: Math.min(1.6, Math.max(0.6, zoom)),
    };
  } catch {
    return emptyState();
  }
}

export function serialize(state: StoredState): string {
  return JSON.stringify(state);
}
