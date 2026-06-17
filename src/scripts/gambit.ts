/**
 * Gambit engine. Loaded only on /games/gambit/ (all locales) as a processed
 * module; the page shell and every label are server-rendered by
 * GambitPageBody.astro. This module owns the PixiJS canvas, the fixed-step
 * simulation loop, input, the DOM HUD/overlays, the PowerUps shop, and
 * localStorage. The whole simulation ships inside this bundle (src/lib/gambit),
 * so the page makes zero runtime requests.
 *
 * Visuals are 100% in-engine and original: chess-piece silhouettes baked from
 * 2D canvases (glow via shadowBlur), a pooled additive particle system for
 * juice (muzzle, hit sparks, death bursts, pickups, level-up rings), glowing
 * crystal gems kept visually distinct from the dark enemy pieces, an arena
 * vignette, and a screen hit-flash. Every motion effect is gated on
 * prefers-reduced-motion. No image assets, no filters, no eval.
 *
 * Storage: localStorage under the games exception to the zero-storage policy
 * (key najdorf:gambit:v1). Only best time, currency, and purchased PowerUps
 * live there; every access degrades to in-memory if storage is blocked.
 *
 * Determinism: the run is seeded from the New York calendar date, so the daily
 * difficulty curve is shared; the sim never reads wall-clock time (survival is
 * step-derived), and the loop clamps + caps catch-up so a backgrounded tab can
 * never spiral. Cosmetic randomness (particles, shake) uses Math.random and
 * never touches the seeded sim, so it can never desync a run.
 */
// CRITICAL: this side-effecting import swaps PixiJS v8's `new Function`-based
// uniform/shader/UBO/particle code generation for non-eval polyfills. Without
// it, app.init() throws under the site CSP (script-src 'self', no
// 'unsafe-eval') and the canvas never boots. Must load before `Application`.
// Do not remove without relaxing the CSP (which we do not want to do).
import 'pixi.js/unsafe-eval';
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import {
  ARENA_HALF,
  COLOR_ACCENT,
  COLOR_ACCENT2,
  COLOR_BOARD_DARK,
  COLOR_BOARD_LIGHT,
  COLOR_LOSS,
  COLOR_ORBIT,
  COLOR_WIN,
  DT_MS,
  MAX_ENEMIES,
  MAX_FRAME_MS,
  MAX_GEMS,
  MAX_PROJECTILES,
  MAX_STEPS,
  ORBIT_ANGULAR,
  ORBIT_RADIUS,
} from '../lib/gambit/constants';
import { dailySeed, dayNumber, nyDate, secondsToNyMidnight } from '../lib/gambit/daily';
import { ALL_ARCHETYPES } from '../lib/gambit/enemies';
import { DEFAULT_HERO, HEROES } from '../lib/gambit/heroes';
import { POWERUPS, powerupCost } from '../lib/gambit/powerups';
import { STORAGE_KEY, deserialize, emptyState, serialize } from '../lib/gambit/storage';
import { applyCard, offerChoices } from '../lib/gambit/systems/progression';
import { resolveAoe } from '../lib/gambit/systems/weapon';
import type { OfferCard, StoredState, World } from '../lib/gambit/types';
import { WEAPONS } from '../lib/gambit/weapons';
import { createWorld, runResult, step } from '../lib/gambit/world';

interface L10n {
  upgrades: Record<string, { name: string; desc: string }>;
  weapons: Record<string, { name: string; desc: string }>;
  evolutions: Record<string, { name: string; desc: string }>;
  heroes: Record<string, { name: string; desc: string }>;
  buy: string;
  maxed: string;
  newBest: string;
  unlockHeading: string;
  newWeaponTag: string;
  evolutionTag: string;
  levelTag: string;
}

/** Design radius the piece silhouettes are baked to (texture-space px). */
const PIECE_R = 26;
const ENEMY_VIS = 1.7;
const PROJ_REF = 6;
const PARTICLE_MAX = 520;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clampPct = (v: number): number => (v < 0 ? 0 : v > 100 ? 100 : v);
const css = (n: number): string => `#${(n >>> 0).toString(16).padStart(6, '0').slice(-6)}`;
const rand = (a: number, b: number): number => a + Math.random() * (b - a);

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

