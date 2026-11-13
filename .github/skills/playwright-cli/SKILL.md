---
name: playwright-cli
description: Token-optimized browser exploration with Playwright CLI snapshots, diffs, and hash cache. Never use Playwright MCP.
---
# playwright-cli

1. `npx playwright-cli open <url>` then `snapshot` to `artifacts/snapshots/<page>.yml`.
2. Read only needed lines (grep/line range) — never the whole file in chat.
3. Before action → snapshot A; after → snapshot B; read only the diff.
4. Hash in `.cache/`; unchanged → skip re-prune.
5. Headless; screenshots only on failure.
6. Prefer `--depth` / scoped snapshot / `find` before full dumps.
7. LLM consumes `artifacts/page-model/<page>.json` only (via `npm run ai:analyze-site`).
