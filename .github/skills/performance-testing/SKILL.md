---
name: performance-testing
description: UC-10 — Design workload models and analyse perf results against SLAs/SLOs for business transactions.
---
# performance-testing

1. Confirm journeys, SLAs/SLOs, env, tool and approval for non-dev targets.
2. Follow `prompt-library/stlc/performance-testing.v1.md`.
3. Model realistic business transactions; label assumptions.
4. M1: Playwright timing smoke OK; dedicated load → k6/JMeter (or lab tool) plans.
5. Write `artifacts/reports/performance-<slug>.md` + metrics JSON when available.
6. Never load-test production without explicit written approval.
