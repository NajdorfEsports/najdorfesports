/**
 * Lazy CJK font loader for the zh locales. The Noto subsets are real
 * branding but never render-critical: the system stacks declared in
 * global.css are metrics-matched, so first paint is always correct and
 * shift-free. Injecting the generated @font-face sheet post-idle keeps
 * ~290KB of font bytes out of the LCP window on slow connections; the
 * faces use font-display: swap, so a warm cache repaints instantly and a
 * cold one upgrades the page mid-session without layout shift. English
 * pages skip the fetch entirely. (No-JS zh visitors keep the system
 * faces, the same graceful degradation as the rest of the doctrine.)
 */
if (document.documentElement.lang.startsWith('zh')) {
  const load = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/fonts-cjk.css';
    document.head.appendChild(link);
  };
  if ('requestIdleCallback' in window) {
    // The timeout caps how long a busy main thread can defer the brand
    // upgrade; two seconds keeps it predictable without touching LCP.
    requestIdleCallback(load, { timeout: 2000 });
  } else {
    setTimeout(load, 1);
  }
}

export {};
