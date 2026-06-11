import type { Page } from '@playwright/test';

/**
 * Shared spec helpers. House rule for this suite: matches.json and the
 * roster are rewritten weekly by the Liquipedia action, so specs assert
 * STRUCTURE and visibility, never opponents, counts, or W-L values.
 */

/**
 * Open the burger menu when the viewport renders the mobile header.
 * The panel may already be open (it persists across client-side
 * navigations), in which case clicking the toggle would close it.
 */
export async function openNavIfMobile(page: Page): Promise<void> {
  const toggle = page.locator('[data-mobile-toggle]');
  if (!(await toggle.isVisible())) return;
  if (await page.locator('#mobile-nav').isVisible()) return;
  await toggle.click();
}

/** The currently visible language-switcher link for a locale label. */
export function localeLink(page: Page, label: 'EN' | '繁中' | '简中') {
  return page.locator('nav[aria-label="Language"] a:visible').filter({ hasText: label }).first();
}

/** Collect console errors for the lifetime of the page. */
export function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    errors.push(String(err));
  });
  return errors;
}
