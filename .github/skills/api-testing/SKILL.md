---
name: api-testing
description: UC-03 — Generate and run API contract/business-rule tests from OpenAPI or compact api-model.
---
# api-testing

1. Prefer `artifacts/api-model.json`; else `API_OPENAPI_PATH` / `API_OPENAPI_URL` + `API_BASE_URL`.
2. Follow `prompt-library/stlc/api-testing.v1.md`.
3. Cover schema, business semantics, authz, negatives, idempotency where relevant.
4. Run only against allowlisted bases. Secrets via env only.
5. Write scenarios/results under `artifacts/testcases/` and/or `tests/generated/` (GENERATED header).
6. 2xx alone is not proof of correct business processing.
