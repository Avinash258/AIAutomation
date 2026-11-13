---
name: site-analyze
description: Ask for URL if missing, enforce allowlist, run analyze-site prune pipeline to page-model JSON.
---
# site-analyze

1. Ask user for URL when not provided.
2. Ensure URL is in `ALLOWED_BASE_URLS` (script enforces).
3. Run `npm run ai:analyze-site -- <url>`.
4. Summarize page-model path + keptNodes only.
5. Crawl budget: `MAX_PAGES` (default 10), same-origin; M1 starts at entry URL.
