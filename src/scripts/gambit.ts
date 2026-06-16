/**
 * Gambit engine. Loaded only on /games/gambit/ (all locales) as a processed
 * module; the page shell and every label are server-rendered by
 * GambitPageBody.astro. This module owns the PixiJS canvas, the fixed-step
 * simulation loop, input, the DOM HUD/overlays, the PowerUps shop, and
 * localStorage. The whole simulation ships inside this bundle (src/lib/gambit),
 * so the page makes zero runtime requests.
 *
 * Storage: localStorage under the games exception to the zero-storage policy
 * (key najdorf:gambit:v1). Only best time, currency, and purchased PowerUps
 * live there; every access degrades to in-memory if storage is blocked.
 *
 * Determinism: the run is seeded from the New York calendar date, so the daily
 * difficulty curve is shared; the sim never reads wall-clock time (survival is
 * step-derived), and the loop clamps + caps catch-up so a backgrounded tab can
 * never spiral.
 */
import { Application, Container, Graphics, Sprite, type Texture } from 'pixi.js';
import {
  ARENA_HALF,
  COLOR_ACCENT,
  COLOR_BOARD_DARK,
  COLOR_BOARD_LIGHT,
  COLOR_GEM,
  COLOR_PLAYER,
  COLOR_PLAYER_RING,
  COLOR_PROJECTILE,
  DT_MS,
  MAX_ENEMIES,
  MAX_FRAME_MS,
  MAX_GEMS,
  MAX_PROJECTILES,
  MAX_STEPS,
} from '../lib/gambit/constants';
import { dailySeed, dayNumber, nyDate, secondsToNyMidnight } from '../lib/gambit/daily';
import { ALL_ARCHETYPES } from '../lib/gambit/enemies';
import { DEFAULT_HERO } from '../lib/gambit/heroes';
import { POWERUPS, powerupCost } from '../lib/gambit/powerups';
import { STORAGE_KEY, deserialize, emptyState, serialize } from '../lib/gambit/storage';
import { applyUpgrade, offerChoices } from '../lib/gambit/systems/progression';
import type { EnemyShape, StoredState, World } from '../lib/gambit/types';
import { createWorld, runResult, step } from '../lib/gambit/world';

interface L10n {
  upgrades: Record<string, { name: string; desc: string }>;
  buy: string;
  maxed: string;
  newBest: string;
}

const ENEMY_REF = 20;
const PROJ_REF = 6;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clampPct = (v: number): number => (v < 0 ? 0 : v > 100 ? 100 : v);

