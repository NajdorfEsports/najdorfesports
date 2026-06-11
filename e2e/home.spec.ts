import { test, expect } from '@playwright/test';

/**
 * Home page structure. Match data refreshes weekly and match day swaps
 * the hero into live mode, so these assert structure, not values: the
 * match center may legitimately show a countdown, the live hero, or
 * neither (post-season with no fixtures).
 */
test.describe('home page', () => {
  test('ticker and hero render', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[aria-label="Match ticker"]')).toBeVisible();
    await expect(page.locator('main h1').first()).toBeVisible();
  });

  test('countdown, when present, shows numeric slots', async ({ page }) => {
    await page.goto('/');
    const countdown = page.locator('[data-countdown]');
    if ((await countdown.count()) === 0) {
      test.info().annotations.push({ type: 'note', description: 'no upcoming fixture today' });
      return;
    }
    const liveHeroVisible = await page.locator('[data-hero-live]').isVisible();
    if (liveHeroVisible) return; // live mode replaces the countdown surface
    await expect(countdown).toBeVisible();
    const firstSlot = countdown.locator('[data-slot]').first();
    await expect(firstSlot).toHaveText(/^\d+$/);
  });

  test('scrolled sections become visible', async ({ page }) => {
    await page.goto('/');
    const last = page.locator('.reveal').last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveClass(/is-visible/);
    await expect(last).toHaveCSS('opacity', '1');
  });
});
