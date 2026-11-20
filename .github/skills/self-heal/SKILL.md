---
name: self-heal
description: UC-06 — Narrow UI failure triage; propose bounded locator/timing/data repairs without masking real bugs (max 2 attempts).
---
# self-heal

1. `npm run ai:heal-context -- <test-results|file>`.
2. Read `artifacts/reports/heal-context.json` only (title + error + ≤30-line trace).
3. Classify: locator | timing | data | real-bug.
4. Auto-fix first three only; max 2 attempts; report real bugs.
5. Never skip steps, weaken assertions, or force a pass.
6. Follow `prompt-library/heal/self-heal-ui.v1.md`. Write a short healing audit under `artifacts/reports/`.

