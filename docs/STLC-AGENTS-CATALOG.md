# Top 10 STLC Agents Catalog

Source: `agentreq/Top 10 STLC agents List1.xlsx` (sheet: Detailed Agent Use Cases).

| ID | Priority | Phase | Agent | File | Skill | Slash prompt |
|----|----------|-------|-------|------|-------|--------------|
| UC-01 | P1 | Requirements & analysis | Requirement Analysis Agent | `.github/agents/requirement-analysis.agent.md` | `requirement-analysis` | `uc01-requirement-analysis` |
| UC-02 | P1 | Test design | Test Case Generation Agent | `.github/agents/test-case-generation.agent.md` | `testcase-gen` | `uc02-test-case-generation` |
| UC-03 | P1 | Service / integration | API Testing Agent | `.github/agents/api-testing.agent.md` | `api-testing` | `uc03-api-testing` |
| UC-04 | P1 | Regression optimisation | Regression Selection Agent | `.github/agents/regression-selection.agent.md` | `regression-selection` | `uc04-regression-selection` |
| UC-05 | P1 | Automation engineering | Automation Code Generator | `.github/agents/automation-code-generator.agent.md` | `playwright-cli` | `uc05-automation-codegen` |
| UC-06 | P2 | Automation maintenance | Self-Healing Agent | `.github/agents/self-healing.agent.md` | `self-heal` | `uc06-self-healing` |
| UC-07 | P2 | Defect management | Defect Triage Agent | `.github/agents/defect-triage.agent.md` | `defect-triage` | `uc07-defect-triage` |
| UC-08 | P2 | Defect investigation | Root Cause Analysis Agent | `.github/agents/root-cause-analysis.agent.md` | `root-cause-analysis` | `uc08-root-cause-analysis` |
| UC-09 | P2 | Data integration & validation | ETL Testing Agent | `.github/agents/etl-testing.agent.md` | `etl-testing` | `uc09-etl-testing` |
| UC-10 | P2 | Non-functional / performance | Performance Testing Agent | `.github/agents/performance-testing.agent.md` | `performance-testing` | `uc10-performance-testing` |

## Framework companions (M1 flow)

| Agent | Role |
|-------|------|
| `ado-reader` | Fetch PBI via Entra browser login (no PAT) |
| `testcase-generator` | Alias flow for UC-02 (existing M1 path) |
| `site-analyzer` | Compact page-model via Playwright CLI |
| `script-generator` | Alias flow for UC-05 (existing M1 path) |
| `qa-orchestrator` | End-to-end gates a/b |

## How to invoke (VS Code Copilot)

1. Open Chat → Agents → pick the STLC agent by name, **or**
2. Run slash prompt `/uc0N-…` from `.github/prompts/`.

## Autonomy rule (all)

Agents draft and recommend. Humans approve requirement changes, critical expected outcomes, contract baselines, regression exclusions, assertion changes, severity/ownership, confirmed root cause, destructive data actions, and production/performance load.
