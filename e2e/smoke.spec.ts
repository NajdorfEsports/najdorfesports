import { test, expect } from '@playwright/test';
import { trackConsoleErrors } from './helpers';

/** One smoke per locale: title, h1, footer, and a clean console. */
const LOCALES = [
  { path: '/', lang: 'en' },
  { path: '/zh-TW/', lang: 'zh-Hant' },
  { path: '/zh-CN/', lang: 'zh-Hans' },
];

test.describe('locale smoke', () => {
  for (const { path, lang } of LOCALES) {
    test(`${path} renders cleanly`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page).toHaveTitle(/Najdorf Esports/);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('404 page responds with status 404 and renders', async ({ page }) => {
    const response = await page.goto('/definitely-not-a-page/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
