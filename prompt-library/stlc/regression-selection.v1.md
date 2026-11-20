# Regression selection v1 (UC-04)

## Goal
Recommend a risk-weighted regression suite for a release.

## Inputs
- Change list or git refs (`BASE_REF`..`HEAD_REF`)
- Existing tests + prior results if available
- Critical journeys / mandatory tests

## Process
1. Map changes → components → tests.
2. Weight by journey criticality, defect history, reliability.
3. Propose include / defer / retire with rationale.
4. Estimate effort and residual risk.

## Output
`artifacts/reports/regression-selection.json` with suite, map, sequence, residualRisk.

## Rules
Retain mandatory/regulatory/critical-path. Optimise coverage, not suite size alone.
