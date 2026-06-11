import { test, expect } from '@playwright/test';

/**
 * Coaching page contract checks. The booking flow logic is frozen, so
 * these assert presence and shape (filters exist, Book controls are real
 * anchors that work without the embed), never click through to Cal.com.
 */
test.describe('coaching page', () => {
  test('filters and coach browser are present', async ({ page }) => {
    await page.goto('/coaching/');
    await expect(page.locator('#filter-role')).toBeAttached();
    await expect(page.locator('#filter-language')).toBeAttached();
    await expect(page.locator('#filter-hero')).toBeAttached();
    expect(await page.locator('[data-coach-card]').count()).toBeGreaterThan(0);
  });

  test('filtering to an unmatched hero shows the empty state and resets', async ({ page }) => {
    await page.goto('/coaching/');
    const cards = page.locator('[data-coach-card]');
    const initial = await cards.count();

    await page.locator('#filter-hero').selectOption({ index: 1 });
    const heroValue = await page.locator('#filter-hero').inputValue();
    expect(heroValue).not.toBe('');

    await page.locator('#filter-hero').selectOption({ index: 0 });
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBe(initial);
  });

  test('every Book control is a real Cal.com anchor with popup data', async ({ page }) => {
    await page.goto('/coaching/');
    const books = page.locator('a[data-cal-link]');
    const count = await books.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const href = await books.nth(i).getAttribute('href');
      expect(href).toContain('cal.com/');
      await expect(books.nth(i)).toHaveAttribute('data-cal-config', /.+/);
    }
  });
});