// --- Chess-piece silhouette path builders (centered at cx,cy, design radius R) ---
type Pen = CanvasRenderingContext2D;
function pawnPath(c: Pen, cx: number, cy: number, R: number): void {
  c.moveTo(cx - R * 0.5, cy + R * 0.95);
  c.lineTo(cx + R * 0.5, cy + R * 0.95);
  c.lineTo(cx + R * 0.18, cy - R * 0.02);
  c.lineTo(cx - R * 0.18, cy - R * 0.02);
  c.closePath();
  c.moveTo(cx + R * 0.36, cy - R * 0.32);
  c.arc(cx, cy - R * 0.32, R * 0.36, 0, Math.PI * 2);
}
function knightPath(c: Pen, cx: number, cy: number, R: number): void {
  c.moveTo(cx - R * 0.5, cy + R * 0.95);
  c.lineTo(cx + R * 0.5, cy + R * 0.95);
  c.lineTo(cx + R * 0.3, cy + R * 0.5);
  c.lineTo(cx + R * 0.55, cy - R * 0.1);
  c.lineTo(cx + R * 0.22, cy - R * 0.22);
  c.lineTo(cx + R * 0.38, cy - R * 0.72);
  c.lineTo(cx - R * 0.08, cy - R * 0.48);
  c.lineTo(cx - R * 0.42, cy - R * 0.2);
  c.lineTo(cx - R * 0.26, cy + R * 0.32);
  c.lineTo(cx - R * 0.45, cy + R * 0.55);
  c.closePath();
}
function rookPath(c: Pen, cx: number, cy: number, R: number): void {
  c.moveTo(cx - R * 0.55, cy + R * 0.95);
  c.lineTo(cx + R * 0.55, cy + R * 0.95);
  c.lineTo(cx + R * 0.38, cy + R * 0.5);
  c.lineTo(cx + R * 0.42, cy - R * 0.42);
  c.lineTo(cx + R * 0.42, cy - R * 0.75);
  c.lineTo(cx + R * 0.2, cy - R * 0.75);
  c.lineTo(cx + R * 0.2, cy - R * 0.52);
  c.lineTo(cx - R * 0.2, cy - R * 0.52);
  c.lineTo(cx - R * 0.2, cy - R * 0.75);
  c.lineTo(cx - R * 0.42, cy - R * 0.75);
  c.lineTo(cx - R * 0.42, cy - R * 0.42);
  c.lineTo(cx - R * 0.38, cy + R * 0.5);
  c.closePath();
}
function queenPath(c: Pen, cx: number, cy: number, R: number): void {
  c.moveTo(cx - R * 0.5, cy + R * 0.95);
  c.lineTo(cx + R * 0.5, cy + R * 0.95);
  c.lineTo(cx + R * 0.28, cy + R * 0.3);
  c.lineTo(cx + R * 0.44, cy - R * 0.32);
  c.lineTo(cx + R * 0.3, cy - R * 0.18);
  c.lineTo(cx + R * 0.16, cy - R * 0.78);
  c.lineTo(cx, cy - R * 0.2);
  c.lineTo(cx - R * 0.16, cy - R * 0.78);
  c.lineTo(cx - R * 0.3, cy - R * 0.18);
  c.lineTo(cx - R * 0.44, cy - R * 0.32);
  c.lineTo(cx - R * 0.28, cy + R * 0.3);
  c.closePath();
}
function kingPath(c: Pen, cx: number, cy: number, R: number): void {
  c.moveTo(cx - R * 0.52, cy + R * 0.95);
  c.lineTo(cx + R * 0.52, cy + R * 0.95);
  c.lineTo(cx + R * 0.3, cy + R * 0.3);
  c.lineTo(cx + R * 0.4, cy - R * 0.45);
  c.lineTo(cx - R * 0.4, cy - R * 0.45);
  c.lineTo(cx - R * 0.3, cy + R * 0.3);
  c.closePath();
  c.moveTo(cx - R * 0.1, cy - R * 0.45);
  c.lineTo(cx + R * 0.1, cy - R * 0.45);
  c.lineTo(cx + R * 0.1, cy - R * 0.98);
  c.lineTo(cx - R * 0.1, cy - R * 0.98);
  c.closePath();
  c.moveTo(cx - R * 0.3, cy - R * 0.78);
  c.lineTo(cx + R * 0.3, cy - R * 0.78);
  c.lineTo(cx + R * 0.3, cy - R * 0.62);
  c.lineTo(cx - R * 0.3, cy - R * 0.62);
  c.closePath();
}
function bishopPath(c: Pen, cx: number, cy: number, R: number): void {
  c.moveTo(cx - R * 0.46, cy + R * 0.95);
  c.lineTo(cx + R * 0.46, cy + R * 0.95);
  c.lineTo(cx + R * 0.22, cy + R * 0.5);
  c.quadraticCurveTo(cx + R * 0.56, cy - R * 0.08, cx + R * 0.12, cy - R * 0.56);
  c.quadraticCurveTo(cx, cy - R * 0.72, cx - R * 0.12, cy - R * 0.56);
  c.quadraticCurveTo(cx - R * 0.56, cy - R * 0.08, cx - R * 0.22, cy + R * 0.5);
  c.closePath();
  c.moveTo(cx + R * 0.13, cy - R * 0.74);
  c.arc(cx, cy - R * 0.74, R * 0.13, 0, Math.PI * 2);
}

