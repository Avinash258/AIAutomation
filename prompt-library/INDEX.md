# Prompt library (M1)

| id | path | agent | requiredArtifacts | producesArtifacts |
|----|------|-------|-------------------|-------------------|
| ado-login | (script `ai:ado-login`) | ado-reader | ADO_ORG/PROJECT | Entra browser session |
| ado-fetch | ado/fetch-pbi.v1.md | ado-reader | browser auth + ADO_ORG/PROJECT | artifacts/pbi/{id}.json |
| design-cases | testcase/design-cases.v1.md | testcase-generator | artifacts/pbi/{id}.json | artifacts/testcases/latest.json |
| publish-plan | ado/publish-plan.v1.md | qa-orchestrator | artifacts/testcases/latest.json | artifacts/reports/publish-result.json |
| analyze-site | site/analyze-url.v1.md | site-analyzer | UI URL + allowlist | artifacts/page-model/{page}.json |
| gen-specs | codegen/playwright-ui-spec.v1.md | script-generator | page-model + cases | tests/generated/*.spec.ts |
| self-heal | heal/self-heal-ui.v1.md | script-generator | heal-context.json | patched spec or bug report |
| run-flow | testcase/run-flow.v1.md | qa-orchestrator | env + pbi | gate status |

Load **one** prompt per stage. Never paste full snapshots or full PBI HTML into chat.
