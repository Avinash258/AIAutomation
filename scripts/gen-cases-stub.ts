/**
 * Deterministic scaffold for case artifact path. LLM (testcase-generator agent)
 * fills cases using prompt-library/testcase/design-cases.v1.md.
 * This script only validates env + writes an empty shell if missing.
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

function main() {
  const pbiId = Number(process.argv[2] ?? process.env.ADO_PBI_ID);
  const pbiPath = path.resolve(`artifacts/pbi/${pbiId}.json`);
  const out = path.resolve('artifacts/testcases/latest.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });

  if (!Number.isFinite(pbiId) || !fs.existsSync(pbiPath)) {
    console.error(
      JSON.stringify({
        error: 'missing_pbi_artifact',
        open_questions: ['Run npm run ai:fetch-pbi -- <id> first'],
      }),
    );
    process.exit(1);
  }

  if (fs.existsSync(out)) {
    console.log(JSON.stringify({ ok: true, path: out, note: 'exists — agent should update via prompt' }));
    return;
  }

  const pbi = JSON.parse(fs.readFileSync(pbiPath, 'utf8')) as { id: number; title: string };
  const shell = {
    pbiId: pbi.id,
    pbiTitle: pbi.title,
    cases: [],
    open_questions: [
      'Use Copilot agent testcase-generator with prompt-library/testcase/design-cases.v1.md to fill cases',
    ],
  };
  fs.writeFileSync(out, JSON.stringify(shell, null, 2));
  console.log(JSON.stringify({ ok: true, path: out, createdShell: true }));
}

main();
