/**
 * One-time login → storageState. Never put credentials in prompts.
 * Usage: LOGIN_METHOD=user-pass UI_USER=... UI_PASSWORD=... npm run ai:save-auth
 */
import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { assertAllowedBaseUrl } from '../src/safety/allowlist.js';

dotenv.config();

async function main() {
  const baseURL = process.env.UI_BASE_URL;
  const user = process.env.UI_USER;
  const password = process.env.UI_PASSWORD;
  const out = process.env.STORAGE_STATE_PATH ?? 'storage-state.json';
  const method = process.env.LOGIN_METHOD ?? 'none';

  if (method === 'none') {
    console.log(JSON.stringify({ ok: true, skipped: true, reason: 'LOGIN_METHOD=none' }));
    return;
  }
  if (method === 'sso') {
    console.error(
      JSON.stringify({
        error: 'sso_manual',
        open_questions: [
          'Complete SSO in a headed browser once, or provide an existing STORAGE_STATE_PATH',
        ],
      }),
    );
    process.exit(1);
  }
  if (!baseURL || !user || !password) {
    console.error(
      JSON.stringify({
        error: 'missing_login_env',
        open_questions: ['Set UI_BASE_URL, UI_USER, UI_PASSWORD'],
      }),
    );
    process.exit(1);
  }
  assertAllowedBaseUrl(baseURL);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(baseURL);
  // Generic selectors — projects should extend this script for their login form
  const email = page.getByRole('textbox', { name: /email|user/i }).first();
  const pass = page.getByLabel(/password/i).or(page.getByRole('textbox', { name: /password/i }));
  await email.fill(user);
  await pass.fill(password);
  await page.getByRole('button', { name: /sign in|log in|login/i }).click();
  await page.waitForLoadState('networkidle');
  await page.context().storageState({ path: out });
  await browser.close();
  console.log(JSON.stringify({ ok: true, path: out }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
