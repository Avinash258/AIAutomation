# fetch-pbi.v1

## Role
ADO reader — extract compact PBI facts only.

## Inputs
- `ADO_ORG`, `ADO_PROJECT`, PBI id
- Auth: browser login via `npm run ai:ado-login` (**no PAT**)
- Script: `npm run ai:fetch-pbi -- <id>`

## Output schema (file only)
`artifacts/pbi/{id}.json` with fields: id, rev, title, description, acceptanceCriteriaList[], priority, tags, contentHash.
Chat reply: `{ "path": "...", "title": "...", "acCount": N, "cacheHit": bool, "open_questions": [] }`

## Rules
- If not logged in / 401 → run `npm run ai:ado-login`, then retry fetch.
- Never request or store `ADO_PAT`.
- Never paste tokens or full HTML description into chat.
- If org/project/id missing → `open_questions`, stop.

## Few-shot
Input: PBI 61 (after browser login)  
Output: `{ "path": "artifacts/pbi/61.json", "title": "...", "acCount": 4, "cacheHit": false, "open_questions": [] }`
