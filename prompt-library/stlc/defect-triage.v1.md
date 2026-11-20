# Defect triage v1 (UC-07)

## Goal
Classify a failure into a structured defect draft with severity, priority and routing.

## Inputs
- Heal-context / test-results / screenshots
- Linked PBI and severity definitions (if provided)

## Process
1. Summarise symptom vs expected.
2. Assess business journey impact.
3. Suggest category, severity, priority, assignment group.
4. Search for duplicate/related candidates (titles/symptoms).
5. Completeness checklist for evidence.

## Output
`artifacts/reports/defect-triage-<slug>.json` + markdown draft for humans.

## Rules
Do not auto-close or downgrade high-impact defects. Protect sensitive evidence.
