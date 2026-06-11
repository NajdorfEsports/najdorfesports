import { test, expect } from '@playwright/test';
import { openNavIfMobile } from './helpers';

/** Header navigation reaches every primary page and lands on a visible h1. */
const PAGES = [
  { path: '/roster/', match: /\/roster\/$/ },
  { path: '/matches/', match: /\/matches\/$/ },
  { path: '/news/', match: /\/news\/$/ },
  { path: '/coaching/', match: /\/coaching\/$/ },
  { path: '/about/', match: /\/about\/$/ },
];

test.describe('primary navigation', () => {
  for (const { path, match } of PAGES) {
    test(`header nav reaches ${path}`, async ({ page }) => {
      await page.goto('/');
      await openNavIfMobile(page);
      await page.locator(`header nav a[href="${path}"]:visible`).first().click();
      await page.waitForURL(match);
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }

  test('wordmark links back home', async ({ page }) => {
    await page.goto('/about/');
    await page.locator('header a[aria-label="Najdorf Esports home"]').click();
    await page.waitForURL(/\/$/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('footer carries the Liquipedia attribution', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer a[href*="liquipedia.net"]').first()).toBeAttached();
  });
});
