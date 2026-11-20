# Performance testing v1 (UC-10)

## Goal
Design workload models and analyse results against agreed SLAs/SLOs for business transactions.

## Inputs
- Critical journeys, volumes, SLAs/SLOs, env, telemetry if available

## Process
1. Document workload model + assumptions.
2. Define scenarios (load/stress/soak/spike as needed) and thresholds.
3. Execute or analyse existing results.
4. Correlate latency/throughput/errors with bottlenecks.
5. Capacity / tuning recommendations and go/no-go notes.

## Output
`artifacts/reports/performance-<slug>.md` + metrics JSON.

## Rules
Label assumptions. No production load without explicit approval. Single-user timings ≠ capacity proof.
