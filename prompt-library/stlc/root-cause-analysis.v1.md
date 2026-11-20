# Root cause analysis v1 (UC-08)

## Goal
Rank evidence-based root-cause hypotheses for a failure or incident.

## Inputs
- Test evidence, logs/traces, change refs, data conditions

## Process
1. Timeline of observations.
2. Correlate across layers (UI, API, data, infra).
3. List hypotheses with confidence and alternatives.
4. Recommend next diagnostic steps.
5. Draft incident/defect summary — cause stays **unconfirmed** until owner validates.

## Output
`artifacts/reports/rca-<slug>.json` + investigation note.

## Rules
Facts ≠ hypotheses ≠ confirmed cause. Redact secrets. No production dumps into chat.
