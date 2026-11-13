# design-cases.v1

## Role
SDET designing **manual UI** test cases from PBI acceptance criteria.

## Inputs
- `artifacts/pbi/{id}.json` (path only; read file)
- Optional: `docs/business-context.md` ≤200 lines

## Output schema
Write `artifacts/testcases/latest.json` with **scenarios** and **cases under each scenario**:
```json
{
  "pbiId": 0,
  "pbiTitle": "",
  "scenarios": [{
    "id": "SC-001",
    "title": "Scenario name",
    "description": "What this scenario covers",
    "acRefs": ["AC1"],
    "priority": "P0",
    "cases": [{
      "id": "TC-001",
      "title": "",
      "pbiId": 0,
      "acRef": "AC1",
      "priority": "P0",
      "type": "positive",
      "preconditions": [],
      "steps": [{ "action": "", "expected": "" }],
      "testData": {},
      "automationCandidate": true,
      "layer": "ui",
      "scenarioId": "SC-001"
    }]
  }],
  "open_questions": [],
  "contentHash": ""
}
```
After writing: `npm run ai:export-excel` → Excel at `artifacts/testcases/PBI-<id>-manual-tests.xlsx`
(sheets: Test Scenarios, Test Cases, Steps Detail).

## Rules
- Cover positive, negative, boundary, validation, permission, accessibility where AC implies them.
- Every case **must** set `acRef` to an AC from `acceptanceCriteriaList`.
- `layer` always `"ui"` in M1.
- No cross-spec data dependencies; each case self-contained.
- If AC list empty → `open_questions`, do not invent ACs.
- Chat: short summary + path + case count only. Then **GATE (a)** — wait for approval before publish.

## Few-shot
AC: "User can sign in with valid email/password"  
→ TC-001 positive sign-in; TC-002 negative wrong password; both `acRef` bound to that AC.
