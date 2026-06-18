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
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stop = (): void => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const tick = (): void => {
    const diff = Math.max(0, target - Date.now());
    const sec = Math.floor(diff / 1000);

    if (days) days.textContent = pad(Math.floor(sec / 86400));
    if (hours) hours.textContent = pad(Math.floor((sec % 86400) / 3600));
    if (mins) mins.textContent = pad(Math.floor((sec % 3600) / 60));
    if (secs) secs.textContent = pad(sec % 60);

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
