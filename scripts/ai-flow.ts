/**
 * M1 orchestrator entry: npm run ai:flow -- --pbi 12345
 * Stops at human gates; does not invent URL/ADO values.
 */
import dotenv from 'dotenv';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

function run(cmd: string, args: string[]): number {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  return r.status ?? 1;
}

function main() {
  const pbiIdx = process.argv.indexOf('--pbi');
  const pbi = pbiIdx >= 0 ? process.argv[pbiIdx + 1] : process.env.ADO_PBI_ID;
  const open_questions: string[] = [];

  if (!pbi) open_questions.push('Pass --pbi <id> or set ADO_PBI_ID');
  if (!process.env.ADO_ORG) open_questions.push('Set ADO_ORG');
  if (!process.env.ADO_PROJECT) open_questions.push('Set ADO_PROJECT');
  if (!process.env.UI_BASE_URL) open_questions.push('Set UI_BASE_URL or pass URL at analyze step');
  if (!process.env.ALLOWED_BASE_URLS) open_questions.push('Set ALLOWED_BASE_URLS');

  if (open_questions.length) {
    console.log(JSON.stringify({ phase: 'preflight', open_questions }, null, 2));
    process.exit(1);
  }

  if (run('npm', ['run', 'ai:fetch-pbi', '--', String(pbi)]) !== 0) process.exit(1);
  if (run('npm', ['run', 'ai:gen-cases', '--', String(pbi)]) !== 0) process.exit(1);

  console.log(
    JSON.stringify(
      {
        gate: 'a',
        message: 'Review artifacts/testcases/latest.json then approve ADO publish',
        next: [
          'Fill cases via Copilot /gen-cases if shell is empty',
          'npm run ai:validate-cases',
          'npm run ai:publish-plan -- --dry-run',
          'After approval: npm run ai:publish-plan -- --apply',
          'Then: npm run ai:analyze-site -- <url>',
          'GATE b before codegen; then npx playwright test',
        ],
      },
      null,
      2,
    ),
  );

  const reportDir = path.resolve('artifacts/reports');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, 'flow-status.json'),
    JSON.stringify({ pbi, stoppedAt: 'gate-a', ts: new Date().toISOString() }, null, 2),
  );
}

main();