function formatClock(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** localStorage with an in-memory fallback so private browsing still plays. */
const store = (() => {
  let memory: StoredState = emptyState();
  return {
    load(): StoredState {
      try {
        memory = deserialize(window.localStorage.getItem(STORAGE_KEY));
      } catch {
        /* blocked: keep memory */
      }
      return memory;
    },
    save(state: StoredState): void {
      memory = state;
      try {
        window.localStorage.setItem(STORAGE_KEY, serialize(state));
      } catch {
        /* in-memory only */
      }
    },
  };
})();

async function init(): Promise<void> {
  const root = document.getElementById('gambit-app');
  if (!root) return;
  const l10n = JSON.parse(root.dataset.l10n ?? '{}') as L10n;

  const fallback = root.querySelector<HTMLElement>('[data-gg-fallback]');
  const ui = root.querySelector<HTMLElement>('[data-gg-ui]');
  const stage = root.querySelector<HTMLElement>('[data-gg-stage]');
  if (!ui || !stage) return;

  const q = <T extends HTMLElement>(sel: string): T | null => root.querySelector<T>(sel);
  const hud = q('[data-gg-hud]');
  const startOverlay = q('[data-gg-start]');
  const levelOverlay = q('[data-gg-levelup]');
  const pauseOverlay = q('[data-gg-pausescreen]');
  const overOverlay = q('[data-gg-over]');
  const cardsBox = q('[data-gg-cards]');

  const elTime = q('[data-gg-time]');
  const elLevel = q('[data-gg-level]');
  const elKills = q('[data-gg-kills]');
  const elHp = q('[data-gg-hp]');
  const elXp = q('[data-gg-xp]');
  const elDayNum = q('[data-gg-daynum]');
  const elBest = q('[data-gg-best]');
  const elCountdown = q('[data-gg-countdown]');
  const elCurrency = q('[data-gg-currency]');
  const standardBtn = q('[data-gg-standard]');

  let saved = store.load();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- PixiJS setup (async; reveal only after this resolves) ---
  const app = new Application();
  await app.init({
    preference: 'webgl',
    resizeTo: stage,
    antialias: false,
    backgroundAlpha: 0,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    powerPreference: 'high-performance',
  });
  stage.appendChild(app.canvas);

  // --- Bake textures once (white shapes, tinted per entity) ---
  const tex = (draw: (g: Graphics) => void): Texture => {
    const g = new Graphics();
    draw(g);
    const t = app.renderer.generateTexture(g);
    g.destroy();
    return t;
  };
  const polyPts = (sides: number, r: number, rot: number): number[] => {
    const pts: number[] = [];
    for (let i = 0; i < sides; i += 1) {
      const a = rot + (i / sides) * Math.PI * 2;
      pts.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    return pts;
  };
  const shapeTex: Record<EnemyShape, Texture> = {
    triangle: tex((g) => g.poly(polyPts(3, ENEMY_REF, -Math.PI / 2)).fill(0xffffff)),
    square: tex((g) =>
      g.rect(-ENEMY_REF * 0.85, -ENEMY_REF * 0.85, ENEMY_REF * 1.7, ENEMY_REF * 1.7).fill(0xffffff),
    ),
    pentagon: tex((g) => g.poly(polyPts(5, ENEMY_REF, -Math.PI / 2)).fill(0xffffff)),
    diamond: tex((g) => g.poly(polyPts(4, ENEMY_REF, -Math.PI / 2)).fill(0xffffff)),
  };
  const gemTex = tex((g) => g.poly(polyPts(4, 8, -Math.PI / 2)).fill(0xffffff));
  const projTex = tex((g) => g.circle(0, 0, PROJ_REF).fill(0xffffff));

  // --- Layers (inside a camera container) ---
  const camera = new Container();
  app.stage.addChild(camera);

  const arena = new Graphics();
  const cell = 160;
  for (let gx = -ARENA_HALF; gx < ARENA_HALF; gx += cell) {
    for (let gy = -ARENA_HALF; gy < ARENA_HALF; gy += cell) {
      const dark = (Math.round(gx / cell) + Math.round(gy / cell)) % 2 === 0;
      arena.rect(gx, gy, cell, cell).fill(dark ? COLOR_BOARD_DARK : COLOR_BOARD_LIGHT);
    }
  }
  arena
    .rect(-ARENA_HALF, -ARENA_HALF, ARENA_HALF * 2, ARENA_HALF * 2)
    .stroke({ width: 6, color: COLOR_ACCENT, alpha: 0.5 });
  camera.addChild(arena);

  const gemLayer = new Container();
  const enemyLayer = new Container();
  const projLayer = new Container();
  const fxLayer = new Container();
  camera.addChild(gemLayer, enemyLayer, projLayer);

  // Player: a high-contrast piece, drawn once and repositioned.
  const playerNode = new Graphics();
  playerNode.circle(0, 0, DEFAULT_HERO.radius).fill(COLOR_PLAYER);
  playerNode.circle(0, 0, DEFAULT_HERO.radius + 3).stroke({ width: 3, color: COLOR_PLAYER_RING });
  playerNode.circle(0, 0, DEFAULT_HERO.radius - 6).fill(COLOR_ACCENT);
  camera.addChild(playerNode, fxLayer);

  // --- Sprite pools, index-aligned with the entity stores ---
  const mkPool = (n: number, t: Texture, tint: number, layer: Container): Sprite[] => {
    const arr: Sprite[] = [];
    for (let i = 0; i < n; i += 1) {
      const s = new Sprite(t);
      s.anchor.set(0.5);
      s.tint = tint;
      s.visible = false;
      layer.addChild(s);
      arr.push(s);
    }
    return arr;
  };
  // Enemy textures vary per frame; start with triangle.
  const enemySprites = mkPool(MAX_ENEMIES, shapeTex.triangle, 0xffffff, enemyLayer);
  const projSprites = mkPool(MAX_PROJECTILES, projTex, COLOR_PROJECTILE, projLayer);
  const gemSprites = mkPool(MAX_GEMS, gemTex, COLOR_GEM, gemLayer);

  // --- Game state ---
  const game = {
    world: null as World | null,
    running: false,
    paused: false,
    overlay: 'start' as 'start' | 'levelup' | 'pause' | 'over' | null,
    taken: {} as Record<string, number>,
    levelQueue: [] as number[],
    accumulator: 0,
    shake: 0,
  };

  // --- Input ---
  const keys = new Set<string>();
  const touch = { active: false, vx: 0, vy: 0, origin: { x: 0, y: 0 } };
  const MOVE_KEYS = new Set([
    'w',
    'a',
    's',
    'd',
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    ' ',
  ]);
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (MOVE_KEYS.has(k)) {
      keys.add(k);
      if (game.running && !game.overlay) e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => {
    keys.clear();
    autoPause();
  });

  stage.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!game.running || game.overlay) return;
    touch.active = true;
    touch.origin.x = e.clientX;
    touch.origin.y = e.clientY;
    touch.vx = 0;
    touch.vy = 0;
    try {
      stage.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (touch.active) updateTouch(e.clientX - touch.origin.x, e.clientY - touch.origin.y);
  });
  const endTouch = (): void => {
    touch.active = false;
    touch.vx = 0;
    touch.vy = 0;
  };
  stage.addEventListener('pointerup', endTouch);
  stage.addEventListener('pointercancel', endTouch);

  function updateTouch(dx: number, dy: number): void {
    const max = 56;
    const len = Math.hypot(dx, dy);
    const s = len > max ? max / len : 1;
    touch.vx = (dx * s) / max;
    touch.vy = (dy * s) / max;
  }

  function inputVec(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y -= 1;
    if (keys.has('s') || keys.has('arrowdown')) y += 1;
    if (x !== 0 || y !== 0) return { x, y };
    if (touch.active) return { x: touch.vx, y: touch.vy };
    return { x: 0, y: 0 };
  }

  // --- Overlay helpers ---
  const show = (el: HTMLElement | null, on: boolean): void => {
    if (el) el.hidden = !on;
  };
  function setOverlay(which: typeof game.overlay): void {
    game.overlay = which;
    show(startOverlay, which === 'start');
    show(levelOverlay, which === 'levelup');
    show(pauseOverlay, which === 'pause');
    show(overOverlay, which === 'over');
    show(hud, game.running && which !== 'start' && which !== 'over');
  }

  // --- Run lifecycle ---
  function buildWorld(): World {
    const seed = dailySeed(nyDate());
    const pus = saved.standard ? {} : saved.powerups;
    return createWorld(seed, DEFAULT_HERO, pus);
  }

  function startRun(): void {
    game.taken = {};
    game.levelQueue = [];
    game.accumulator = 0;
    game.shake = 0;
    game.world = buildWorld();
    game.running = true;
    game.paused = false;
    setOverlay(null);
  }

  function autoPause(): void {
    if (game.running && !game.paused && game.overlay === null) {
      game.paused = true;
      game.accumulator = 0;
      setOverlay('pause');
    }
  }

  function endRun(): void {
    const w = game.world;
    game.running = false;
    if (w) {
      const r = runResult(w);
      saved.currency += r.currencyEarned;
      const isBest = r.survivalMs > saved.bestMs;
      if (isBest) saved.bestMs = r.survivalMs;
      store.save(saved);
      if (elBest)
        elBest.textContent = saved.bestMs > 0 ? formatClock(Math.floor(saved.bestMs / 1000)) : '';
      renderShop();
      const set = (sel: string, val: string): void => {
        const e = q(sel);
        if (e) e.textContent = val;
      };
      set('[data-gg-r-time]', formatClock(Math.floor(r.survivalMs / 1000)));
      set('[data-gg-r-level]', String(r.level));
      set('[data-gg-r-kills]', String(r.kills));
      set('[data-gg-r-earned]', `◆ ${r.currencyEarned}`);
      show(q('[data-gg-newbest]'), isBest);
    }
    setOverlay('over');
  }

  // --- Level-up choices ---
  function openLevelup(): void {
    setOverlay('levelup');
    renderCards();
  }
  function renderCards(): void {
    if (!cardsBox || !game.world) return;
    const level = game.levelQueue[0] ?? game.world.player.level;
    const ids = offerChoices(game.world.seed, level, game.taken);
    cardsBox.replaceChildren();
    for (const id of ids) {
      const info = l10n.upgrades[id] ?? { name: id, desc: '' };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gg-card';
      const name = document.createElement('span');
      name.className = 'gg-card-name';
      name.textContent = info.name;
      const desc = document.createElement('span');
      desc.className = 'gg-card-desc';
      desc.textContent = info.desc;
      btn.append(name, desc);
      btn.addEventListener('click', () => pickCard(id));
      cardsBox.appendChild(btn);
    }
  }
  function pickCard(id: string): void {
    if (!game.world) return;
    applyUpgrade(game.world.player, game.taken, id);
    game.levelQueue.shift();
    if (game.levelQueue.length > 0) {
      renderCards();
    } else {
      game.accumulator = 0;
      setOverlay(null);
    }
  }

  function processEvents(): void {
    if (!game.world) return;
    for (const ev of game.world.events) {
      if (ev.type === 'levelup') game.levelQueue.push(ev.level);
      else if (ev.type === 'hit' && !reduced) game.shake = 12;
    }
  }

  // --- Shop ---
  function renderShop(): void {
    if (elCurrency) elCurrency.textContent = `◆ ${saved.currency}`;
    for (const def of POWERUPS) {
      const lvl = saved.powerups[def.id] ?? 0;
      const levelEl = q(`[data-gg-pu-level="${def.id}"]`);
      const costEl = q(`[data-gg-pu-cost="${def.id}"]`);
      const buyEl = q<HTMLButtonElement>(`[data-gg-pu-buy="${def.id}"]`);
      if (levelEl) levelEl.textContent = `${lvl}/${def.maxLevel}`;
      const maxed = lvl >= def.maxLevel;
      const cost = powerupCost(def, lvl);
      if (costEl) costEl.textContent = maxed ? l10n.maxed : `◆ ${cost}`;
      if (buyEl) buyEl.disabled = maxed || saved.currency < cost;
    }
  }
  for (const def of POWERUPS) {
    const buyEl = q<HTMLButtonElement>(`[data-gg-pu-buy="${def.id}"]`);
    buyEl?.addEventListener('click', () => {
      const lvl = saved.powerups[def.id] ?? 0;
      const cost = powerupCost(def, lvl);
      if (lvl >= def.maxLevel || saved.currency < cost) return;
      saved.currency -= cost;
      saved.powerups[def.id] = lvl + 1;
      store.save(saved);
      renderShop();
    });
  }

  // --- Button wiring ---
  q('[data-gg-play]')?.addEventListener('click', startRun);
  q('[data-gg-retry]')?.addEventListener('click', startRun);
  q('[data-gg-back]')?.addEventListener('click', () => {
    if (game.overlay !== 'over') return;
    setOverlay('start');
  });
  q('[data-gg-pause]')?.addEventListener('click', () => {
    if (!game.running || game.overlay) return;
    game.paused = true;
    game.accumulator = 0;
    setOverlay('pause');
  });
  q('[data-gg-resume]')?.addEventListener('click', () => {
    if (game.overlay !== 'pause') return;
    game.paused = false;
    setOverlay(null);
  });
  q('[data-gg-end]')?.addEventListener('click', () => {
    if (game.overlay !== 'pause') return;
    endRun();
  });
  standardBtn?.addEventListener('click', () => {
    saved.standard = !saved.standard;
    standardBtn.setAttribute('aria-pressed', saved.standard ? 'true' : 'false');
    store.save(saved);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) autoPause();
  });

  // --- Main loop: fixed-step accumulator decoupled from render ---
  app.ticker.add((ticker) => {
    const w = game.world;
    const simActive = game.running && !game.paused && game.overlay == null && w != null && !w.dead;
    if (simActive && w) {
      let frameMs = ticker.deltaMS;
      if (frameMs > MAX_FRAME_MS) frameMs = MAX_FRAME_MS;
      game.accumulator += frameMs;
      let steps = 0;
      while (game.accumulator >= DT_MS && steps < MAX_STEPS) {
        const mv = inputVec();
        w.player.inputX = mv.x;
        w.player.inputY = mv.y;
        step(w);
        game.accumulator -= DT_MS;
        steps += 1;
        processEvents();
        if (w.dead) {
          endRun();
          break;
        }
        if (game.levelQueue.length > 0) {
          openLevelup();
          break;
        }
      }
      if (steps === MAX_STEPS) game.accumulator = 0;
    }
    render(simActive ? game.accumulator / DT_MS : 1);
    updateHud();
  });

  function render(alpha: number): void {
    const w = game.world;
    if (!w) return;
    const px = lerp(w.player.prevX, w.player.x, alpha);
    const py = lerp(w.player.prevY, w.player.y, alpha);
    let camX = app.screen.width / 2 - px;
    let camY = app.screen.height / 2 - py;
    if (game.shake > 0.3) {
      camX += (Math.random() - 0.5) * game.shake;
      camY += (Math.random() - 0.5) * game.shake;
      game.shake *= 0.85;
    } else {
      game.shake = 0;
    }
    camera.position.set(camX, camY);
    playerNode.position.set(px, py);

    const ea = w.enemies.pool.active;
    for (let i = 0; i < ea.length; i += 1) {
      const s = enemySprites[i]!;
      if (ea[i] === 1) {
        const a = ALL_ARCHETYPES[w.enemies.type[i]!]!;
        s.texture = shapeTex[a.shape];
        s.tint = a.color;
        const sc = w.enemies.radius[i]! / ENEMY_REF;
        s.scale.set(sc);
        s.position.set(
          lerp(w.enemies.prevX[i]!, w.enemies.x[i]!, alpha),
          lerp(w.enemies.prevY[i]!, w.enemies.y[i]!, alpha),
        );
        s.visible = true;
      } else {
        s.visible = false;
      }
    }

    const pa = w.projectiles.pool.active;
    for (let i = 0; i < pa.length; i += 1) {
      const s = projSprites[i]!;
      if (pa[i] === 1) {
        s.scale.set(w.projectiles.radius[i]! / PROJ_REF);
        s.position.set(
          lerp(w.projectiles.prevX[i]!, w.projectiles.x[i]!, alpha),
          lerp(w.projectiles.prevY[i]!, w.projectiles.y[i]!, alpha),
        );
        s.visible = true;
      } else {
        s.visible = false;
      }
    }

    const ga = w.gems.pool.active;
    for (let i = 0; i < ga.length; i += 1) {
      const s = gemSprites[i]!;
      if (ga[i] === 1) {
        s.position.set(
          lerp(w.gems.prevX[i]!, w.gems.x[i]!, alpha),
          lerp(w.gems.prevY[i]!, w.gems.y[i]!, alpha),
        );
        s.visible = true;
      } else {
        s.visible = false;
      }
    }
  }

  function updateHud(): void {
    const w = game.world;
    if (!w || !game.running) return;
    if (elTime) elTime.textContent = formatClock(Math.floor(w.time.elapsedS));
    if (elLevel) elLevel.textContent = String(w.player.level);
    if (elKills) elKills.textContent = String(w.player.kills);
    if (elHp) elHp.style.width = `${clampPct((w.player.hp / w.player.maxHp) * 100)}%`;
    if (elXp) elXp.style.width = `${clampPct((w.player.xp / w.player.xpToNext) * 100)}%`;
  }

  // --- Initial UI state ---
  if (standardBtn) standardBtn.setAttribute('aria-pressed', saved.standard ? 'true' : 'false');
  if (elDayNum) elDayNum.textContent = `#${dayNumber(nyDate())}`;
  if (elBest)
    elBest.textContent =
      saved.bestMs > 0 ? formatClock(Math.floor(saved.bestMs / 1000)) : (elBest.textContent ?? '');
  renderShop();
  game.world = buildWorld(); // idle preview behind the start overlay
  setOverlay('start');

  // Countdown to the next NY-midnight daily.
  const tick = (): void => {
    if (elCountdown) elCountdown.textContent = formatClock(secondsToNyMidnight());
  };
  tick();
  window.setInterval(tick, 1000);

  // Reveal the shell now that Pixi is live (inverse-reveal; on failure the
  // fallback notice above stays visible because we never reach here).
  ui.hidden = false;
  if (fallback) fallback.hidden = true;
}

void init();
