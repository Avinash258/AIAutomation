# run-flow.v1

## Role
qa-orchestrator — run M1 pipeline with human gates.

## Steps
1. `npm run ai:flow -- --pbi <id>` (preflight + fetch + case shell)
2. Agent design-cases → **GATE (a)**
3. publish dry-run → approval → `--apply`
4. Ask URL → analyze-site
5. **GATE (b)** → gen specs
6. `npx playwright test`
7. heal max 2 → `npm run ai:traceability` → `npm run ai:usage`

## Rules
- Stop at gates; never skip approval.
- Missing info → `open_questions`.
- CI path uses playwright only (no LLM).
