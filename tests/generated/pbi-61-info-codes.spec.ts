// GENERATED - do not edit — regenerate via script-generator
// PBI-61: Validation INFO codes still show legacy RPAM/TIM instead of ALC/TAX
import { test, expect } from '../../src/fixtures/index.js';
import { TaxMeshPage } from '../../src/ui/pages/TaxMeshPage.js';

test.describe('PBI-61 INFO naming ALC/TAX @PBI-61 @AC1 @AC2 @AC3', () => {
  test.beforeEach(async ({ page }) => {
    const taxmesh = new TaxMeshPage(page);
    await taxmesh.openHome();
    await taxmesh.processDemoDataset();
  });

  test('TC-001 ALC INFO finding code uses ALC- prefix not RPAM- @AC1', async ({ page }) => {
    const taxmesh = new TaxMeshPage(page);
    await taxmesh.openAlc();
    const text = await taxmesh.bodyText();

    expect(text, 'ALC panel should show PASS validation').toMatch(/PASS/i);
    // Expected product naming (fails on current buggy build — documents PBI-61)
    expect(text).toMatch(/ALC-BV-31|ALC-[A-Z]+-\d+/i);
    expect(text).not.toMatch(/RPAM-BV-31|RPAM-/i);
  });

  test('TC-002 ALC INFO references TAX not TIM @AC1', async ({ page }) => {
    const taxmesh = new TaxMeshPage(page);
    await taxmesh.openAlc();
    const text = await taxmesh.bodyText();

    // If message mentions reconcile target, it must be TAX not TIM
    if (/reconcil/i.test(text)) {
      expect(text).toMatch(/reconcil\w*\s+to\s+TAX/i);
      expect(text).not.toMatch(/reconcil\w*\s+to\s+TIM/i);
    }
    expect(text).not.toMatch(/\bTIM-BV-31\b/i);
  });

  test('TC-003 TAX INFO finding code uses TAX- prefix not TIM- @AC2', async ({ page }) => {
    const taxmesh = new TaxMeshPage(page);
    await taxmesh.openTax();
    const text = await taxmesh.bodyText();

    expect(text).toMatch(/PASS/i);
    expect(text).toMatch(/TAX-BV-31|TAX-[A-Z]+-\d+/i);
    expect(text).not.toMatch(/TIM-BV-31|TIM-/i);
  });

  test('TC-004 no legacy RPAM/TIM on INFO when ALC/TAX PASS @AC3', async ({ page }) => {
    const taxmesh = new TaxMeshPage(page);
    await taxmesh.openAlc();
    let text = await taxmesh.bodyText();
    expect(text).not.toMatch(/RPAM-/i);
    expect(text).not.toMatch(/\bTIM-/i);

    await taxmesh.openTax();
    text = await taxmesh.bodyText();
    expect(text).not.toMatch(/RPAM-/i);
    expect(text).not.toMatch(/\bTIM-/i);
  });

  test('TC-005 regression ALC and TAX still ready/PASS @AC2', async ({ page }) => {
    await expect(page.getByRole('button', { name: /ALC[\s\S]*ready|ALC Allocations/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /TAX[\s\S]*ready|TAX Tax Computation/i }).first()).toBeVisible();
    const taxmesh = new TaxMeshPage(page);
    await taxmesh.openAlc();
    expect(await taxmesh.bodyText()).toMatch(/PASS/i);
  });
});
