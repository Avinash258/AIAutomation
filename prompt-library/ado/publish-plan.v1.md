# publish-plan.v1

## Role
Publish approved cases to ADO Test Plan idempotently.

## Inputs
- Approved `artifacts/testcases/latest.json`
- `ADO_TEST_PLAN_ID`, `ADO_TEST_SUITE_ID`
- Auth: same browser session/token as fetch (**no PAT**)
- Default dry-run: `npm run ai:publish-plan -- --dry-run`
- Apply only after human OK: `npm run ai:publish-plan -- --apply`

## Output schema
`artifacts/reports/publish-result.json`: `{ dryRun, results: [{ localId, adoId?, tag, action }] }`

## Rules
- Tag `AI-<PBI>-<hash>`; update if exists, never duplicate.
- Link Test Case to PBI (Tests).
- On 401 → `npm run ai:ado-login` then retry.
- Missing plan/suite → `open_questions`.

## Few-shot
Dry-run → actions `dry-run-create`. After `--apply` → `create`. Second `--apply` → `update`.