const PIECE_BY_ID: Record<string, (c: Pen, cx: number, cy: number, R: number) => void> = {
  pawn: pawnPath,
  runner: knightPath,
  shade: bishopPath,
  brute: rookPath,
  lancer: knightPath,
  wall: rookPath,
  knight: kingPath,
  elite: kingPath,
  reaper: queenPath,
};

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
  const winOverlay = q('[data-gg-win]');
  const warnEl = q('[data-gg-warn]');
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
    antialias: true,
    backgroundAlpha: 0,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    powerPreference: 'high-performance',
  });
  stage.appendChild(app.canvas);

  // --- Canvas-baked textures (CSP-safe; glow via shadowBlur) ---
  function canvasTex(w: number, h: number, draw: (c: Pen, w: number, h: number) => void): Texture {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    if (ctx) draw(ctx, w, h);
    return Texture.from(cv);
  }

  /** A dark chess piece with a glowing colored edge, tinted per archetype. */
  function pieceTex(
    build: (c: Pen, cx: number, cy: number, R: number) => void,
    edge: string,
    opts: { glow: number; line: number; fillTop: string; fillBottom: string },
  ): Texture {
    const size = 92;
    return canvasTex(size, size, (c) => {
      const cx = size / 2;
      const cy = size / 2;
      c.lineJoin = 'round';
      c.beginPath();
      build(c, cx, cy, PIECE_R);
      const g = c.createLinearGradient(0, cy - PIECE_R, 0, cy + PIECE_R);
      g.addColorStop(0, opts.fillTop);
      g.addColorStop(1, opts.fillBottom);
      c.shadowColor = edge;
      c.shadowBlur = opts.glow;
      c.fillStyle = g;
      c.fill();
      c.fill();
      c.shadowBlur = 0;
      c.lineWidth = opts.line;
      c.strokeStyle = edge;
      c.stroke();
    });
  }

  const archetypeTex: Texture[] = ALL_ARCHETYPES.map((a) => {
    const build = PIECE_BY_ID[a.id] ?? pawnPath;
    const elite = a.elite === true;
    return pieceTex(build, css(a.color), {
      glow: elite ? 18 : 12,
      line: elite ? 3.5 : 2.4,
      fillTop: '#3a3b48',
      fillBottom: '#16161f',
    });
  });

  const bishopTex = pieceTex(bishopPath, css(COLOR_ACCENT), {
    glow: 14,
    line: 2.5,
    fillTop: '#ffffff',
    fillBottom: css(COLOR_ACCENT2),
  });
  const knightHeroTex = pieceTex(knightPath, css(COLOR_ORBIT), {
    glow: 14,
    line: 2.5,
    fillTop: '#ffffff',
    fillBottom: css(COLOR_ORBIT),
  });
  const heroTex: Record<string, Texture> = { bishop: bishopTex, knight: knightHeroTex };

  // Orbiting blade (the orbiters weapon).
  const orbiterTex = canvasTex(28, 28, (c, w) => {
    const r = w / 2;
    const gl = c.createRadialGradient(r, r, 0, r, r, r);
    gl.addColorStop(0, 'rgba(139,233,255,0.95)');
    gl.addColorStop(1, 'rgba(139,233,255,0)');
    c.fillStyle = gl;
    c.fillRect(0, 0, w, w);
    const k = 6;
    c.beginPath();
    c.moveTo(r, r - k);
    c.lineTo(r + k, r);
    c.lineTo(r, r + k);
    c.lineTo(r - k, r);
    c.closePath();
    c.fillStyle = '#eaffff';
    c.fill();
  });

  // Soft radial glow (additive sparks, auras).
  const glowTex = canvasTex(48, 48, (c, w) => {
    const r = w / 2;
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  });

  // Expanding telegraph / level-up ring (additive, tinted).
  const ringTex = canvasTex(96, 96, (c, w) => {
    const r = w / 2;
    c.strokeStyle = 'rgba(255,255,255,1)';
    c.lineWidth = 5;
    c.shadowColor = 'rgba(255,255,255,1)';
    c.shadowBlur = 6;
    c.beginPath();
    c.arc(r, r, r - 8, 0, Math.PI * 2);
    c.stroke();
  });

  // Glowing crystal gem: clearly distinct from the dark enemy pieces.
  const gemTex = canvasTex(40, 40, (c, w) => {
    const r = w / 2;
    const gl = c.createRadialGradient(r, r, 0, r, r, r);
    gl.addColorStop(0, 'rgba(123,170,255,0.85)');
    gl.addColorStop(1, 'rgba(123,170,255,0)');
    c.fillStyle = gl;
    c.fillRect(0, 0, w, w);
    const k = 9;
    c.beginPath();
    c.moveTo(r, r - k);
    c.lineTo(r + k * 0.72, r);
    c.lineTo(r, r + k);
    c.lineTo(r - k * 0.72, r);
    c.closePath();
    const cg = c.createLinearGradient(r, r - k, r, r + k);
    cg.addColorStop(0, '#eaf1ff');
    cg.addColorStop(1, css(COLOR_ACCENT2));
    c.fillStyle = cg;
    c.fill();
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1;
    c.stroke();
  });

  // Glowing bolt (horizontal capsule); rotated + stretched to velocity.
  function mkProjTex(fill: string, glow: string): Texture {
    return canvasTex(40, 18, (c, w, h) => {
      const cy = h / 2;
      c.shadowColor = glow;
      c.shadowBlur = 6;
      c.fillStyle = fill;
      c.beginPath();
      c.roundRect(4, cy - 4, w - 8, 8, 4);
      c.fill();
      c.fill();
    });
  }
  const projTex = mkProjTex('#eef3ff', css(COLOR_ACCENT2));
  // One texture per projectile kind (index matches KIND_INDEX in weapon.ts):
  // 0 bolt (white), 1 radial (soft blue), 2 lance (bright blue), 3 seeker (violet).
  const projKindTex: Texture[] = [
    projTex,
    mkProjTex(css(COLOR_ACCENT2), css(COLOR_ACCENT2)),
    mkProjTex('#dbe6ff', css(COLOR_ACCENT)),
    mkProjTex('#d8c6ff', '#9b6bff'),
  ];

  // Soft additive ring for the aura weapons (Sanctum / Communion).
  const auraTex = canvasTex(128, 128, (c, w) => {
    const r = w / 2;
    const g = c.createRadialGradient(r, r, r * 0.45, r, r, r);
    g.addColorStop(0, 'rgba(107,141,255,0)');
    g.addColorStop(0.8, 'rgba(107,141,255,0.18)');
    g.addColorStop(1, 'rgba(107,141,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  });

  // Edge texture for the vignette + hit-flash (transparent center -> white edge).
  const edgeTex = canvasTex(256, 256, (c, w) => {
    const r = w / 2;
    const g = c.createRadialGradient(r, r, r * 0.32, r, r, r * 0.52);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, w);
  });

  // --- World layers (inside a camera container) ---
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
  // Faint grid glow + a glowing border frame.
  arena.rect(-ARENA_HALF, -ARENA_HALF, ARENA_HALF * 2, ARENA_HALF * 2).stroke({
    width: 10,
    color: COLOR_ACCENT,
    alpha: 0.18,
  });
  arena.rect(-ARENA_HALF, -ARENA_HALF, ARENA_HALF * 2, ARENA_HALF * 2).stroke({
    width: 3,
    color: COLOR_ACCENT2,
    alpha: 0.6,
  });
  camera.addChild(arena);

  const gemLayer = new Container();
  const enemyLayer = new Container();
  const projLayer = new Container();
  const fxLayer = new Container();
  camera.addChild(gemLayer, enemyLayer, projLayer);

  // Player: a glowing aura + the bishop silhouette, in a moved container.
  const playerGlow = new Sprite(glowTex);
  playerGlow.anchor.set(0.5);
  playerGlow.blendMode = 'add';
  playerGlow.tint = COLOR_ACCENT;
  playerGlow.scale.set((DEFAULT_HERO.radius * 4.6) / 24);
  playerGlow.alpha = 0.6;
  const bishopSprite = new Sprite(bishopTex);
  bishopSprite.anchor.set(0.5);
  bishopSprite.scale.set((DEFAULT_HERO.radius * ENEMY_VIS) / PIECE_R);
  const playerNode = new Container();
  playerNode.addChild(playerGlow, bishopSprite);
  camera.addChild(playerNode, fxLayer);

  // Aura field (Sanctum / Communion), drawn under the player.
  const auraSprite = new Sprite(auraTex);
  auraSprite.anchor.set(0.5);
  auraSprite.blendMode = 'add';
  auraSprite.visible = false;
  camera.addChild(auraSprite);

  // Orbiting blades (shown when the Carousel weapon is owned).
  const orbiterSprites: Sprite[] = [];
  for (let i = 0; i < 8; i += 1) {
    const s = new Sprite(orbiterTex);
    s.anchor.set(0.5);
    s.blendMode = 'add';
    s.visible = false;
    camera.addChild(s);
    orbiterSprites.push(s);
  }

  // Screen-fixed overlays (above the world; HUD is DOM above the canvas).
  const vignette = new Sprite(edgeTex);
  vignette.anchor.set(0.5);
  vignette.tint = 0x000000;
  vignette.alpha = 0.55;
  const hitFlash = new Sprite(edgeTex);
  hitFlash.anchor.set(0.5);
  hitFlash.tint = COLOR_LOSS;
  hitFlash.alpha = 0;
  app.stage.addChild(vignette, hitFlash);

  // --- Sprite pools, index-aligned with the entity stores ---
  const mkPool = (n: number, t: Texture, layer: Container): Sprite[] => {
    const arr: Sprite[] = [];
    for (let i = 0; i < n; i += 1) {
      const s = new Sprite(t);
      s.anchor.set(0.5);
      s.visible = false;
      layer.addChild(s);
      arr.push(s);
    }
    return arr;
  };
  const enemySprites = mkPool(MAX_ENEMIES, archetypeTex[0]!, enemyLayer);
  const projSprites = mkPool(MAX_PROJECTILES, projTex, projLayer);
  const gemSprites = mkPool(MAX_GEMS, gemTex, gemLayer);

  // --- Particle system (pooled, additive) ---
  const px = new Float32Array(PARTICLE_MAX);
  const py = new Float32Array(PARTICLE_MAX);
  const pvx = new Float32Array(PARTICLE_MAX);
  const pvy = new Float32Array(PARTICLE_MAX);
  const plife = new Float32Array(PARTICLE_MAX);
  const pmax = new Float32Array(PARTICLE_MAX);
  const psize0 = new Float32Array(PARTICLE_MAX);
  const psize1 = new Float32Array(PARTICLE_MAX);
  const pring = new Uint8Array(PARTICLE_MAX);
  const pfree: number[] = [];
  const particleSprites: Sprite[] = [];
  for (let i = PARTICLE_MAX - 1; i >= 0; i -= 1) pfree.push(i);
  for (let i = 0; i < PARTICLE_MAX; i += 1) {
    const s = new Sprite(glowTex);
    s.anchor.set(0.5);
    s.blendMode = 'add';
    s.visible = false;
    fxLayer.addChild(s);
    particleSprites.push(s);
  }

  function spawnParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    s0: number,
    s1: number,
    tint: number,
    ring: boolean,
  ): void {
    if (reduced) return;
    const i = pfree.pop();
    if (i === undefined) return;
    px[i] = x;
    py[i] = y;
    pvx[i] = vx;
    pvy[i] = vy;
    plife[i] = life;
    pmax[i] = life;
    psize0[i] = s0;
    psize1[i] = s1;
    pring[i] = ring ? 1 : 0;
    const s = particleSprites[i]!;
    s.texture = ring ? ringTex : glowTex;
    s.tint = tint;
    s.visible = true;
  }

  function burst(x: number, y: number, n: number, speed: number, tint: number, size: number): void {
    for (let k = 0; k < n; k += 1) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(speed * 0.4, speed);
      spawnParticle(
        x,
        y,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
        rand(0.3, 0.55),
        size,
        0,
        tint,
        false,
      );
    }
  }

  function updateParticles(dt: number): void {
    for (let i = 0; i < PARTICLE_MAX; i += 1) {
      const s = particleSprites[i]!;
      if (!s.visible) continue;
      plife[i] -= dt;
      if (plife[i]! <= 0) {
        s.visible = false;
        pfree.push(i);
        continue;
      }
      const t = 1 - plife[i]! / pmax[i]!;
      px[i] += pvx[i]! * dt;
      py[i] += pvy[i]! * dt;
      pvx[i] *= 0.9;
      pvy[i] *= 0.9;
      const size = lerp(psize0[i]!, psize1[i]!, t);
      s.position.set(px[i]!, py[i]!);
      const base = pring[i] === 1 ? 96 : 48;
      s.scale.set(size / base);
      s.alpha = pring[i] === 1 ? 1 - t : 1 - t * t;
    }
  }

  // --- Game state ---
  const game = {
    world: null as World | null,
    running: false,
    paused: false,
    overlay: 'start' as 'start' | 'levelup' | 'pause' | 'over' | 'win' | null,
    taken: {} as Record<string, number>,
    levelQueue: [] as number[],
    accumulator: 0,
    shake: 0,
    zoom: 1,
    flash: 0,
    playerFlash: 0,
    warn: 0,
    winPending: false,
    t: 0,
    dtSec: 0,
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
    show(winOverlay, which === 'win');
    show(hud, game.running && which !== 'start' && which !== 'over' && which !== 'win');
  }

  // --- Run lifecycle ---
  function buildWorld(): World {
    const seed = dailySeed(nyDate());
    // The seeded daily is pure by default (fair for everyone); casual mode opts
    // into the player's permanent PowerUps.
    const pus = saved.casual ? saved.powerups : {};
    const hero = HEROES[saved.hero] ?? DEFAULT_HERO;
    return createWorld(seed, hero, pus);
  }

  /** Point the player sprite at the selected hero. */
  function applyHero(): void {
    const hero = HEROES[saved.hero] ?? DEFAULT_HERO;
    bishopSprite.texture = heroTex[hero.id] ?? bishopTex;
    bishopSprite.scale.set((hero.radius * ENEMY_VIS) / PIECE_R);
    playerGlow.scale.set((hero.radius * 4.6) / 24);
    playerGlow.tint = hero.id === 'knight' ? COLOR_ORBIT : COLOR_ACCENT;
  }

  /** Reflect unlocked/selected hero state on the start-screen buttons. */
  function refreshHeroes(): void {
    for (const hero of Object.values(HEROES)) {
      const btn = q<HTMLButtonElement>(`[data-gg-hero="${hero.id}"]`);
      if (!btn) continue;
      const unlocked = saved.unlockedHeroes.includes(hero.id);
      btn.disabled = !unlocked;
      btn.setAttribute('aria-pressed', saved.hero === hero.id ? 'true' : 'false');
      const existing = btn.querySelector('.gg-hero-lock');
      if (!unlocked && !existing) {
        const lock = document.createElement('span');
        lock.className = 'gg-hero-lock';
        lock.textContent = '🔒';
        btn.appendChild(lock);
      } else if (unlocked && existing) {
        existing.remove();
      }
    }
  }

  function startRun(): void {
    game.taken = {};
    game.levelQueue = [];
    game.accumulator = 0;
    game.shake = 0;
    game.flash = 0;
    game.zoom = 1;
    game.warn = 0;
    game.winPending = false;
    applyHero();
    game.world = buildWorld();
    game.running = true;
    game.paused = false;
    setOverlay(null);
  }

  /** Reached the win mark: record the win, unlock the Knight, show the screen. */
  function openWin(): void {
    saved.wins += 1;
    let unlockedNow = false;
    if (!saved.unlockedHeroes.includes('knight')) {
      saved.unlockedHeroes.push('knight');
      unlockedNow = true;
    }
    store.save(saved);
    refreshHeroes();
    const un = q('[data-gg-unlock]');
    if (un) {
      if (unlockedNow) {
        un.textContent = `${l10n.unlockHeading}: ${l10n.heroes.knight?.name ?? 'Knight'}`;
        show(un, true);
      } else {
        show(un, false);
      }
    }
    setOverlay('win');
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
      show(q('[data-gg-victory]'), r.won);
    }
    setOverlay('over');
  }

  // --- Level-up choices ---
  function openLevelup(): void {
    setOverlay('levelup');
    renderCards();
  }
  /** Resolve a card's display name, description, eyebrow tag, and CSS class. */
  function cardInfo(card: OfferCard): { name: string; desc: string; tag: string; cls: string } {
    if (card.kind === 'evolution') {
      const e = l10n.evolutions[card.ref] ?? { name: card.ref, desc: '' };
      return { name: e.name, desc: e.desc, tag: l10n.evolutionTag, cls: 'gg-card gg-card-evo' };
    }
    if (card.kind === 'newWeapon') {
      const wd = l10n.weapons[card.ref] ?? { name: card.ref, desc: '' };
      return {
        name: wd.name,
        desc: wd.desc,
        tag: l10n.newWeaponTag,
        cls: 'gg-card gg-card-weapon',
      };
    }
    if (card.kind === 'levelWeapon') {
      const wd = l10n.weapons[card.ref] ?? { name: card.ref, desc: '' };
      const owned = game.world?.player.weapons.find((w) => w.id === card.ref);
      const lv = owned ? owned.level : 1;
      const tag = l10n.levelTag.replace('{n}', String(lv)).replace('{m}', String(lv + 1));
      return { name: wd.name, desc: wd.desc, tag, cls: 'gg-card gg-card-weapon' };
    }
    const info = l10n.upgrades[card.ref] ?? { name: card.ref, desc: '' };
    return { name: info.name, desc: info.desc, tag: '', cls: 'gg-card' };
  }
  function renderCards(): void {
    if (!cardsBox || !game.world) return;
    const level = game.levelQueue[0] ?? game.world.player.level;
    const cards = offerChoices(game.world.seed, level, game.world.player, game.taken);
    cardsBox.replaceChildren();
    for (const card of cards) {
      const info = cardInfo(card);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = info.cls;
      if (info.tag) {
        const tag = document.createElement('span');
        tag.className = 'gg-card-tag';
        tag.textContent = info.tag;
        btn.appendChild(tag);
      }
      const name = document.createElement('span');
      name.className = 'gg-card-name';
      name.textContent = info.name;
      const desc = document.createElement('span');
      desc.className = 'gg-card-desc';
      desc.textContent = info.desc;
      btn.append(name, desc);
      btn.addEventListener('click', () => pickCard(card));
      cardsBox.appendChild(btn);
    }
  }
  function pickCard(card: OfferCard): void {
    if (!game.world) return;
    applyCard(game.world, game.taken, card);
    game.levelQueue.shift();
    if (game.levelQueue.length > 0) {
      renderCards();
    } else {
      game.accumulator = 0;
      setOverlay(null);
    }
  }

  function processEvents(): void {
    const w = game.world;
    if (!w) return;
    for (const ev of w.events) {
      if (ev.type === 'levelup') {
        game.levelQueue.push(ev.level);
        spawnParticle(w.player.x, w.player.y, 0, 0, 0.6, 30, 240, COLOR_ACCENT2, true);
        if (!reduced) game.zoom = 1.05;
      } else if (ev.type === 'kill') {
        if (ev.elite) {
          burst(ev.x, ev.y, 22, 360, COLOR_ACCENT, 26);
          spawnParticle(ev.x, ev.y, 0, 0, 0.5, 30, 220, COLOR_ACCENT, true);
          if (!reduced) {
            game.zoom = 1.06;
            game.shake = 14;
          }
        } else {
          burst(ev.x, ev.y, 6, 200, ev.color, 16);
        }
      } else if (ev.type === 'hit') {
        if (!reduced) {
          game.shake = 13;
          game.flash = 0.42;
          game.playerFlash = 0.22;
        }
      } else if (ev.type === 'pickup') {
        spawnParticle(ev.x, ev.y, rand(-30, 30), rand(-70, -30), 0.4, 12, 0, COLOR_ACCENT2, false);
      } else if (ev.type === 'shoot') {
        spawnParticle(
          ev.x + Math.cos(ev.angle) * 18,
          ev.y + Math.sin(ev.angle) * 18,
          Math.cos(ev.angle) * 60,
          Math.sin(ev.angle) * 60,
          0.18,
          16,
          0,
          COLOR_WIN,
          false,
        );
      } else if (ev.type === 'spawn') {
        if (ev.reaper) {
          game.warn = 4;
          if (!reduced) game.flash = 0.5;
          spawnParticle(ev.x, ev.y, 0, 0, 0.7, 40, 320, COLOR_LOSS, true);
        } else {
          spawnParticle(ev.x, ev.y, 0, 0, 0.5, 28, 150, COLOR_ACCENT, true);
        }
      } else if (ev.type === 'win') {
        game.winPending = true;
      }
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
    saved.casual = !saved.casual;
    standardBtn.setAttribute('aria-pressed', saved.casual ? 'true' : 'false');
    store.save(saved);
  });

  function setZoom(z: number): void {
    saved.userZoom = Math.min(1.6, Math.max(0.6, Math.round(z * 100) / 100));
    store.save(saved);
  }
  for (const hero of Object.values(HEROES)) {
    const btn = q<HTMLButtonElement>(`[data-gg-hero="${hero.id}"]`);
    btn?.addEventListener('click', () => {
      if (!saved.unlockedHeroes.includes(hero.id)) return;
      saved.hero = hero.id;
      store.save(saved);
      refreshHeroes();
      applyHero();
    });
  }
  q('[data-gg-zoomin]')?.addEventListener('click', () => setZoom(saved.userZoom + 0.15));
  q('[data-gg-zoomout]')?.addEventListener('click', () => setZoom(saved.userZoom - 0.15));
  q('[data-gg-fullscreen]')?.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stage.requestFullscreen().catch(() => {});
  });
  // Re-fit the renderer to the stage. resizeTo's ResizeObserver misses the
  // macOS fullscreen zoom animation (the canvas stays at the pre-fullscreen
  // size), so re-measure on fullscreenchange at several points to catch the
  // post-animation size, and on every window resize.
  const refit = (): void => {
    if (stage.clientWidth > 0 && stage.clientHeight > 0) {
      app.renderer.resize(stage.clientWidth, stage.clientHeight);
    }
  };
  document.addEventListener('fullscreenchange', () => {
    refit();
    for (const d of [60, 220, 500, 900]) window.setTimeout(refit, d);
  });
  window.addEventListener('resize', refit);
  q('[data-gg-continue]')?.addEventListener('click', () => {
    if (game.overlay !== 'win') return;
    game.accumulator = 0;
    setOverlay(null);
  });
  q('[data-gg-finish]')?.addEventListener('click', () => {
    if (game.overlay !== 'win') return;
    endRun();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) autoPause();
  });

  // --- Main loop: fixed-step accumulator decoupled from render ---
  app.ticker.add((ticker) => {
    // Safety net: keep the renderer matched to the stage on every frame, so a
    // missed resize (notably the macOS fullscreen zoom animation) self-corrects.
    // Only resizes when actually out of sync, so it costs nothing in steady
    // state; guarded against transient zero sizes during layout.
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    if (
      sw > 0 &&
      sh > 0 &&
      (Math.abs(app.screen.width - sw) > 2 || Math.abs(app.screen.height - sh) > 2)
    ) {
      app.renderer.resize(sw, sh);
    }
    game.dtSec = Math.min(ticker.deltaMS, 64) / 1000;
    game.t += game.dtSec;
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
          // Once every upgrade is maxed there is nothing to offer; level up
          // silently instead of opening an empty chooser.
          if (offerChoices(w.seed, game.levelQueue[0]!, w.player, game.taken).length > 0) {
            openLevelup();
            break;
          }
          game.levelQueue.length = 0;
        }
        if (game.winPending) {
          game.winPending = false;
          openWin();
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
    const dt = game.dtSec;
    const pxr = lerp(w.player.prevX, w.player.x, alpha);
    const pyr = lerp(w.player.prevY, w.player.y, alpha);

    // Camera: follow player, ease zoom-punch back to 1, decay shake.
    game.zoom += (1 - game.zoom) * Math.min(1, dt * 6);
    let camX = -pxr;
    let camY = -pyr;
    if (game.shake > 0.3) {
      camX += (Math.random() - 0.5) * game.shake;
      camY += (Math.random() - 0.5) * game.shake;
      game.shake *= 0.86;
    } else {
      game.shake = 0;
    }
    const sc = game.zoom * saved.userZoom;
    camera.scale.set(sc);
    camera.position.set(app.screen.width / 2 + camX * sc, app.screen.height / 2 + camY * sc);

    // Player: idle bob + hit flash.
    const bob = reduced ? 0 : Math.sin(game.t * 4) * 1.6;
    bishopSprite.position.set(0, bob);
    if (game.playerFlash > 0) {
      game.playerFlash -= dt;
      bishopSprite.tint = COLOR_LOSS;
    } else {
      bishopSprite.tint = 0xffffff;
    }
    playerGlow.alpha = reduced ? 0.5 : 0.5 + Math.sin(game.t * 3) * 0.12;
    playerNode.position.set(pxr, pyr);

    const ea = w.enemies.pool.active;
    for (let i = 0; i < ea.length; i += 1) {
      const s = enemySprites[i]!;
      if (ea[i] === 1) {
        const type = w.enemies.type[i]!;
        s.texture = archetypeTex[type]!;
        s.scale.set((w.enemies.radius[i]! * ENEMY_VIS) / PIECE_R);
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
        const sc = w.projectiles.radius[i]! / PROJ_REF;
        s.texture = projKindTex[w.projectiles.kind[i]!] ?? projTex;
        s.rotation = Math.atan2(w.projectiles.vy[i]!, w.projectiles.vx[i]!);
        s.scale.set(reduced ? sc : sc * 1.5, sc);
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
        const pulse = reduced ? 1 : 1 + Math.sin(game.t * 5 + i) * 0.12;
        s.scale.set(pulse);
        if (!reduced) s.rotation = game.t * 1.5;
        s.position.set(
          lerp(w.gems.prevX[i]!, w.gems.x[i]!, alpha),
          lerp(w.gems.prevY[i]!, w.gems.y[i]!, alpha),
        );
        s.visible = true;
      } else {
        s.visible = false;
      }
    }

    // Orbiting blades (Carousel weapon): count + radius from its level.
    let oc = 0;
    let orbR = ORBIT_RADIUS;
    const carousel = w.player.weapons.find((x) => WEAPONS[x.id]?.kind === 'orbital');
    if (carousel) {
      const aoe = resolveAoe(WEAPONS[carousel.id]!, carousel.level, w.player.mods);
      oc = Math.min(orbiterSprites.length, Math.max(1, Math.round(aoe.count)));
      orbR = aoe.radius;
    }
    for (let i = 0; i < orbiterSprites.length; i += 1) {
      const s = orbiterSprites[i]!;
      if (i < oc) {
        const a = game.t * ORBIT_ANGULAR + (i / oc) * Math.PI * 2;
        s.position.set(pxr + Math.cos(a) * orbR, pyr + Math.sin(a) * orbR);
        s.rotation = a;
        s.scale.set(reduced ? 1 : 1 + Math.sin(game.t * 8 + i) * 0.15);
        s.visible = true;
      } else {
        s.visible = false;
      }
    }

    // Aura field (Sanctum / Communion): a soft ring at its radius.
    const auraW = w.player.weapons.find((x) => WEAPONS[x.id]?.kind === 'aura');
    if (auraW) {
      const aoe = resolveAoe(WEAPONS[auraW.id]!, auraW.level, w.player.mods);
      auraSprite.position.set(pxr, pyr);
      auraSprite.scale.set((aoe.radius * 2) / 128);
      auraSprite.alpha = reduced ? 0.5 : 0.5 + Math.sin(game.t * 3) * 0.12;
      auraSprite.visible = true;
    } else {
      auraSprite.visible = false;
    }

    updateParticles(dt);

    // Screen overlays (sized to the viewport each frame).
    const W = app.screen.width;
    const H = app.screen.height;
    const diag = Math.hypot(W, H) * 1.05;
    vignette.position.set(W / 2, H / 2);
    vignette.width = diag;
    vignette.height = diag;
    if (game.flash > 0) game.flash -= dt;
    hitFlash.position.set(W / 2, H / 2);
    hitFlash.width = diag;
    hitFlash.height = diag;
    hitFlash.alpha = Math.max(0, game.flash);

    // Reaper telegraph banner.
    if (game.warn > 0) {
      game.warn -= dt;
      show(warnEl, true);
    } else {
      show(warnEl, false);
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
  if (standardBtn) standardBtn.setAttribute('aria-pressed', saved.casual ? 'true' : 'false');
  if (elDayNum) elDayNum.textContent = `#${dayNumber(nyDate())}`;
  if (elBest)
    elBest.textContent =
      saved.bestMs > 0 ? formatClock(Math.floor(saved.bestMs / 1000)) : (elBest.textContent ?? '');
  renderShop();
  refreshHeroes();
  applyHero();
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
