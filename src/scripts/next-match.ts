/**
 * "Next Match" countdown tick. Processed module (CSP: script-src has no
 * 'unsafe-inline', so the card's logic cannot live in an inline <script>).
 * Runs once per full page load; the interval dies with the document on
 * cross-document navigation.
 *
 * The SERVER (NextMatchCountdown.astro) already renders the date line, both
 * timezone clocks, and a build-time snapshot of the four digits, so the card
 * is fully meaningful with JS off. This driver only keeps the digits live and
 * speeds the glow pulse as kickoff approaches; it never injects content.
 */
function init(): void {
  const root = document.querySelector<HTMLElement>('[data-nm-countdown]');
  if (!root) return;

  const target = new Date(root.getAttribute('data-nm-target') ?? '').getTime();
  // Bail on an unparseable date so the loop never spins on NaN (mirrors the
  // guard in LiveHero.astro and the old countdown).
  if (Number.isNaN(target)) return;

  const slot = (key: string): HTMLElement | null =>
    root.querySelector<HTMLElement>(`[data-nm="${key}"]`);
  const days = slot('days');
  const hours = slot('hours');
  const mins = slot('mins');
  const secs = slot('secs');

  const pad = (n: number): string => String(Math.max(0, n)).padStart(2, '0');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  // Update a digit and flip it only when its value actually changed, so the
  // card feels alive without animating every tick when nothing moves. No flip
  // under reduced motion (the value still updates).
  const setDigit = (el: HTMLElement | null, val: string): void => {
    if (!el || el.textContent === val) return;
    el.textContent = val;
    if (reduced) return;
    el.classList.remove('is-flip');
    void el.offsetWidth; // reflow so the animation restarts on every change
    el.classList.add('is-flip');
  };

  const stop = (): void => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const tick = (): void => {
    const diff = Math.max(0, target - Date.now());
    const sec = Math.floor(diff / 1000);

    setDigit(days, pad(Math.floor(sec / 86400)));
    setDigit(hours, pad(Math.floor((sec % 86400) / 3600)));
    setDigit(mins, pad(Math.floor((sec % 3600) / 60)));
    setDigit(secs, pad(sec % 60));

    // Pulse intensifies near zero: 2.4s far out -> ~0.4s in the final minute.
    let pulse = 2.4;
    if (sec < 3600) pulse = 0.7 + (sec / 3600) * 1.7;
    if (sec < 60) pulse = 0.4 + (sec / 60) * 0.5;
    root.style.setProperty('--nm-pulse', pulse.toFixed(2) + 's');

    // Reached kickoff: clamp at 00:00:00:00 and stop. A future LIVE state
    // would swap in here.
    if (diff === 0) stop();
  };

  tick();
  intervalId = setInterval(tick, 1000);
}

init();

export {};
