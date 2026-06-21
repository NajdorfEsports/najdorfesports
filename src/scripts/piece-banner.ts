/**
 * Draw-on for the news-banner chess pieces (PieceBanner.astro). Each piece is
 * a single closed outline; the first time its banner scrolls into view we draw
 * the stroke on by transitioning `stroke-dashoffset` from the path's full
 * length to 0 over ~1.4s, then stop observing (draw once).
 *
 * The hidden initial state and the no-JS / reduced-motion fallbacks live in
 * the component's CSS behind `@media (scripting: enabled)` and
 * `@media (prefers-reduced-motion: reduce)`, matching the reveal doctrine:
 * with scripting off, or under reduced motion, the outline is simply shown
 * complete. This module only handles the animated path.
 */
let initialized = false;

export function initPieceBanners(): void {
  // Component `<script>`s are bundled once, but guard anyway so repeated
  // imports never double-bind the same banners.
  if (initialized) return;
  initialized = true;

  const run = (): void => {
    const banners = document.querySelectorAll<SVGSVGElement>('[data-piece-banner]');
    if (banners.length === 0) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      // CSS already shows the completed outline under reduced motion; with no
      // IntersectionObserver, clear the hidden start so the piece is visible.
      for (const svg of banners) {
        const path = svg.querySelector<SVGPathElement>('.piece-banner__path');
        if (path) {
          path.style.strokeDasharray = 'none';
          path.style.strokeDashoffset = '0';
        }
      }
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const svg = entry.target as SVGSVGElement;
          const path = svg.querySelector<SVGPathElement>('.piece-banner__path');
          if (path) {
            const len = path.getTotalLength();
            path.style.strokeDasharray = String(len);
            path.style.strokeDashoffset = String(len);
            // Force the browser to register the retracted state before the
            // transition target lands, so the draw-on always plays.
            void path.getBoundingClientRect();
            path.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
            path.style.strokeDashoffset = '0';
          }
          io.unobserve(svg);
        }
      },
      { threshold: 0.3 },
    );

    for (const svg of banners) io.observe(svg);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
