/**
 * Mobile burger menu. Event delegation on the document rather than a
 * listener on the button: binds once per page load and keeps working
 * whatever happens to the header element. The no-JS case is covered in
 * CSS (the panel renders expanded under `@media (scripting: none)`).
 */
document.addEventListener('click', (e) => {
  const btn = e.target instanceof Element ? e.target.closest('[data-mobile-toggle]') : null;
  if (!btn) return;
  const panel = document.getElementById('mobile-nav');
  if (!panel) return;
  const open = panel.classList.toggle('hidden') === false;
  btn.setAttribute('aria-expanded', String(open));
});

export {};
