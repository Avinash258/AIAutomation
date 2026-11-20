---
name: requirement-analysis
description: UC-01 — Score requirements for clarity, testability, gaps and process alignment; emit scorecard and open questions.
---
# requirement-analysis

1. Input: `artifacts/pbi/<id>.json` and optional `docs/business-context.md` (≤200 lines).
2. Follow `prompt-library/stlc/requirement-analysis.v1.md`.
3. Score clarity, completeness, consistency, testability, process alignment.
4. Emit `artifacts/requirements/analysis-<id>.json` + short report under `artifacts/reports/`.
5. Never invent business rules — use `open_questions` for gaps.
6. Mark every suggestion **explicit** vs **inferred**.
