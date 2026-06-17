/**
 * Seeded spawn director. Credits accrue with a time-based difficulty
 * coefficient and are spent on eligible-and-affordable archetypes; cheap fodder
 * is culled over time so the mix escalates. A fixed minute-marker schedule
 * layers in elites; a trio of closing-Wall rings in the back half forces the
 * player off any camped tile; and the climax Queen runs a phased fight (chase,
 * then summon-adds, then enrage). After the win mark, endless Queens keep
 * arriving. Enemy speed scales up over the run so move speed stays relevant. The
 * entity cap is the self-throttle: at cap, credits bank. Everything draws from
 * world.rng, so the daily run is reproducible.
 */
import {
  ARENA_HALF,
  DIRECTOR_BASE_RATE,
  ELITE_ADD_COUNT,
  ELITE_ARMOR,
  ELITE_HP_MULT,
  ELITE_SUMMON_INTERVAL,
  MAX_ENEMIES,
  REAPER_CRUISE,
  REAPER_SECONDS,
  SPAWN_DIST,
  difficultyCoeff,
  enemyDamageScale,
  enemyHpScale,
  enemySpeedScale,
} from '../constants';
import {
  ALL_ARCHETYPES,
  BRUTE_INDEX,
  ELITE_INDEX,
  REAPER,
  REAPER_INDEX,
  SHADE_INDEX,
  WALL_INDEX,
  eligibleArchetypes,
} from '../enemies';
import type { World } from '../types';

const BRUTE_BASE_HP = ALL_ARCHETYPES[BRUTE_INDEX]!.hp;

/** Seconds between scheduled elite events. */
const EVENT_INTERVAL = 60;
/** First elite event lands here, leaving the opening ~90s as a forgiving
 *  on-ramp; the cadence is steady after that. */
const FIRST_EVENT_S = 90;
/** Brutes that escort each elite. */
const ELITE_ESCORT = 3;

/** Closing-Wall ring events: a tight ring of tough bodies around the player. */
const WALL_TIMES = [330, 450, 540];
const WALL_RING_COUNT = 40;
const WALL_RING_RADIUS = SPAWN_DIST * 0.7;

/** Queen fight: HP-fraction thresholds and the add-summon cadence. */
const QUEEN_PHASE1_FRAC = 0.6; // below this she summons adds
const QUEEN_ENRAGE_FRAC = 0.25; // below this she enrages (more, faster adds)
const QUEEN_ADD_INTERVAL = 11; // seconds between add waves in phase 1
const QUEEN_ADD_COUNT = 4; // shades per wave
/** A maxed kill-cone retargets onto adds, so a light kill-scaling keeps the
 *  Queen's wall proportional to the player's farmed power (capped, never a sponge). */
const QUEEN_KILL_HP_CAP = 4000;

/** Endless: after the win mark, a new Queen every interval, each tankier. */
const ENDLESS_QUEEN_INTERVAL = 75;
const ENDLESS_QUEEN_HP_STEP = 1.3;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Spawn one enemy of `typeIndex`. Without an explicit position it appears on
 *  the off-screen ring around the player. Returns the pool slot, or -1 at cap. */
