import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/** Reused TaxMesh workspace page object — extend, do not regenerate. */
export class TaxMeshPage extends BasePage {
  readonly loadFiles: Locator;
  readonly uploadAll: Locator;
  readonly alcNav: Locator;
  readonly taxNav: Locator;

  constructor(page: Page) {
    super(page);
    this.loadFiles = page.getByRole('button', { name: 'Load files' });
    this.uploadAll = page.getByRole('button', { name: 'Upload all 3 & process' });
    this.alcNav = page.getByRole('button', { name: /ALC Allocations/i });
    this.taxNav = page.getByRole('button', { name: /TAX Tax Computation/i });
  }

  async openHome(): Promise<void> {
    await this.goto('/');
    await this.page.getByRole('button', { name: 'Overview' }).waitFor({ state: 'visible' });
  }

  async processDemoDataset(): Promise<void> {
    await this.loadFiles.click();
    await this.uploadAll.click();
    // Wait until ALC shows ready in overview strip
    await this.page.getByText(/ALC[\s\S]*ready/i).first().waitFor({ timeout: 120_000 });
  }

  async openAlc(): Promise<void> {
    await this.alcNav.click();
  }

  async openTax(): Promise<void> {
    await this.taxNav.click();
  }

  bodyText(): Promise<string> {
    return this.page.locator('body').innerText();
  }
}
