---
name: testcase-gen
description: UC-02 — Generate scenarios (SC-*) and cases (TC-*) from PBI ACs with zod schema and GATE a before ADO publish.
---
# testcase-gen

1. Input: `artifacts/pbi/<id>.json` (and requirement analysis if present).
2. Follow `prompt-library/testcase/design-cases.v1.md`.
3. Write `artifacts/testcases/latest.json` with **scenarios[]**, each containing **cases[]** underneath.
4. Run `npm run ai:validate-cases` then `npm run ai:export-excel` → `artifacts/testcases/PBI-<id>-manual-tests.xlsx`.
5. Types: positive, negative, boundary, exception, alternate-flow, validation, permission, accessibility as AC warrants.
6. Generate from business behaviour/outcomes — not sentence-to-test conversion. Flag assumptions; do not invent expected results.
7. Stop for human GATE (a) before `ai:publish-plan`.

