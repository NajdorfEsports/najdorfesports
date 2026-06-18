/**
 * Home hero ambient motion. Processed module (CSP: script-src has no
 * 'unsafe-inline'), loaded only by the home page via HomePageBody's <script>.
 *
 * One purely decorative enhancement layered behind the wordmark: a sparse
 * particle field (transform/opacity only), paused while the hero is off-screen
 * to spare the CPU.
 *
 * It is a no-op under prefers-reduced-motion, and the hero is fully
 * meaningful without this module: no content is injected, only ambient nodes.
 * Styles live in global.css (.hero-* ) because the particle spans are created
 * here at runtime and Astro's component-scoped styles never reach them.
 */
function init(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero-default]');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Drifting particle field.
  const field = hero.querySelector<HTMLElement>('[data-hero-particles]');
  if (field && field.childElementCount === 0) {
    const COUNT = 26;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'hero-pt';
      const size = (2 + Math.random() * 2.5).toFixed(1);
      const dur = 7 + Math.random() * 9;
      p.style.left = (Math.random() * 100).toFixed(2) + '%';
      p.style.top = (Math.random() * 100).toFixed(2) + '%';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.animationDuration = dur.toFixed(2) + 's';
      // Negative delay so the field starts mid-cycle, not all at once.
      p.style.animationDelay = (-Math.random() * dur).toFixed(2) + 's';
      frag.appendChild(p);
    }
    field.appendChild(frag);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const state = e.isIntersecting ? 'running' : 'paused';
            for (const pt of Array.from(field.children) as HTMLElement[]) {
              pt.style.animationPlayState = state;
            }
          }
        },
        { threshold: 0 },
      );
      io.observe(hero);
    }
  }
}

init();

export {};
