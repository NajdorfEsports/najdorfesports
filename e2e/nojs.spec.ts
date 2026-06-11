import { test, expect } from '@playwright/test';

/**
 * The site must render 100% of its content with JavaScript disabled.
 * The reveal-on-scroll hidden state is gated on @media (scripting:
 * enabled) plus a 3s failsafe, so opacity must settle at 1 on every
 * section. Playwright's toBeVisible() treats opacity:0 elements as
 * visible, so these assert computed opacity explicitly.
 */
test.use({ javaScriptEnabled: false });

const PAGES = ['/', '/roster/', '/matches/'];

test.describe('no-JS rendering', () => {
  for (const path of PAGES) {
    test(`all reveal sections are visible on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main h1').first()).toBeVisible();
      const reveals = page.locator('.reveal');
      const count = await reveals.count();
      for (let i = 0; i < count; i += 1) {
        // 3s failsafe is the worst case in browsers that misreport the
        // scripting media feature; give it headroom.
        await expect(reveals.nth(i)).toHaveCSS('opacity', '1', { timeout: 6_000 });
      }
    });
  }

  test('roster cards and match cards carry content without JS', async ({ page }) => {
    await page.goto('/roster/');
    expect(await page.locator('main h3').count()).toBeGreaterThan(0);
    await page.goto('/matches/');
    expect(await page.locator('article').count()).toBeGreaterThan(0);
  });

  test('mobile nav is reachable without JS', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile header only');
    await page.goto('/');
    await expect(page.locator('#mobile-nav a[href="/roster/"]')).toBeVisible();
  });
});
