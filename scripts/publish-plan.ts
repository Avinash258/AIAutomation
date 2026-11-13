import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { AdoClient, loadAdoConfig } from '../src/ado/client.js';
import {
  addToSuite,
  aiTag,
  caseContentHash,
  linkTestsPbi,
  upsertTestCase,
  type PublishResult,
} from '../src/ado/testplan.js';
import { ManualCaseBundleSchema } from '../src/schema/testcase.js';
import { logUsage } from '../src/usage/logger.js';
import { log } from '../src/logging/logger.js';

dotenv.config();

async function main() {
  const apply = process.argv.includes('--apply');
  const dryRun = !apply && (process.argv.includes('--dry-run') || process.env.ADO_PUBLISH_DRY_RUN !== 'false');

  const fileArg = process.argv.find((a) => a.endsWith('.json') && !a.startsWith('-'));
  const file = path.resolve(fileArg ?? 'artifacts/testcases/latest.json');
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

  const bundle = ManualCaseBundleSchema.parse(JSON.parse(fs.readFileSync(file, 'utf8')));
  const planId = Number(process.env.ADO_TEST_PLAN_ID);
  const suiteId = Number(process.env.ADO_TEST_SUITE_ID);
  const open_questions: string[] = [];

  if (!dryRun && (!planId || !suiteId)) {
    console.error(
      JSON.stringify({
        error: 'missing_plan_suite',
        open_questions: ['Set ADO_TEST_PLAN_ID and ADO_TEST_SUITE_ID, or say create new'],
        dryRun,
      }),
    );
    process.exit(1);
  }
  if (dryRun && (!planId || !suiteId)) {
    open_questions.push('Set ADO_TEST_PLAN_ID and ADO_TEST_SUITE_ID before --apply');
  }

  const results: PublishResult[] = [];

  if (dryRun) {
    for (const c of bundle.cases) {
      const hash = caseContentHash(c);
      results.push({
        localId: c.id,
        tag: aiTag(c.pbiId, hash),
        action: 'dry-run-create',
      });
    }
  } else {
    const client = new AdoClient(loadAdoConfig());
    for (const c of bundle.cases) {
      const r = await upsertTestCase(client, c, false);
      if (r.adoId) {
        await addToSuite(client, planId, suiteId, r.adoId);
        await linkTestsPbi(client, r.adoId, c.pbiId);
      }
      results.push(r);
    }
  }

  const out = path.resolve('artifacts/reports/publish-result.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(
    out,
    JSON.stringify({ dryRun, planId: planId || null, suiteId: suiteId || null, results, open_questions }, null, 2),
  );
  logUsage({
    agent: 'ado-publisher',
    phase: 'publish-plan',
    inputChars: fs.readFileSync(file, 'utf8').length,
    outputChars: JSON.stringify(results).length,
    notes: out,
  });
  log('info', 'publish_complete', { dryRun, count: results.length, path: out });
  console.log(
    JSON.stringify({ dryRun, count: results.length, path: out, open_questions }, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
