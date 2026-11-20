---
name: defect-triage
description: UC-07 — Classify defects, suggest severity/priority, detect duplicates, draft structured triage.
---
# defect-triage

1. Inputs: heal-context, Playwright results, linked PBI, screenshots/logs.
2. Follow `prompt-library/stlc/defect-triage.v1.md`.
3. Distinguish business impact from technical symptoms.
4. Suggest category, severity, priority, assignment group; flag duplicate candidates.
5. Write `artifacts/reports/defect-triage-<slug>.json` + markdown draft.
6. Never auto-close, downgrade or reassign high-impact defects.
