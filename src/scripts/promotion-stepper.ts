/**
 * Chess-promotion stepper (coaching hero). Processed module (CSP: no inline
 * scripts). Progressive enhancement: with scripting off the stage already shows
 * the full pawn -> king ladder (see PromotionStepper.astro CSS), so this only
 * wires the single-piece stepped view and the prev/next controls. The crossfade
 * is CSS (~360ms, instant under reduced motion); this just toggles .is-active.
 */
function init(): void {
  const root = document.querySelector<HTMLElement>('[data-promo]');
  if (!root) return;

  const pieces = Array.from(root.querySelectorAll<HTMLElement>('[data-promo-piece]'));
  const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-promo-dot]'));
  const nameEl = root.querySelector<HTMLElement>('[data-promo-name]');
  const prev = root.querySelector<HTMLButtonElement>('[data-promo-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-promo-next]');
  if (pieces.length === 0) return;

  let idx = 0;
  const apply = (): void => {
    pieces.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    const label = pieces[idx]?.getAttribute('data-promo-label');
    if (nameEl && label) nameEl.textContent = label;
  };
  const go = (delta: number): void => {
    idx = (idx + delta + pieces.length) % pieces.length;
    apply();
  };

  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));
  apply();
}

init();

export {};
