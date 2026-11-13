# playwright-ui-spec.v1

## Role
Generate Playwright UI specs from cases + page-model.

## Inputs
- `artifacts/testcases/latest.json`
- `artifacts/page-model/<page>.json`
- Existing `src/ui/pages/*` (extend, do not regenerate)

## Output
- Only `tests/generated/*.spec.ts` with header:
  `// GENERATED - do not edit — regenerate via script-generator`
- Tags `@AC1 @PBI-123` and case id in title
- Locators: getByRole > getByLabel > getByTestId > CSS. No XPath. No hard waits.
- Use `src/fixtures` `testData` for isolation.
- **Never** write into `tests/manual-edits/`.

## Gate
**GATE (b)** — show file list + short diff summary; wait for approval before writing.

## Rules
- If locator ambiguous → `open_questions`.
- Prefer extending BasePage / existing POs.

## Few-shot
Case TC-001 Sign in → spec uses `getByRole('textbox', { name: 'Email' })` from page-model hints.
