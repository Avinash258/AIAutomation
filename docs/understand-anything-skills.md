# Understand-Anything — Skills for Cursor, VS Code & Visual Studio

Date: 2026-11-18 (Windows)  
Integrated into: `AIAutomation`  
Audience: **Cursor**, GitHub Copilot Agent (VS Code / Visual Studio)

Interactive guide: [understand-anything-guide.html](./understand-anything-guide.html)

Understand-Anything builds a local knowledge graph of a codebase. AIAutomation keeps its own QA skills under `.github/skills/` (ADO → scenarios → Excel → Playwright). Use both.

---

## Prerequisites

| Tool | Requirement |
|------|-------------|
| Node.js | ≥ 22 (for upstream skill helpers) |
| pnpm | ≥ 10 (upstream builds) |
| Git | recent |
| Python | 3.x (some helpers) |
| Cursor **or** VS Code Copilot v1.108+ / Visual Studio Copilot | Agent mode |

---

## Skill catalog (all 9)

| Skill | Invoke |
|-------|--------|
| `understand` | `/understand` |
| `understand-dashboard` | `/understand-dashboard` |
| `understand-chat` | `/understand-chat …` |
| `understand-diff` | `/understand-diff` |
| `understand-explain` | `/understand-explain <path>` |
| `understand-onboard` | `/understand-onboard` |
| `understand-domain` | `/understand-domain` |
| `understand-knowledge` | `/understand-knowledge` |
| `understand-figma` | `/understand-figma` (`FIGMA_TOKEN`) |

If slash commands are missing, ask: *Use the understand skill to analyze this project.*

---

## Cursor install (3 options)

### Option 1 — Cursor Plugins (easiest)

1. Cursor **Settings → Plugins**
2. Paste: `https://github.com/Egonex-AI/Understand-Anything`
3. Add / install the plugin
4. Restart Cursor or reload the window
5. Open your **target** project → Agent chat → `/understand`

### Option 2 — Open the plugin repo (auto-discovery)

```powershell
git clone https://github.com/Egonex-AI/Understand-Anything.git
# Open that folder in Cursor — discovers .cursor-plugin/plugin.json
```

Use this to develop/debug the plugin. For analyzing **other** repos (TaxMesh, AIAutomation), prefer Option 1 or 3.

### Option 3 — Personal skills for every project (recommended with AIAutomation)

Junctions the nine skills into Cursor’s personal skills folder:

```text
%USERPROFILE%\.cursor\skills\understand\
%USERPROFILE%\.cursor\skills\understand-dashboard\
… (all 9)
```

```powershell
# 1) Clone Understand-Anything somewhere
git clone https://github.com/Egonex-AI/Understand-Anything.git C:\src\Understand-Anything
cd C:\src\Understand-Anything
pnpm install
pnpm --filter @understand-anything/core build
pnpm --filter @understand-anything/skill build

# 2) From AIAutomation (or set UA_DIR then run script)
cd C:\Project\AIAutomation
$env:UA_DIR = "C:\src\Understand-Anything"
.\scripts\install-understand-anything-cursor.ps1
```

Uninstall junctions:

```powershell
.\scripts\install-understand-anything-cursor.ps1 -Uninstall
```

Then **reload Cursor** and open the target app workspace.

---

## VS Code / Visual Studio (Copilot)

Personal skills path:

```text
%USERPROFILE%\.copilot\skills\<skill-name>\SKILL.md
```

```powershell
cd <path-to-Understand-Anything>
pnpm install
pnpm --filter @understand-anything/core build
pnpm --filter @understand-anything/skill build
.\install.ps1 vscode
```

One-liner:

```powershell
iwr -useb https://raw.githubusercontent.com/Egonex-AI/Understand-Anything/main/install.ps1 | iex
# choose: vscode
```

Visual Studio has **no** separate installer platform — use `vscode` (same `~/.copilot/skills`).

---

## How to use (any host)

1. Open the **TARGET** project (code to analyze).
2. Open Agent chat (Cursor Agent / Copilot Agent).
3. Run:

```text
/understand
```

4. Then:

```text
/understand-dashboard
/understand-chat How does validation INFO naming work?
/understand-explain path\to\File.ts
/understand-diff
/understand-onboard
```

### Output (in the analyzed project)

| Path | Contents |
|------|----------|
| `.ua/knowledge-graph.json` | Main graph |
| `.ua/meta.json` | Metadata |
| `.ua/fingerprints.json` | Incremental baseline |
| `.ua/config.json` | Settings |

### Useful flags

| Flag | Meaning |
|------|---------|
| `--full` | Force rebuild |
| `--review` | LLM graph reviewer |
| `--language en` | Summary language |
| `--exclude "a/*,b/*"` | Extra ignores |

---

## Pair with AIAutomation

| Goal | Tool |
|------|------|
| Map app under test | Cursor/Copilot `/understand` on TaxMesh |
| Change impact | `/understand-diff` |
| ADO → SC/TC → Excel → Playwright | `ado-reader` / `qa-orchestrator` in this repo |
| Excel export | `npm run ai:export-excel` |

---

## Host matrix

| Topic | Cursor | VS Code Copilot | Visual Studio |
|-------|--------|-----------------|---------------|
| Plugins UI install | Settings → Plugins + repo URL | Marketplace / `.copilot-plugin` | N/A |
| Auto-discover plugin repo | `.cursor-plugin/plugin.json` | `.copilot-plugin/plugin.json` | Not documented |
| Personal skills folder | `~/.cursor/skills` | `~/.copilot/skills` | `~/.copilot/skills` |
| Helper in this repo | `scripts/install-understand-anything-cursor.ps1` | upstream `install.ps1 vscode` | same as VS Code |
| Project skills | `.cursor/skills/` or `.github/skills/` | `.github/skills/` | `.github/skills/` |

---

## Related

- HTML: [understand-anything-guide.html](./understand-anything-guide.html)
- Workflow: [WORKFLOW.md](./WORKFLOW.md)
- Upstream: https://github.com/Egonex-AI/Understand-Anything
