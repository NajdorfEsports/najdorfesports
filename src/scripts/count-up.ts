/**
 * Count-up enhancement. Opt in with `data-count-up` + `data-target`.
 * The SERVER renders the final value as the element's text, so the right
 * number shows on first paint, with no JS, and on slow JS. This driver
 * only ENHANCES from there, it never shows a "0" state:
 *   - prefers-reduced-motion / no IntersectionObserver: keep the final
 *     value in place (snap), never animate.
 *   - elements already on screen at load (the hero / roster stat boxes):
 *     keep the final value. Counting them up from 0 now would flash the
 *     real number down to "0" first, which is the broken-looking state.
 *   - off-screen elements: count up 0 to target when scrolled into view.
 */
const DURATION_MS = 700;
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

function finalText(el: HTMLElement): string {
  const target = parseInt(el.getAttribute('data-target') || '0', 10);
  const prefix = el.dataset.countPrefix || '';
  const suffix = el.dataset.countSuffix || '';
  return prefix + (isNaN(target) ? 0 : target) + suffix;
}

// Lock in the server-rendered final value, no animation.
function snap(el: HTMLElement): void {
  el.textContent = finalText(el);
  el.dataset.countDone = '1';
}

function animate(el: HTMLElement, target: number): void {
  if (el.dataset.countDone === '1') return;
  el.dataset.countDone = '1';
  const start = performance.now();
  // Preserve any prefix/suffix the author wants kept after the digits
  // (e.g. "+", "%"). Read once at start so we don't re-parse mid-anim.
  const prefix = el.dataset.countPrefix || '';
  const suffix = el.dataset.countSuffix || '';

  function frame(now: number): void {
    const t = Math.min(1, (now - start) / DURATION_MS);
    const v = Math.round(easeOutCubic(t) * target);
    el.textContent = prefix + v + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function inViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
}

function init(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll<HTMLElement>('[data-count-up]:not([data-count-done="1"])');
  if (els.length === 0) return;

  if (reduced || !('IntersectionObserver' in window)) {
    for (const el of els) snap(el);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          animate(el, isNaN(target) ? 0 : target);
          io.unobserve(el);
        }
      }
    },
    { threshold: 0.4 },
  );

  for (const el of els) {
    // Already visible at load: keep the final value (no 0 flash). Only
    // count up the stats a visitor actually scrolls down to.
    if (inViewport(el)) snap(el);
    else io.observe(el);
  }
}

init();

export {};
