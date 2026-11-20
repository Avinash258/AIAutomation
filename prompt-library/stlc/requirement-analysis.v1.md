# Requirement analysis v1 (UC-01)

## Goal
Score requirements for clarity, completeness, consistency, testability and business-process alignment.

## Inputs
- `artifacts/pbi/<id>.json`
- Optional `docs/business-context.md` (≤200 lines)

## Process
1. Extract title, description, AC/Expected, links.
2. Flag ambiguity, missing rules, conflicts, assumptions, dependencies.
3. Score each dimension 1–5 with evidence citations.
4. Propose candidate AC/rules only when grounded; mark **inferred**.
5. List clarification questions for PO/BA.

## Output schema (JSON)
```json
{
  "pbiId": "",
  "scores": { "clarity": 0, "completeness": 0, "consistency": 0, "testability": 0, "processAlignment": 0 },
  "findings": [{ "id": "F-001", "severity": "high|med|low", "source": "", "detail": "", "kind": "gap|ambiguity|conflict|assumption" }],
  "open_questions": [],
  "candidateRules": [{ "text": "", "origin": "explicit|inferred" }],
  "traceability": [{ "requirement": "", "process": "", "systems": [] }]
}
```

## Stop conditions
Missing PBI artifact → fetch or ask. Do not invent business rules.
