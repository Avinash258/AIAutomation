---
name: testcase-gen
description: Generate manual UI test cases from PBI ACs with zod schema and GATE a before ADO publish.
---
# testcase-gen

1. Input: `artifacts/pbi/<id>.json`.
2. Follow `prompt-library/testcase/design-cases.v1.md`.
3. Write `artifacts/testcases/latest.json` with **scenarios[]**, each containing **cases[]** underneath.
4. Run `npm run ai:validate-cases` then `npm run ai:export-excel` → `artifacts/testcases/PBI-<id>-manual-tests.xlsx`.
5. Types: positive, negative, boundary, validation, permission, accessibility as AC warrants.
6. Stop for human GATE (a) before `ai:publish-plan`.
