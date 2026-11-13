---
name: ado-pbi
description: Fetch compact Azure DevOps PBIs using browser Entra login (no PAT). Use when reading work items or starting the M1 flow.
---
# ado-pbi

## Auth (mandatory)
1. Require `ADO_ORG`, `ADO_PROJECT` — else `open_questions`.
2. **No PAT.** Auth is browser-based: `npm run ai:ado-login` (opens Microsoft login).
3. Modes via `ADO_AUTH_MODE`: `browser` (default) | `device-code` | `az-cli`.
4. Never ask the user to paste a PAT; never open ADO HTML pages to scrape work items.

## Fetch
1. Run `npm run ai:fetch-pbi -- <id>` (acquires/refreshes Bearer token automatically).
2. Read only `artifacts/pbi/<id>.json`.
3. Respect cacheHit — do not re-narrate full PBI if unchanged.
4. Never print access tokens or raw HTML fields.
