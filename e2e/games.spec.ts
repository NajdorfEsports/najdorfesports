import { test, expect } from '@playwright/test';
import { trackConsoleErrors } from './helpers';

/**
 * /games/ hub + daily crossword + OWdle. House rule applies: STRUCTURE
 * and visibility only. Never assert a specific answer, clue text, grid
 * size, hero name, or word count; the committed puzzle set and hero
 * dataset rotate, and a regeneration must never break this suite.
 */

const LOCALES = ['', '/zh-TW', '/zh-CN'];

test.describe('games hub', () => {
  for (const prefix of LOCALES) {
    test(`${prefix || '/'}games/ lists both games`, async ({ page }) => {
      await page.goto(`${prefix}/games/`);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator(`main a[href="${prefix}/games/crossword/"]`).first()).toBeVisible();
      await expect(page.locator(`main a[href="${prefix}/games/owdle/"]`).first()).toBeVisible();
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

test.describe('owdle', () => {
  for (const prefix of LOCALES) {
    test(`${prefix || '/'}games/owdle/ renders a playable board`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await page.goto(`${prefix}/games/owdle/`);
      await expect(page.locator('main h1').first()).toBeVisible();
      // The engine boots from its bundled dataset and reveals the UI.
      await expect(page.locator('[data-ow-ui]')).toBeVisible();
      await expect(page.locator('#ow-guess-input')).toBeVisible();
      // Header row: hero column plus the seven attribute columns.
      await expect(page.locator('.ow-head-cell')).toHaveCount(8);
      await expect(page.locator('[data-ow-board-wrap]')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('typing surfaces suggestions and a guess fills a row', async ({ page }) => {
    await page.goto('/games/owdle/');
    await expect(page.locator('[data-ow-ui]')).toBeVisible();
    await page.locator('#ow-guess-input').fill('a');
    const options = page.locator('.ow-suggestion');
    await expect(options.first()).toBeVisible();
    await options.first().click();
    // One guess row appears under the header (8 cells, color-coded).
    await expect(page.locator('.ow-row:not(.ow-head)')).toHaveCount(1);
    expect(await page.locator('.ow-row:not(.ow-head) .ow-cell').count()).toBe(8);
    // The guessed hero leaves the suggestion list.
    const guessedName = await page.locator('.ow-name').first().innerText();
    await page.locator('#ow-guess-input').fill(guessedName.slice(0, 3));
    for (const text of await page.locator('.ow-suggestion').allInnerTexts()) {
      expect(text).not.toBe(guessedName);
    }
  });

  test('fit-to-screen toggle flips its pressed state', async ({ page }) => {
    await page.goto('/games/owdle/');
    await expect(page.locator('[data-ow-ui]')).toBeVisible();
    const fit = page.locator('[data-ow-fit]');
    await expect(fit).toHaveAttribute('aria-pressed', 'false');
    await fit.click();
    await expect(fit).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('owdle without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('fallback notice and how-to copy are visible', async ({ page }) => {
    await page.goto('/games/owdle/');
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('[data-ow-fallback]')).toBeVisible();
    // The script-driven shell must stay hidden, never half-rendered.
    await expect(page.locator('[data-ow-ui]')).toBeHidden();
  });
});
