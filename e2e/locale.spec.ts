import { test, expect } from '@playwright/test';
import { openNavIfMobile, localeLink } from './helpers';

/** The language switcher round-trips and the html lang attribute follows. */
const ROUNDTRIP_PAGES = ['/', '/roster/', '/matches/'];

test.describe('locale switcher', () => {
  for (const path of ROUNDTRIP_PAGES) {
    test(`round-trips en, zh-TW, zh-CN on ${path}`, async ({ page }) => {
      await page.goto(path);

      await openNavIfMobile(page);
      await localeLink(page, '繁中').click();
      await page.waitForURL(/\/zh-TW\//);
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');

      await openNavIfMobile(page);
      await localeLink(page, '简中').click();
      await page.waitForURL(/\/zh-CN\//);
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');

      await openNavIfMobile(page);
      await localeLink(page, 'EN').click();
      await page.waitForURL((url) => !url.pathname.startsWith('/zh-'));
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      expect(new URL(page.url()).pathname).toBe(path);
    });
  }

  test('news article switches into its translation', async ({ page }) => {
    await page.goto('/news/');
    const article = page.locator('main a[href^="/news/"]:visible').first();
    await article.click();
    await page.waitForURL(/\/news\/[^/]+\/$/);

    await openNavIfMobile(page);
    await localeLink(page, '繁中').click();
    await page.waitForURL(/\/zh-TW\/news\//);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('hreflang alternates are emitted for localized pages', async ({ page }) => {
    await page.goto('/roster/');
    await expect(page.locator('link[rel="alternate"][hreflang="zh-TW"]')).toBeAttached();
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toBeAttached();
  });
});
