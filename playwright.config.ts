import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { assertAllowedBaseUrl } from './src/safety/allowlist.js';

dotenv.config();

const baseURL = process.env.UI_BASE_URL ?? 'https://example.com';
// Enforce allowlist whenever tests/config load (requires ALLOWED_BASE_URLS in .env)
if (process.env.ALLOWED_BASE_URLS) {
  assertAllowedBaseUrl(baseURL);
}

const storageState =
  process.env.LOGIN_METHOD && process.env.LOGIN_METHOD !== 'none' && process.env.STORAGE_STATE_PATH
    ? process.env.STORAGE_STATE_PATH
    : undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    ...(storageState ? { storageState } : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
