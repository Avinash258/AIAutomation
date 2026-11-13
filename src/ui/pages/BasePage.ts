import type { Page } from '@playwright/test';

/** Extend reused page objects; codegen must not regenerate this file. */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
