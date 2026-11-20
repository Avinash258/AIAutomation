---
name: etl-testing
description: UC-09 — Source-to-target ETL/ELT validation, reconciliation and data-quality checks (read-only by default).
---
# etl-testing

1. Inputs: approved mapping specs, data contracts, pipeline names.
2. Follow `prompt-library/stlc/etl-testing.v1.md`.
3. Build source-to-target matrix; completeness, accuracy, uniqueness, RI, transforms, incremental loads.
4. Default **read-only** SQL/assertions; controlled datasets only.
5. Write `artifacts/reports/etl-<slug>.md` + matrix JSON.
6. Destructive/corrective production actions require data-engineering approval.