function spawnEnemy(world: World, typeIndex: number, px?: number, py?: number): number {
  const { enemies, player, rng } = world;
  const i = enemies.pool.spawn();
  if (i < 0) return -1;
  const a = ALL_ARCHETYPES[typeIndex]!;
  const elapsed = world.time.elapsedS;
  let x: number;
  let y: number;
  if (px !== undefined && py !== undefined) {
    x = clamp(px, -ARENA_HALF, ARENA_HALF);
    y = clamp(py, -ARENA_HALF, ARENA_HALF);
  } else {
    const angle = rng.range(0, Math.PI * 2);
    x = clamp(player.x + Math.cos(angle) * SPAWN_DIST, -ARENA_HALF, ARENA_HALF);
    y = clamp(player.y + Math.sin(angle) * SPAWN_DIST, -ARENA_HALF, ARENA_HALF);
  }
  const isReaper = a.id === 'reaper';
  const isElite = a.id === 'elite';
  enemies.x[i] = x;
  enemies.y[i] = y;
  enemies.prevX[i] = x;
  enemies.prevY[i] = y;
  enemies.vx[i] = 0;
  enemies.vy[i] = 0;
  // The Queen's HP is set directly (not time-scaled); a minibossy elite scales
  // off the LIVE brute HP so it stays proportionally tough the whole run (its
  // per-hit cap in collision.ts is what stops a maxed cone deleting it);
  // everything else scales with elapsed time.
  let hp: number;
  if (isReaper) hp = a.hp;
  else if (isElite) hp = BRUTE_BASE_HP * enemyHpScale(elapsed) * ELITE_HP_MULT;
  else hp = a.hp * enemyHpScale(elapsed);
  enemies.hp[i] = hp;
  enemies.maxHp[i] = hp;
  enemies.armor[i] = isElite ? ELITE_ARMOR : 0;
  enemies.radius[i] = a.radius;
  enemies.speed[i] = isReaper ? REAPER_CRUISE : a.speed * enemySpeedScale(elapsed);
  enemies.damage[i] = isReaper ? a.contactDamage : a.contactDamage * enemyDamageScale(elapsed);
  enemies.gem[i] = a.gemValue;
  enemies.type[i] = typeIndex;
  enemies.elite[i] = a.elite ? 1 : 0;
  if (a.elite) world.events.push({ type: 'spawn', x, y, reaper: isReaper });
  return i;
}

/** Spawn a Queen with the given HP multiplier. `track` wires the climax-fight
 *  state (phases, add summons); endless Queens are fire-and-forget. */
function spawnQueen(world: World, hpMult: number, track: boolean): void {
  const { player, director } = world;
  const i = spawnEnemy(world, REAPER_INDEX);
  if (i < 0) return;
  const hp = (REAPER.hp + Math.min(player.kills, QUEEN_KILL_HP_CAP)) * hpMult;
  world.enemies.hp[i] = hp;
  world.enemies.maxHp[i] = hp;
  if (track) {
    director.reaperIndex = i;
    director.reaperMaxHp = hp;
    director.reaperPhase = 0;
    director.reaperAddTimer = QUEEN_ADD_INTERVAL;
  }
}

/** A closing ring of Wall bodies centered on the player's current position. */
function spawnWallRing(world: World): void {
  const { player } = world;
  for (let k = 0; k < WALL_RING_COUNT; k += 1) {
    const a = (k / WALL_RING_COUNT) * Math.PI * 2;
    spawnEnemy(
      world,
      WALL_INDEX,
      player.x + Math.cos(a) * WALL_RING_RADIUS,
      player.y + Math.sin(a) * WALL_RING_RADIUS,
    );
  }
}

/** Living elites periodically summon adds near the player. The auto-weapon
 *  retargets onto the adds, so an elite survives by pulling fire, not by a
 *  bigger HP bar, and a stationary player gets boxed in. */
function updateEliteSummons(world: World, dt: number): void {
  const { director, enemies, player } = world;
  director.eliteSummonTimer -= dt;
  if (director.eliteSummonTimer > 0) return;
  director.eliteSummonTimer = ELITE_SUMMON_INTERVAL;
  const active = enemies.pool.active;
  for (let i = 0; i < active.length; i += 1) {
    if (active[i] !== 1 || enemies.type[i] !== ELITE_INDEX) continue;
    for (let k = 0; k < ELITE_ADD_COUNT; k += 1) {
      const a = world.rng.range(0, Math.PI * 2);
      const rad = SPAWN_DIST * 0.62;
      spawnEnemy(world, SHADE_INDEX, player.x + Math.cos(a) * rad, player.y + Math.sin(a) * rad);
    }
  }
}

