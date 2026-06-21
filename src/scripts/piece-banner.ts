/**
 * Draw-on for the news-banner chess pieces (PieceBanner.astro). Each piece is
 * a single closed outline; we measure its length with getTotalLength(), hand
 * it to the CSS as `--draw-len`, then let a looping keyframe stroke it on over
 * ~1.4s and restart every 3s (see PieceBanner.astro). The loop only runs while
 * the banner is in view: we toggle `is-drawing` from an IntersectionObserver.
 *
 * The hidden initial state and the no-JS / reduced-motion fallbacks live in
 * the component's CSS behind `@media (scripting: enabled)` and
 * `@media (prefers-reduced-motion: reduce)`, matching the reveal doctrine:
 * with scripting off, or under reduced motion, the outline is simply shown
 * complete. This module only measures the path and gates the animation.
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

    // Measure each path once and publish its length to the CSS. The keyframe
    // draws from `--draw-len` to 0, so this is what makes the loop length-exact
    // rather than relying on the 9999 fallback.
    for (const svg of banners) {
      const path = svg.querySelector<SVGPathElement>('.piece-banner__path');
      if (path) svg.style.setProperty('--draw-len', String(path.getTotalLength()));
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Run the loop only while the banner is on screen; toggling the class
          // off when it leaves pauses the animation and restarts it fresh on
          // the next entry.
          (entry.target as SVGSVGElement).classList.toggle('is-drawing', entry.isIntersecting);
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
