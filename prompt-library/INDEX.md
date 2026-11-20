# Prompt library (M1 + STLC UC-01..UC-10)

| id | path | agent | requiredArtifacts | producesArtifacts |
|----|------|-------|-------------------|-------------------|
| ado-login | (script `ai:ado-login`) | ado-reader | ADO_ORG/PROJECT | Entra browser session |
| ado-fetch | ado/fetch-pbi.v1.md | ado-reader | browser auth + ADO_ORG/PROJECT | artifacts/pbi/{id}.json |
| design-cases | testcase/design-cases.v1.md | Test Case Generation / testcase-generator | artifacts/pbi/{id}.json | artifacts/testcases/latest.json |
| publish-plan | ado/publish-plan.v1.md | qa-orchestrator | artifacts/testcases/latest.json | artifacts/reports/publish-result.json |
| analyze-site | site/analyze-url.v1.md | site-analyzer | UI URL + allowlist | artifacts/page-model/{page}.json |
| gen-specs | codegen/playwright-ui-spec.v1.md | Automation Code Generator / script-generator | page-model + cases | tests/generated/*.spec.ts |
| self-heal | heal/self-heal-ui.v1.md | Self-Healing Agent | heal-context.json | patched spec or bug report |
| run-flow | testcase/run-flow.v1.md | qa-orchestrator | env + pbi | gate status |
| uc01-req | stlc/requirement-analysis.v1.md | Requirement Analysis Agent | artifacts/pbi/{id}.json | artifacts/requirements/analysis-*.json |
| uc03-api | stlc/api-testing.v1.md | API Testing Agent | api-model / OpenAPI | API cases / request specs |
| uc04-reg | stlc/regression-selection.v1.md | Regression Selection Agent | change list / refs | artifacts/reports/regression-selection.json |
| uc07-triage | stlc/defect-triage.v1.md | Defect Triage Agent | heal-context / results | artifacts/reports/defect-triage-*.json |
| uc08-rca | stlc/root-cause-analysis.v1.md | Root Cause Analysis Agent | evidence pack | artifacts/reports/rca-*.json |
| uc09-etl | stlc/etl-testing.v1.md | ETL Testing Agent | mapping spec | artifacts/reports/etl-*.md |
| uc10-perf | stlc/performance-testing.v1.md | Performance Testing Agent | SLA/SLO + journey | artifacts/reports/performance-*.md |

Catalog: `docs/STLC-AGENTS-CATALOG.md`. Load **one** prompt per stage. Never paste full snapshots or full PBI HTML into chat.
