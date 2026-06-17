/**
 * XP, level-ups, and the level-up offer: the agency layer. A level-up draws
 * three cards from FOUR sources, gated by the build slots so each pick is a real
 * opportunity cost:
 *   - a brand-new weapon (only while you have a free weapon slot),
 *   - leveling a weapon you already own,
 *   - a passive (only a new one while you have a free passive slot; otherwise a
 *     deeper stack of one you own),
 *   - an evolution (a gold card, guaranteed when its base weapon is maxed and
 *     its catalyst passive is stacked enough).
 * The draw is deterministic over (seed, level, build history) so the seeded
 * daily offers everyone the same choices. Every card is real: no trap, no dead
 * draw. Weapons are weighted up so build variety surfaces; defense is weighted
 * up when you are light on it so survival options compete with raw damage.
 */
import { PASSIVE_SLOTS, WEAPON_SLOTS, xpForLevel } from '../constants';
import { EVOLUTIONS } from '../evolutions';
import { makeRng } from '../rng';
import type { OfferCard, Player, SimEvent, World } from '../types';
import { BASE_WEAPON_IDS, WEAPONS } from '../weapons';
import { UPGRADES, UPGRADE_BY_ID } from '../upgrades';

/** Distinct passives the player has taken at least once. */
function passiveCount(taken: Record<string, number>): number {
  let n = 0;
  for (const u of UPGRADES) if ((taken[u.id] ?? 0) > 0) n += 1;
  return n;
}

/** Total defensive stacks taken (drives the survival-option weighting). */
function defenseStacks(taken: Record<string, number>): number {
  let n = 0;
  for (const u of UPGRADES) if (u.tags.includes('defense')) n += taken[u.id] ?? 0;
  return n;
}

function ownsWeapon(player: Player, id: string): boolean {
  return player.weapons.some((w) => w.id === id);
}

/** Evolutions whose prerequisites are met right now and aren't already owned. */
export function availableEvolutions(player: Player, taken: Record<string, number>): string[] {
  const out: string[] = [];
  for (const e of EVOLUTIONS) {
    if (ownsWeapon(player, e.evolvedWeaponId)) continue;
    const base = player.weapons.find((w) => w.id === e.baseWeaponId);
    const def = WEAPONS[e.baseWeaponId];
    if (!base || !def || base.level < def.maxLevel) continue;
    if ((taken[e.catalystId] ?? 0) < e.catalystThreshold) continue;
    out.push(e.id);
  }
  return out;
}

interface Weighted {
  card: OfferCard;
  w: number;
}

/** Build the three offered cards from the four sources, weighted and deduped. */
export function rollChoices(
  rng: { nextFloat(): number; nextInt(n: number): number },
  player: Player,
  taken: Record<string, number>,
  banished: Set<string> = new Set(),
  count = 3,
): OfferCard[] {
  const out: OfferCard[] = [];

  // 1) Evolution: guaranteed if available (so the player SEES their plan land).
  const evos = availableEvolutions(player, taken).filter((id) => !banished.has(`evo:${id}`));
  if (evos.length > 0) {
    const id = evos[rng.nextInt(evos.length)]!;
    out.push({ key: `evo:${id}`, kind: 'evolution', ref: id });
  }

  // 2) Candidate pool.
  const pool: Weighted[] = [];
  // New weapons (only with a free weapon slot).
  if (player.weapons.length < WEAPON_SLOTS) {
    for (const id of BASE_WEAPON_IDS) {
      if (ownsWeapon(player, id) || banished.has(id)) continue;
      pool.push({ card: { key: id, kind: 'newWeapon', ref: id }, w: 2.4 });
    }
  }
  // Level an owned weapon.
  for (const w of player.weapons) {
    const def = WEAPONS[w.id];
    if (!def || w.level >= def.maxLevel) continue;
    const key = `lvl:${w.id}`;
    if (banished.has(key)) continue;
    pool.push({ card: { key, kind: 'levelWeapon', ref: w.id }, w: 1.7 });
  }
  // Passives (a new one only with a free passive slot; else deepen an owned one).
  const owned = passiveCount(taken);
  const lightOnDefense = defenseStacks(taken) < 2;
  for (const u of UPGRADES) {
    if ((taken[u.id] ?? 0) >= u.maxStacks || banished.has(u.id)) continue;
    const have = (taken[u.id] ?? 0) > 0;
    if (owned >= PASSIVE_SLOTS && !have) continue;
    let w = u.tags.includes('defense') ? 1.2 : u.tags.includes('utility') ? 1.0 : 0.9;
    if (lightOnDefense && u.tags.includes('defense')) w += 0.8; // surface survival picks
    pool.push({ card: { key: u.id, kind: 'passive', ref: u.id }, w });
  }

  // 3) Weighted sample to fill the draw.
  while (out.length < count && pool.length > 0) {
    let total = 0;
    for (const x of pool) total += x.w;
    let r = rng.nextFloat() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx += 1) {
      r -= pool[idx]!.w;
      if (r <= 0) break;
    }
    out.push(pool[idx]!.card);
    pool.splice(idx, 1);
  }
  return out;
}

/**
 * Level-up offers from a per-level stream independent of the director's RNG.
 * Keyed by (seed, level), so a given player's run replays identically while the
 * offers adapt to their build (`player`, `taken`).
 */
export function offerChoices(
  seed: number,
  level: number,
  player: Player,
  taken: Record<string, number>,
  banished: Set<string> = new Set(),
): OfferCard[] {
  const mixed = (seed ^ Math.imul(level + 1, 0x9e3779b1)) >>> 0;
  return rollChoices(makeRng(mixed), player, taken, banished);
}

/** Apply a chosen passive card and record the stack (hyperbolic cards read it). */
export function applyUpgrade(player: Player, taken: Record<string, number>, id: string): void {
  const card = UPGRADE_BY_ID[id];
  if (!card) return;
  card.apply(player.mods, player, taken[id] ?? 0);
  taken[id] = (taken[id] ?? 0) + 1;
}

/** Apply any offered card: acquire/level a weapon, take a passive, or evolve. */
export function applyCard(world: World, taken: Record<string, number>, card: OfferCard): void {
  const { player } = world;
  if (card.kind === 'passive') {
    applyUpgrade(player, taken, card.ref);
    return;
  }
  if (card.kind === 'newWeapon') {
    if (!ownsWeapon(player, card.ref) && player.weapons.length < WEAPON_SLOTS) {
      player.weapons.push({ id: card.ref, level: 1, cooldown: 0 });
    }
    return;
  }
  if (card.kind === 'levelWeapon') {
    const w = player.weapons.find((x) => x.id === card.ref);
    const def = WEAPONS[card.ref];
    if (w && def && w.level < def.maxLevel) w.level += 1;
    return;
  }
  // Evolution: replace the base weapon in its slot with the evolved form.
  const evo = EVOLUTIONS.find((e) => e.id === card.ref);
  if (!evo) return;
  const w = player.weapons.find((x) => x.id === evo.baseWeaponId);
  if (!w) return;
  w.id = evo.evolvedWeaponId;
  w.level = 1;
  w.cooldown = 0;
  evo.grant?.(player.mods);
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
