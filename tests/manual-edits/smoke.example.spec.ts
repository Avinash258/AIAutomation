import { test, expect } from '../../src/fixtures/index.js';

/**
 * Hand-edited example — never overwritten by codegen.
 * Skips unless UI_BASE_URL points at a live allowlisted app.
 */
test.describe('manual-edits smoke', () => {
  test.skip(!process.env.UI_BASE_URL || process.env.UI_BASE_URL.includes('example.com'), 'Set real UI_BASE_URL');

  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });
});
