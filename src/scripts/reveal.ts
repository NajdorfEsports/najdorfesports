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
  // Section-header hairline rules draw in (scaleX) on the same trigger; the
  // collapsed initial state + 3s failsafe live in global.css behind
  // `@media (scripting: enabled)`, so no-JS visitors always see the full rule.
  const rules = document.querySelectorAll('.section-header__rule:not(.is-drawn)');
  if (els.length === 0 && rules.length === 0) return;
  if (reduced || !('IntersectionObserver' in window)) {
    for (const el of els) el.classList.add('is-visible');
    for (const el of rules) el.classList.add('is-drawn');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.classList.add(
            el.classList.contains('section-header__rule') ? 'is-drawn' : 'is-visible',
          );
          io.unobserve(el);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
  );
  for (const el of els) io.observe(el);
  for (const el of rules) io.observe(el);
}

init();

export {};
