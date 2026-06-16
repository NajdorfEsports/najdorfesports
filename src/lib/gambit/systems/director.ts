/**
 * Seeded spawn director. Credits accrue with a time-based difficulty
 * coefficient and are spent on eligible-and-affordable archetypes; cheap fodder
 * is culled over time so the mix escalates on its own. A fixed minute-marker
 * schedule layers in elites (with a high-value gem "chest" on death) for
 * power-spike pacing. The entity cap is the self-throttle: at cap, credits bank.
 * Everything draws from world.rng, so the daily run is reproducible.
 */
import {
  ARENA_HALF,
  DIRECTOR_BASE_RATE,
  MAX_ENEMIES,
  SPAWN_DIST,
  difficultyCoeff,
  enemyDamageScale,
  enemyHpScale,
} from '../constants';
import { ALL_ARCHETYPES, ELITE_INDEX, eligibleArchetypes } from '../enemies';
import type { World } from '../types';

/** Seconds between scheduled elite events. */
const EVENT_INTERVAL = 90;
/** Brutes that escort each elite. */
const ELITE_ESCORT = 3;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function spawnEnemy(world: World, typeIndex: number): void {
  const { enemies, player, rng } = world;
  const i = enemies.pool.spawn();
  if (i < 0) return;
  const a = ALL_ARCHETYPES[typeIndex]!;
  const elapsed = world.time.elapsedS;
  const angle = rng.range(0, Math.PI * 2);
  const x = clamp(player.x + Math.cos(angle) * SPAWN_DIST, -ARENA_HALF, ARENA_HALF);
  const y = clamp(player.y + Math.sin(angle) * SPAWN_DIST, -ARENA_HALF, ARENA_HALF);
  enemies.x[i] = x;
  enemies.y[i] = y;
  enemies.prevX[i] = x;
  enemies.prevY[i] = y;
  enemies.hp[i] = a.hp * enemyHpScale(elapsed);
  enemies.radius[i] = a.radius;
  enemies.speed[i] = a.speed;
  enemies.damage[i] = a.contactDamage * enemyDamageScale(elapsed);
  enemies.gem[i] = a.gemValue;
  enemies.type[i] = typeIndex;
  enemies.elite[i] = a.elite ? 1 : 0;
}

export function updateDirector(world: World, dt: number): void {
  const { director, rng, enemies } = world;
  const elapsed = world.time.elapsedS;

  director.credits += DIRECTOR_BASE_RATE * difficultyCoeff(elapsed) * dt;

  // Scheduled elite events (power-spike pacing), spawned outside the budget.
  while (elapsed >= (director.nextEventIndex + 1) * EVENT_INTERVAL) {
    spawnEnemy(world, ELITE_INDEX);
    const bruteIndex = ALL_ARCHETYPES.findIndex((a) => a.id === 'brute');
    for (let k = 0; k < ELITE_ESCORT; k += 1) spawnEnemy(world, bruteIndex);
    director.nextEventIndex += 1;
  }

  // Budget spend: keep buying affordable enemies until broke or at cap.
  const eligible = eligibleArchetypes(elapsed);
  if (eligible.length === 0) return;
  let guard = 64;
  while (guard > 0 && enemies.pool.count < MAX_ENEMIES) {
    guard -= 1;
    const affordable = eligible.filter((a) => a.cost <= director.credits);
    if (affordable.length === 0) break;
    const arche = rng.pick(affordable);
    director.credits -= arche.cost;
    spawnEnemy(world, ALL_ARCHETYPES.indexOf(arche));
  }
}
