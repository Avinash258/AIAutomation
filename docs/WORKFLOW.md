# M1 Workflow & Architecture

STLC agents (UC-01..UC-10): see [`STLC-AGENTS-CATALOG.md`](./STLC-AGENTS-CATALOG.md).

## End-to-end pipeline

```mermaid
flowchart TD
  Start[User_or_Copilot] --> Login[ai:ado-login_browser]
  Login --> Fetch[ai:fetch-pbi]
  Fetch --> PbiJson[artifacts/pbi/id.json]
  PbiJson --> DeriveAC[Derive_AC_if_empty]
  DeriveAC --> GenCases[ai:gen-cases]
  GenCases --> Cases[artifacts/testcases/latest.json]
  Cases --> GateA{GATE_a_approve_cases}
  GateA -->|no| GenCases
  GateA -->|yes| DryRun[ai:publish-plan_dry-run]
  DryRun --> Apply[ai:publish-plan_apply]
  Apply --> AskUrl[Ask_UI_URL]
  AskUrl --> Analyze[ai:analyze-site]
  Analyze --> PageModel[artifacts/page-model]
  PageModel --> GateB{GATE_b_approve_specs}
  GateB -->|no| PageModel
  GateB -->|yes| Specs[tests/generated]
  Specs --> Run[npx_playwright_test]
  Run --> Heal[ai:heal-context_max_2]
  Heal --> Trace[ai:traceability]
  Trace --> Usage[ai:usage]
```

## ADO browser auth (no PAT)

```mermaid
sequenceDiagram
  participant User
  participant Script as ai:ado-login
  participant Entra as Microsoft_Entra
  participant API as ADO_REST_API

  User->>Script: npm run ai:ado-login
  Script->>Entra: InteractiveBrowserCredential
  Entra-->>User: Browser sign-in
  User->>Entra: Complete login
  Entra-->>Script: Access token Bearer
  Script->>API: Authorization Bearer token
  Note over Script,API: fetch-pbi / publish-plan reuse cached token
```

| Mode (`ADO_AUTH_MODE`) | Behavior |
|------------------------|----------|
| `browser` (default) | Opens system browser via `@azure/identity` |
| `device-code` | Prints code; user completes login in any browser |
| `az-cli` | Uses `az login` + `az account get-access-token` |

**Never use `ADO_PAT`.** On HTTP 401, agents re-run `npm run ai:ado-login`.

## Copilot asset map

```mermaid
flowchart LR
  subgraph prompts [.github/prompts]
    P1[ado-login]
    P2[ado-fetch]
    P3[gen-cases]
    P4[publish-plan]
    P5[analyze-site]
    P6[gen-specs]
    P7[run-flow]
  end

  subgraph agents [.github/agents]
    A1[ado-reader]
    A2[testcase-generator]
    A3[site-analyzer]
    A4[script-generator]
    A5[qa-orchestrator]
  end

  subgraph skills [.github/skills]
    S1[ado-pbi]
    S2[testcase-gen]
    S3[playwright-cli]
    S4[site-analyze]
    S5[self-heal]
  end

  subgraph lib [prompt-library]
    L1[ado/]
    L2[testcase/]
    L3[site/]
    L4[codegen/]
    L5[heal/]
  end

  P1 --> A1
  P2 --> A1
  P3 --> A2
  P4 --> A5
  P5 --> A3
  P6 --> A4
  P7 --> A5
  A1 --> S1
  A2 --> S2
  A3 --> S3
  A3 --> S4
  A4 --> S5
  A1 --> L1
  A2 --> L2
  A3 --> L3
  A4 --> L4
```

| Prompt | Agent | Skill / library |
|--------|-------|-----------------|
| `/ado-login` | ado-reader | ado-pbi + `ai:ado-login` |
| `/ado-fetch` | ado-reader | ado-pbi → `ado/fetch-pbi.v1.md` |
| `/gen-cases` | testcase-generator | testcase-gen → `testcase/design-cases.v1.md` |
| `/publish-plan` | qa-orchestrator | `ado/publish-plan.v1.md` |
| `/analyze-site` | site-analyzer | playwright-cli, site-analyze |
| `/gen-specs` | script-generator | `codegen/playwright-ui-spec.v1.md` |
| `/run-flow` | qa-orchestrator | `testcase/run-flow.v1.md` |

## Artifacts

```mermaid
flowchart TB
  subgraph artifacts [artifacts/]
    PBI[pbi/]
    TC[testcases/]
    SNAP[snapshots/]
    PM[page-model/]
    REP[reports/]
  end
  PBI --> TC
  SNAP --> PM
  TC --> REP
  PM --> Specs[tests/generated]
  TC --> Specs
  Specs --> REP
```

| Path | Producer | Consumer |
|------|----------|----------|
| `artifacts/pbi/{id}.json` | `ai:fetch-pbi` | case design |
| `artifacts/testcases/latest.json` | `ai:gen-cases` / Copilot | publish, codegen, traceability |
| `artifacts/snapshots/*.yml` | Playwright CLI | prune script only |
| `artifacts/page-model/*.json` | `ai:analyze-site` | script-generator |
| `artifacts/reports/publish-result.json` | `ai:publish-plan` | human review |
| `artifacts/reports/traceability.json` | `ai:traceability` | DoD evidence |
| `artifacts/usage.json` | all `ai:*` scripts | token savings check |

## Human gates

| Gate | When | Stop until |
|------|------|------------|
| **GATE (a)** | After `artifacts/testcases/latest.json` is ready | User approves cases before `--apply` publish |
| **GATE (b)** | After page-model, before writing specs | User approves planned files under `tests/generated/` |

## CI vs generation

| Phase | LLM? | Command |
|-------|------|---------|
| Explore / design / publish assist | Yes (Copilot) | agents + `ai:*` scripts |
| Test execution | **No** | `npx playwright test` |
| Self-heal assist | Yes (narrow) | `ai:heal-context` → max 2 safe fixes |

## Example: PBI 61

1. `npm run ai:ado-login`
2. `npm run ai:fetch-pbi -- 61`
3. If AC field empty → derive from **Expected** in description
4. `npm run ai:gen-cases` → GATE (a)
5. Dry-run publish → set `ADO_TEST_PLAN_ID` / `ADO_TEST_SUITE_ID` → `--apply`
6. `npm run ai:analyze-site -- <UI_BASE_URL>` → GATE (b) → specs → run

## Related docs

- [README.md](../README.md) — setup & commands  
- [copilot-instructions.md](../.github/copilot-instructions.md) — always-on Copilot rules  
- [prompt-library/INDEX.md](../prompt-library/INDEX.md) — prompt catalog  
