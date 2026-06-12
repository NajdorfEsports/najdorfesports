import { test, expect } from '@playwright/test';
import { trackConsoleErrors } from './helpers';

/**
 * /games/ hub + daily crossword. House rule applies: STRUCTURE and
 * visibility only. Never assert a specific answer, clue text, grid size,
 * or word count; the committed puzzle set rotates daily and is rebuilt
 * periodically, and a regeneration must never break this suite.
 */

const LOCALES = ['', '/zh-TW', '/zh-CN'];

test.describe('games hub', () => {
  for (const prefix of LOCALES) {
    test(`${prefix || '/'}games/ lists the crossword`, async ({ page }) => {
      await page.goto(`${prefix}/games/`);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator(`main a[href="${prefix}/games/crossword/"]`).first()).toBeVisible();
    });
  }
});

test.describe('daily crossword', () => {
  for (const prefix of LOCALES) {
    test(`${prefix || '/'}games/crossword/ renders a playable board`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await page.goto(`${prefix}/games/crossword/`);
      await expect(page.locator('main h1').first()).toBeVisible();
      // The engine fetches today's puzzle and reveals the UI.
      await expect(page.locator('[data-xw-ui]')).toBeVisible();
      expect(await page.locator('.xw-cell:not(.xw-block)').count()).toBeGreaterThan(0);
      expect(await page.locator('.xw-clue').count()).toBeGreaterThan(0);
      await expect(page.locator('[data-difficulty]')).toHaveCount(3);
      await expect(page.locator('[data-xw-keyboard]')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('typing a letter lands in the active cell', async ({ page }) => {
    await page.goto('/games/crossword/');
    await expect(page.locator('[data-xw-ui]')).toBeVisible();
    const first = page.locator('.xw-cell:not(.xw-block)').first();
    await first.click();
    await page.keyboard.press('A');
    await expect(first.locator('[data-letter]')).toHaveText('A');
  });

  test('difficulty tabs switch the board', async ({ page }) => {
    await page.goto('/games/crossword/');
    await expect(page.locator('[data-xw-ui]')).toBeVisible();
    await page.locator('[data-difficulty="hard"]').click();
    await expect(page.locator('[data-difficulty="hard"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-xw-ui]')).toBeVisible();
    expect(await page.locator('.xw-cell:not(.xw-block)').count()).toBeGreaterThan(0);
  });
});

test.describe('crossword without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('fallback notice and how-to copy are visible', async ({ page }) => {
    await page.goto('/games/crossword/');
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('[data-xw-fallback]')).toBeVisible();
    // The script-driven shell must stay hidden, never half-rendered.
    await expect(page.locator('[data-xw-ui]')).toBeHidden();
  });
});
