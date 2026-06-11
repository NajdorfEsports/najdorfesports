/**
 * Coaching page client behaviors, loaded as a processed module only on
 * pages that render CoachingPageBody (CSP: no inline JS).
 *
 * Cal.com popup embed loader (vanilla, no React island), LAZY by doctrine:
 * the site ships zero third-party scripts at page load, so embed.js is
 * fetched from app.cal.com only on the first hover/focus/touch/click of a
 * Book control (the stub queues every Cal() call until then). Keep the
 * origin and brand color in sync with CAL_ORIGIN / CAL_BRAND_COLOR in
 * src/data/coaching.ts and --color-accent in src/styles/global.css. The
 * booker is forced to dark. Each Book control is also a real anchor to the
 * Cal.com page, so booking still works if embed.js is blocked or JS is off.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type CalStub = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, unknown>;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalStub;
    __najdorfCalArmed?: boolean;
    __najdorfCalReady?: boolean;
    __najdorfCalReplay?: boolean;
  }
}

// Official Cal embed stub, queues calls until embed.js arrives.
(function (C: Window, A: string, L: string) {
  const p = function (a: any, ar: unknown) {
    a.q.push(ar);
  };
  const d = C.document;
  C.Cal =
    C.Cal ||
    (function (this: unknown) {
      const cal = C.Cal as any;
      // eslint-disable-next-line prefer-rest-params
      const ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement('script')).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api: any = function () {
          // eslint-disable-next-line prefer-rest-params
          p(api, arguments);
        };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ['initNamespace', namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    } as CalStub);
})(window, 'https://app.cal.com/embed/embed.js', 'init');

// Load embed.js and apply the dark UI config on first booking intent.
// Idempotent; everything before the script arrives is queued by the stub.
// Marks __najdorfCalReady once Cal has registered its custom elements (and
// therefore its own data-cal-link click handler), so the first-click race
// handler below can stand down.
function calArm(): void {
  if (window.__najdorfCalArmed || typeof window.Cal !== 'function') return;
  window.__najdorfCalArmed = true;
  window.Cal('init', { origin: 'https://app.cal.com' });
  window.Cal('ui', {
    cssVarsPerTheme: { light: { 'cal-brand': '#215BFF' }, dark: { 'cal-brand': '#215BFF' } },
    hideEventTypeDetails: false,
    theme: 'dark',
    layout: 'month_view',
  });
  if (window.customElements && window.customElements.whenDefined) {
    window.customElements.whenDefined('cal-modal-box').then(function () {
      window.__najdorfCalReady = true;
    });
  }
}

// Coach browser filters + per-coach payment selector. All client-side, no
// cookies, nothing persisted. Visibility uses inline display so Tailwind's
// display utilities cannot override it.
function showMethod(section: Element, method: string | null): void {
  section.querySelectorAll('[data-method-btn]').forEach(function (b) {
    b.setAttribute('aria-pressed', b.getAttribute('data-method-btn') === method ? 'true' : 'false');
  });
  section.querySelectorAll<HTMLElement>('.book-control').forEach(function (el) {
    el.style.display = el.getAttribute('data-method') === method ? '' : 'none';
  });
}

function filterVal(id: string): string {
  const el = document.getElementById(id) as HTMLSelectElement | null;
  return el ? el.value : '';
}

function applyFilters(): void {
  const role = filterVal('filter-role');
  const lang = filterVal('filter-language');
  const hero = filterVal('filter-hero');
  let visible = 0;
  document.querySelectorAll<HTMLElement>('[data-coach-card]').forEach(function (card) {
    const slug = card.getAttribute('data-coach-card');
    const okRole = !role || card.getAttribute('data-role') === role;
    const okLang = !lang || (card.getAttribute('data-langs') || '').split(',').indexOf(lang) !== -1;
    const okHero =
      !hero || (card.getAttribute('data-heroes') || '').split(',').indexOf(hero) !== -1;
    const show = okRole && okLang && okHero;
    card.hidden = !show;
    const booking = document.querySelector<HTMLElement>('[data-booking="' + slug + '"]');
    if (booking) booking.hidden = !show;
    if (show) visible++;
  });
  const empty = document.querySelector<HTMLElement>('[data-no-match]');
  if (empty) empty.hidden = visible !== 0;
}

function setup(): void {
  // Note: the Cal embed is NOT armed here (lazy by doctrine); only the filter
  // and payment UI is initialized on load.
  document.querySelectorAll('[data-booking]').forEach(function (section) {
    const pressed =
      section.querySelector('[data-method-btn][aria-pressed="true"]') ||
      section.querySelector('[data-method-btn]');
    if (pressed) showMethod(section, pressed.getAttribute('data-method-btn'));
  });
  applyFilters();
}

// Lazy-load the Cal embed on first booking intent (hover/focus/touch of a
// Book control), so the popup is usually ready before the click lands.
(['pointerover', 'focusin', 'touchstart'] as const).forEach(function (evt) {
  document.addEventListener(
    evt,
    function (e) {
      if (e.target instanceof Element && e.target.closest('[data-cal-link]')) calArm();
    },
    { passive: true },
  );
});

// First-click race: a Book anchor clicked before embed.js has bound its own
// data-cal-link handler. Prevent the fallback navigation, arm the embed, and
// replay the click once it is live so it opens the popup. If the embed never
// registers (blocked or offline), fall back to opening the real Cal.com link.
document.addEventListener('click', function (e) {
  const btn =
    e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[data-cal-link]') : null;
  if (!btn || window.__najdorfCalReady || window.__najdorfCalReplay) return;
  e.preventDefault();
  window.__najdorfCalReplay = true;
  calArm();
  const href = btn.getAttribute('href');
  let done = false;
  const finish = function (replay: boolean) {
    if (done) return;
    done = true;
    window.__najdorfCalReplay = false;
    if (replay) btn.click();
    else if (href) window.open(href, '_blank', 'noopener');
  };
  if (window.customElements && window.customElements.whenDefined) {
    window.customElements.whenDefined('cal-modal-box').then(function () {
      finish(true);
    });
  }
  // Fallback if the embed never registers in time.
  setTimeout(function () {
    finish(false);
  }, 2500);
});

document.addEventListener('click', function (e) {
  const methodBtn = e.target instanceof Element ? e.target.closest('[data-method-btn]') : null;
  if (methodBtn) {
    const ms = methodBtn.closest('[data-booking]');
    if (ms) showMethod(ms, methodBtn.getAttribute('data-method-btn'));
  }
});

document.addEventListener('change', function (e) {
  if (e.target instanceof Element && e.target.closest('#coach-filters')) applyFilters();
});

// Smooth-scroll in-page anchors (hero CTA, "View sessions"), honoring
// reduced-motion. Acts only when the target exists on the page.
document.addEventListener('click', function (e) {
  const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
  if (!a) return;
  const id = (a.getAttribute('href') || '').slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (history.replaceState) history.replaceState(null, '', '#' + id);
});

setup();

export {};
