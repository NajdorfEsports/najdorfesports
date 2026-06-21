/**
 * Najdorf flowing hero: canvas motes + observers (vanilla, dependency-free).
 *
 * Processed module (CSP: script-src has no 'unsafe-inline'), so it bundles to
 * /_astro and is loaded by HeroFlow.astro's component <script>. The ribbons and
 * gradient field are pure CSS; this only adds the soft drifting light motes and
 * pauses the loop while the hero is scrolled out of view.
 *
 * Adapted verbatim in behaviour, colours, and timing from the approved
 * `Najdorf_Hero_Flow.html` reference (its `jsSource()` block), with TypeScript
 * types and multi-frame + after-first-paint init added for the site.
 *
 * Doctrine:
 *  - The hero copy is ordinary DOM that paints instantly; init is deferred to
 *    after first paint so the animation never blocks or delays the LCP text.
 *  - Under prefers-reduced-motion the canvas paints ONE composed still and no
 *    requestAnimationFrame loop ever starts.
 *  - There is no pointer/cursor reaction of any kind.
 */

interface Mote {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  a: number;
  amax: number;
  life: number;
  max: number;
  blue: boolean;
}

function initFlow(frame: HTMLElement): void {
  if (frame.dataset.flowInit === '1') return;
  const canvas = frame.querySelector<HTMLCanvasElement>('canvas.motes');
  // Minimal variant has no canvas; nothing to drive.
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  frame.dataset.flowInit = '1';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let parts: Mote[] = [];
  let raf = 0;
  let visible = true;

  function size(): void {
    const r = canvas!.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas!.width = W * dpr;
    canvas!.height = H * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) drawStill();
  }
  function target(): number {
    const base = (W * H) / 26000;
    return Math.max(5, Math.min(46, Math.round(base * (W < 380 ? 0.5 : 1))));
  }
  function spawn(seed: boolean): Mote {
    return {
      x: Math.random() * W,
      y: seed ? Math.random() * H : H + 8,
      vy: -(0.06 + Math.random() * 0.16),
      vx: (Math.random() - 0.5) * 0.07,
      r: 0.5 + Math.random() * 1.4,
      a: 0,
      amax: 0.18 + Math.random() * 0.4,
      life: 0,
      max: 400 + Math.random() * 420,
      blue: Math.random() < 0.6,
    };
  }
  function draw(p: Mote): void {
    ctx!.beginPath();
    ctx!.arc(p.x, p.y, p.r, 0, 6.2832);
    ctx!.fillStyle = p.blue ? `rgba(107,141,255,${p.a})` : `rgba(190,212,255,${p.a})`;
    ctx!.shadowColor = 'rgba(33,91,255,.8)';
    ctx!.shadowBlur = 6;
    ctx!.fill();
    ctx!.shadowBlur = 0;
  }
  function drawStill(): void {
    ctx!.clearRect(0, 0, W, H);
    const n = Math.round(target() * 0.8);
    for (let i = 0; i < n; i++) {
      const p = spawn(true);
      p.a = p.amax * (0.5 + Math.random() * 0.5);
      draw(p);
    }
  }
  function step(): void {
    ctx!.clearRect(0, 0, W, H);
    const t = target();
    while (parts.length < t) parts.push(spawn(parts.length < t / 2));
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      const u = p.life / p.max;
      p.a = u < 0.12 ? (u / 0.12) * p.amax : p.amax * (1 - (u - 0.12) / 0.88);
      if (p.life >= p.max || p.y < -8 || p.a <= 0) {
        parts.splice(i, 1);
        continue;
      }
      draw(p);
    }
  }
  function loop(): void {
    raf = requestAnimationFrame(loop);
    step();
  }
  function start(): void {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  size();
  window.addEventListener('resize', size);
  if (reduce) {
    drawStill();
    return; // composed still, no motion
  }
  start();

  // Pause the mote loop while the hero is scrolled out of view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          visible = e.isIntersecting;
        });
        if (visible) start();
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 },
    ).observe(frame);
  }
}

export function initHeroFlow(): void {
  const boot = (): void => {
    document.querySelectorAll<HTMLElement>('.flow-frame').forEach(initFlow);
  };
  // Defer past first paint so the wordmark and hero copy are never blocked or
  // delayed by canvas setup.
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => requestAnimationFrame(() => requestAnimationFrame(boot)),
      { once: true },
    );
  } else {
    requestAnimationFrame(() => requestAnimationFrame(boot));
  }
}