/** Advance the living climax Queen: phase transitions and add summons. */
function updateQueenFight(world: World, dt: number): void {
  const { director, enemies, player, rng } = world;
  const r = director.reaperIndex;
  if (r < 0) return;
  if (enemies.pool.active[r] !== 1 || enemies.type[r] !== REAPER_INDEX) {
    director.reaperIndex = -1; // the Queen has fallen
    return;
  }
  const frac = director.reaperMaxHp > 0 ? enemies.hp[r]! / director.reaperMaxHp : 1;
  director.reaperPhase = frac < QUEEN_ENRAGE_FRAC ? 2 : frac < QUEEN_PHASE1_FRAC ? 1 : 0;
  if (director.reaperPhase >= 1) {
    director.reaperAddTimer -= dt;
    if (director.reaperAddTimer <= 0) {
      const enraged = director.reaperPhase === 2;
      const count = enraged ? QUEEN_ADD_COUNT + 2 : QUEEN_ADD_COUNT;
      for (let k = 0; k < count; k += 1) {
        const a = rng.range(0, Math.PI * 2);
        const rad = SPAWN_DIST * 0.55;
        spawnEnemy(world, SHADE_INDEX, player.x + Math.cos(a) * rad, player.y + Math.sin(a) * rad);
      }
      director.reaperAddTimer = enraged ? QUEEN_ADD_INTERVAL * 0.55 : QUEEN_ADD_INTERVAL;
    }
  }
}

export function updateDirector(world: World, dt: number): void {
  const { director, rng, enemies } = world;
  const elapsed = world.time.elapsedS;

  // While the climax Queen is alive she is the spotlight: throttle the ambient
  // swarm so the final minute is a duel (Queen + her adds), not Queen-on-top-of
  // a capped horde. The swarm thins as the player clears it, opening space.
  const rate = director.reaperIndex >= 0 ? DIRECTOR_BASE_RATE * 0.3 : DIRECTOR_BASE_RATE;
  director.credits += rate * difficultyCoeff(elapsed) * dt;

  // One-time climax: the Queen, one minute before the win mark.
  if (!director.reaperDone && elapsed >= REAPER_SECONDS) {
    spawnQueen(world, 1, true);
    director.reaperDone = true;
  }
  // The living climax Queen runs her phased fight.
  if (director.reaperIndex >= 0) updateQueenFight(world, dt);

  // Living elites summon adds (the mid-game miniboss threat).
  updateEliteSummons(world, dt);

  // Endless: after the win mark, escalating Queens keep coming.
  if (world.won) {
    director.endlessTimer -= dt;
    if (director.endlessTimer <= 0) {
      director.endlessQueens += 1;
      spawnQueen(world, ENDLESS_QUEEN_HP_STEP ** director.endlessQueens, false);
      director.endlessTimer = ENDLESS_QUEEN_INTERVAL;
    }
  }

  // Closing-Wall ring events (forced repositioning in the back half).
  while (
    director.nextWallIndex < WALL_TIMES.length &&
    elapsed >= WALL_TIMES[director.nextWallIndex]!
  ) {
    spawnWallRing(world);
    director.nextWallIndex += 1;
  }

  // Scheduled elite events (power-spike pacing), spawned outside the budget.
  // The back half sends two elites at once for a denser miniboss cadence.
  while (elapsed >= FIRST_EVENT_S + director.nextEventIndex * EVENT_INTERVAL) {
    const eliteCount = elapsed >= 420 ? 2 : 1;
    for (let e = 0; e < eliteCount; e += 1) spawnEnemy(world, ELITE_INDEX);
    for (let k = 0; k < ELITE_ESCORT; k += 1) spawnEnemy(world, BRUTE_INDEX);
    director.nextEventIndex += 1;
  }

  // Budget spend: keep buying affordable enemies until broke or at cap. The
  // pick is uniform over the eligible mix; mid-game variety comes from culling
  // pawns out (enemies.ts), not from over-buying heavies (that just makes a
  // tanky wall that accumulates to the cap).
  const eligible = eligibleArchetypes(elapsed);
  if (eligible.length === 0) return;
  let guard = 128;
  while (guard > 0 && enemies.pool.count < MAX_ENEMIES) {
    guard -= 1;
    const affordable = eligible.filter((a) => a.cost <= director.credits);
    if (affordable.length === 0) break;
    const arche = rng.pick(affordable);
    director.credits -= arche.cost;
    spawnEnemy(world, ALL_ARCHETYPES.indexOf(arche));
  }
}
