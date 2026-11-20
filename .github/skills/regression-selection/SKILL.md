---
name: regression-selection
description: UC-04 — Build a risk-weighted regression suite from change impact, criticality and reliability.
---
# regression-selection

1. Gather change evidence (`TARGET_APP_REPO` + refs, or user change list).
2. Inventory tests in `tests/` and `artifacts/testcases/`.
3. Follow `prompt-library/stlc/regression-selection.v1.md`.
4. Optimise for risk-weighted business coverage; retain mandatory/regulatory/critical-path.
5. Write `artifacts/reports/regression-selection.json` with include/defer/retire + residual risk.
6. Missing change scope → `open_questions`.
