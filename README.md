# AIAutomation (M1)

GitHub Copilot–driven **Playwright (TypeScript)** flow:

**PBI → manual cases → [GATE a] → ADO Test Plan → site analysis → [GATE b] → UI specs → run → traceability**

## Setup

```bash
cp .env.example .env   # fill ADO_ORG, ADO_PROJECT, ALLOWED_BASE_URLS, UI_BASE_URL
npm install
npx playwright install chromium
npm run ai:ado-login   # browser Entra login — NO PAT
```

### ADO auth (browser, no PAT)

| Step | Command |
|------|---------|
| Login once | `npm run ai:ado-login` (opens Microsoft login) |
| Fetch PBI | `npm run ai:fetch-pbi -- 61` |
| Mode | `ADO_AUTH_MODE=browser` (default), or `device-code`, or `az-cli` |

Agents/skills must never ask for `ADO_PAT`. On 401 they re-run `ai:ado-login`.

## Copilot (VS Code)

1. Open Copilot Chat → Agent mode  
2. Pick an agent under `.github/agents/` (e.g. `qa-orchestrator`)  
3. Or use prompts under `.github/prompts/` (`/ado-fetch`, `/gen-cases`, …)  
4. Skills: `.github/skills/*/SKILL.md` — if your Copilot build does not auto-load skills, open the SKILL.md / `prompt-library/` file explicitly (called out in `copilot-instructions.md`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run ai:flow -- --pbi <id>` | Preflight + fetch + case shell; stops at GATE a |
| `npm run ai:fetch-pbi -- <id>` | Compact PBI → `artifacts/pbi/` |
| `npm run ai:validate-cases` | Zod-validate `artifacts/testcases/latest.json` |
| `npm run ai:publish-plan -- --dry-run` | Idempotent publish preview (default) |
| `npm run ai:publish-plan -- --apply` | Real publish after approval |
| `npm run ai:analyze-site -- <url>` | Playwright CLI + prune → page-model |
| `npm run ai:heal-context` | 30-line failure excerpt |
| `npm run ai:traceability` | PBI → AC → Case → Spec matrix |
| `npm run ai:usage` | Token estimate summary |
| `npx playwright test` | CI/local run — **no LLM** |

## Human gates

- **(a)** after cases, before ADO publish  
- **(b)** before writing `tests/generated/`

## Safety

- Base URL must be in `ALLOWED_BASE_URLS`  
- Production-like hosts blocked unless `APP_ENV=prod`  
- Secrets only in `.env` (gitignored)

## Defaults chosen (override in `.env`)

| Choice | Value |
|--------|--------|
| Scope | **manual + UI automation** |
| Env | **qa** |
| Login | **none** (optional `user-pass` via `npm run ai:save-auth`) |
| Suite | **use-existing** plan/suite IDs |
| Publish | **dry-run ON** until you pass `--apply` |

Offline without ADO: `npm run ai:load-sample-pbi` then design cases from `artifacts/pbi/1001.json`.

Still required for a **live** run: real `UI_BASE_URL` + allowlist, `ADO_ORG` / `ADO_PROJECT`, browser login, PBI + Plan/Suite IDs.

## Later milestones

- TODO M2: OpenAPI ingest, API specs, fixture-based hybrid tests, richer self-heal.  
- TODO M3: business/repo impact scoring, shared data graph.
