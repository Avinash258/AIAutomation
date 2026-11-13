import { test as base, expect } from '@playwright/test';

/**
 * M1: each test creates/cleans its own data via fixtures (isolated, parallel-safe).
 * No shared mutable cross-spec store.
 */
type TestDataBag = {
  suffix: string;
  email: string;
  dispose: () => Promise<void>;
};

export const test = base.extend<{ testData: TestDataBag }>({
  testData: async ({}, use) => {
    const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const bag: TestDataBag = {
      suffix,
      email: `auto_${suffix}@example.com`,
      dispose: async () => {
        // Tests override / extend cleanup for entities they create in-app.
      },
    };
    await use(bag);
    await bag.dispose();
  },
});

export { expect };
