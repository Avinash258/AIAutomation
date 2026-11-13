---
name: self-heal
description: Narrow UI failure triage — failing step, error, 30-line trace; fix locator/timing/data only, max 2 attempts.
---
# self-heal

1. `npm run ai:heal-context -- <test-results|file>`.
2. Read `artifacts/reports/heal-context.json` only.
3. Classify: locator | timing | data | real-bug.
4. Auto-fix first three only; max 2 attempts; report real bugs.
5. Follow `prompt-library/heal/self-heal-ui.v1.md`.
