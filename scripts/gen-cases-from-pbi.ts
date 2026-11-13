/**
 * Deterministic starter cases from AC list (boilerplate).
 * Copilot testcase-generator should enrich; this unblocks GATE (a) offline.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { CompactPbi } from '../src/ado/pbi.js';
import { ManualCaseBundleSchema, type ManualCase } from '../src/schema/testcase.js';
import { logUsage } from '../src/usage/logger.js';

function main() {
  const pbiPath = path.resolve(process.argv[2] ?? 'artifacts/pbi/latest.json');
  if (!fs.existsSync(pbiPath)) {
    console.error(
      JSON.stringify({
        error: 'missing_pbi',
        open_questions: ['Run npm run ai:fetch-pbi or npm run ai:load-sample-pbi first'],
      }),
    );
    process.exit(1);
  }

  const pbi = JSON.parse(fs.readFileSync(pbiPath, 'utf8')) as CompactPbi;
  const cases: ManualCase[] = [];
  let n = 1;
  for (const ac of pbi.acceptanceCriteriaList) {
    const acRef = ac.match(/^(AC\d+)/i)?.[1] ?? `AC${n}`;
    const base = ac.replace(/^AC\d+:\s*/i, '');
    cases.push({
      id: `TC-${String(n).padStart(3, '0')}`,
      title: `Happy path — ${base.slice(0, 80)}`,
      pbiId: pbi.id,
      acRef,
      priority: pbi.priority && pbi.priority <= 2 ? 'P0' : 'P1',
      type: 'positive',
      preconditions: ['App reachable on allowlisted UI_BASE_URL', 'Test user available if auth required'],
      steps: [
        { action: `Navigate to the feature under test for: ${base}`, expected: 'Page loads without error' },
        { action: 'Perform the primary user action described by the AC', expected: 'Outcome matches AC' },
      ],
      testData: {},
      automationCandidate: true,
      layer: 'ui',
    });
    n += 1;
    cases.push({
      id: `TC-${String(n).padStart(3, '0')}`,
      title: `Negative / validation — ${base.slice(0, 70)}`,
      pbiId: pbi.id,
      acRef,
      priority: 'P1',
      type: 'negative',
      preconditions: ['App reachable'],
      steps: [
        { action: 'Attempt the flow with invalid or missing required input', expected: 'Clear validation or error; no unauthorized state change' },
      ],
      testData: {},
      automationCandidate: true,
      layer: 'ui',
    });
    n += 1;
  }

  const bundle = ManualCaseBundleSchema.parse({
    pbiId: pbi.id,
    pbiTitle: pbi.title,
    cases,
    open_questions: [
      'Review/enrich cases with Copilot /gen-cases before ADO publish',
      'Confirm GATE (a) approval before npm run ai:publish-plan -- --apply',
    ],
    contentHash: createHash('sha256').update(JSON.stringify(cases)).digest('hex').slice(0, 16),
  });

  const out = path.resolve('artifacts/testcases/latest.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(bundle, null, 2));
  logUsage({
    agent: 'testcase-generator',
    phase: 'gen-cases-boilerplate',
    inputChars: JSON.stringify(pbi.acceptanceCriteriaList).length,
    outputChars: JSON.stringify(bundle).length,
    notes: out,
  });
  console.log(
    JSON.stringify(
      {
        path: out,
        caseCount: cases.length,
        gate: 'a',
        message: 'Review artifacts/testcases/latest.json before publish',
        open_questions: bundle.open_questions,
      },
      null,
      2,
    ),
  );
}

main();
