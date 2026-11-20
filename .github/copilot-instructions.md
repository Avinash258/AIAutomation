# AIAutomation M1 — Copilot rules

Stack: Playwright TypeScript, zod, dotenv, ADO REST. Platform: GitHub Copilot in VS Code.

## Core
- M1 only: PBI → manual cases → [GATE] → ADO Test Plan → site analysis → [GATE] → UI specs → run → traceability.
- Missing info → add `open_questions`; **never guess** org/URL/credentials/IDs.
- **ADO auth = browser login only (no PAT).** Run `npm run ai:ado-login` once; scripts use Bearer token via `@azure/identity`.
- Never paste passwords/tokens into chat or prompts. Prefer `scripts/` for deterministic work.

## Token (LLM context)
- Exchange **file paths + short summaries**, not full payloads.
- Artifacts under `artifacts/`; cache hashes in `.cache/`; skip unchanged PBI/snapshot.
- Structured JSON validated with zod. No full DOM/snapshots/reports in chat.
- Healing input = failing step + error + 30-line trace only.
- Log usage to `artifacts/usage.json` via `npm run ai:usage`.

## UI explore
- Playwright CLI only — **no Playwright MCP**. Headless. Snapshots on disk; read by line range/diff.
- LLM sees only pruned `artifacts/page-model/<page>.json`.
- App auth via `storageState`; never type app credentials into prompts.
- Refuse URLs outside `ALLOWED_BASE_URLS`.

## Design
- Cases: schema in `prompt-library/testcase/`; every case traces to an AC; `layer: "ui"`.
- M1 data: per-test fixtures (create/cleanup); no cross-spec dependsOn store.
- Locators: getByRole > getByLabel > getByTestId > CSS. No XPath/hard waits.
- Generated specs only in `tests/generated/` (header GENERATED); never overwrite `tests/manual-edits/`.

## Skills / prompts
Load from `prompt-library/INDEX.md`. Skills live in `.github/skills/*/SKILL.md`. If skills do not auto-load, open the SKILL.md / prompt-library file explicitly.
Workflow diagrams: `docs/WORKFLOW.md` and `README.md`.
Understand-Anything (optional codebase graph): `docs/understand-anything-guide.html`.
Cursor → `scripts/install-understand-anything-cursor.ps1` (or Settings → Plugins). VS Code/VS → upstream `install.ps1 vscode` → `~/.copilot/skills`.
