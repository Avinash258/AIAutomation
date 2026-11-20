---
name: root-cause-analysis
description: UC-08 — Correlate failures with logs, changes and data; rank root-cause hypotheses with confidence.
---
# root-cause-analysis

1. Collect heal-context, traces, API responses, change refs, data conditions.
2. Follow `prompt-library/stlc/root-cause-analysis.v1.md`.
3. Separate facts / hypotheses / confirmed causes; list alternatives.
4. Rank hypotheses with confidence; recommend next diagnostic steps.
5. Write `artifacts/reports/rca-<slug>.json` + short investigation note.
6. Never mark root cause confirmed without owner validation; redact secrets.
