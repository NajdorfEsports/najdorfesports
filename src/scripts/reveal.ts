/**
 * Reveal-on-scroll. Adds `.is-visible` to `.reveal` elements as they enter
 * the viewport. The hidden initial state lives in CSS behind
 * `@media (scripting: enabled)` with a 3s failsafe, so content is never
 * stranded invisible if this module loads late, is blocked, or crashes.
 * Runs once per full page load (the site uses native cross-document
 * navigation, so every page starts fresh).
 */
function init(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (els.length === 0) return;
  if (reduced || !('IntersectionObserver' in window)) {
    for (const el of els) el.classList.add('is-visible');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
  );
  for (const el of els) io.observe(el);
}

init();

export {};
