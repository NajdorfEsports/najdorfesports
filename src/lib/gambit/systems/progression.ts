/**
 * XP, level-ups, and the level-up card draw: the agency layer's pure core.
 * `rollChoices` is deterministic over (rng state, taken stacks) so the seeded
 * daily offers everyone the same cards: it samples distinct eligible upgrades
 * weighted toward the player's dominant tag, then guarantees a wildcard
 * (an off-dominant option when one exists) so a build never feels solved. Every
 * card is a real upgrade, so there are no trap or all-dead draws.
 */
import { xpForLevel } from '../constants';
import { makeRng } from '../rng';
import type { Player, SimEvent, UpgradeTag } from '../types';
import { UPGRADES, UPGRADE_BY_ID } from '../upgrades';

const TAGS: UpgradeTag[] = ['offense', 'defense', 'utility'];

/** The tag the player has invested the most stacks in, or null if none yet. */
export function dominantTag(taken: Record<string, number>): UpgradeTag | null {
  const totals: Record<UpgradeTag, number> = { offense: 0, defense: 0, utility: 0 };
  for (const card of UPGRADES) {
    const stacks = taken[card.id] ?? 0;
    if (stacks > 0) for (const tag of card.tags) totals[tag] += stacks;
  }
  let best: UpgradeTag | null = null;
  let bestN = 0;
  for (const tag of TAGS) {
    if (totals[tag] > bestN) {
      bestN = totals[tag];
      best = tag;
    }
  }
  return best;
}

interface Weighted {
  id: string;
  tags: UpgradeTag[];
  w: number;
}

/** Three distinct, eligible, useful upgrade ids for a level-up choice. */
export function rollChoices(
  rng: { nextFloat(): number; nextInt(n: number): number },
  taken: Record<string, number>,
  count = 3,
): string[] {
  const eligible = UPGRADES.filter((u) => (taken[u.id] ?? 0) < u.maxStacks);
  if (eligible.length <= count) return eligible.map((u) => u.id);

  const dom = dominantTag(taken);
  const pool: Weighted[] = eligible.map((u) => ({
    id: u.id,
    tags: u.tags,
    w: 1 + (dom && u.tags.includes(dom) ? 1.4 : 0),
  }));

  const chosen: Weighted[] = [];
  while (chosen.length < count && pool.length > 0) {
    const total = pool.reduce((s, x) => s + x.w, 0);
    let r = rng.nextFloat() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx += 1) {
      r -= pool[idx]!.w;
      if (r <= 0) break;
    }
    chosen.push(pool[idx]!);
    pool.splice(idx, 1);
  }

  // Wildcard guarantee: if every offered card shares the dominant tag and an
  // off-tag upgrade is available, swap the last pick for one, so the draw
  // always presents a real alternative direction.
  if (dom) {
    const hasOff = chosen.some((c) => !c.tags.includes(dom));
    if (!hasOff) {
      const chosenIds = new Set(chosen.map((c) => c.id));
      const candidates = eligible.filter((u) => !u.tags.includes(dom) && !chosenIds.has(u.id));
      if (candidates.length > 0) {
        const wild = candidates[rng.nextInt(candidates.length)]!;
        chosen[chosen.length - 1] = { id: wild.id, tags: wild.tags, w: 1 };
      }
    }
  }

  return chosen.map((c) => c.id);
}

/**
 * Level-up offers from a per-level stream independent of the director's RNG.
 * Keyed by (seed, level), so a given player's run replays identically while the
 * offers still adapt to their build (`taken`). Decoupling from world.rng means
 * card draws never perturb the spawn sequence and vice versa, no matter when a
 * player happens to level up.
 */
export function offerChoices(seed: number, level: number, taken: Record<string, number>): string[] {
  const mixed = (seed ^ Math.imul(level + 1, 0x9e3779b1)) >>> 0;
  return rollChoices(makeRng(mixed), taken);
}

/** Apply a chosen card and record the stack. */
export function applyUpgrade(player: Player, taken: Record<string, number>, id: string): void {
  const card = UPGRADE_BY_ID[id];
  if (!card) return;
  card.apply(player.mods, player);
  taken[id] = (taken[id] ?? 0) + 1;
}

/** Credit XP and emit one levelup event per level crossed. */
export function addXp(player: Player, amount: number, out: SimEvent[]): void {
  player.xp += amount;
  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;
    player.xpToNext = xpForLevel(player.level);
    out.push({ type: 'levelup', level: player.level });
  }
}
