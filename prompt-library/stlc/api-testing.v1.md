# API testing v1 (UC-03)

## Goal
Generate and execute API tests that validate schema **and** business semantics.

## Inputs
- `artifacts/api-model.json` or OpenAPI path/URL
- `API_BASE_URL` (allowlisted)

## Process
1. Map endpoints to business workflows.
2. Design positive, negative, authz, boundary, idempotency cases.
3. Assert status, schema, and business fields/outcomes.
4. Run in authorised env; capture evidence.
5. Flag contract drift vs baseline when available.

## Output
- Scenario/case JSON and/or Playwright `request` specs
- Coverage summary + defect evidence paths

## Rules
Never use 2xx alone as pass. Secrets via env. Stop if contract missing.
