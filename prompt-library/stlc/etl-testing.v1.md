# ETL testing v1 (UC-09)

## Goal
Validate source-to-target mappings and reconciliations for data pipelines.

## Inputs
- Mapping specification / data contract
- Controlled dataset access (read-only default)

## Process
1. Build source-to-target validation matrix.
2. Checks: completeness, accuracy, uniqueness, RI, transforms, incremental, exceptions.
3. Reconcile at aggregate and sample record levels.
4. Distinguish timing lag from data loss.
5. Report lineage and downstream impact of variances.

## Output
`artifacts/reports/etl-<slug>.md` + matrix JSON; SQL/assertions for review before run.

## Rules
Approved mappings only. Read-only by default. No destructive production actions without approval.
