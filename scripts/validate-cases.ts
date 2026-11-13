import fs from 'node:fs';
import path from 'node:path';
import { ManualCaseBundleSchema, flattenCases } from '../src/schema/testcase.js';

function main() {
  const file = path.resolve(process.argv[2] ?? 'artifacts/testcases/latest.json');
  if (!fs.existsSync(file)) {
    console.error(JSON.stringify({ error: 'missing_file', path: file }));
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const parsed = ManualCaseBundleSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(JSON.stringify({ error: 'schema_invalid', issues: parsed.error.issues }));
    process.exit(1);
  }
  const cases = flattenCases(parsed.data);
  const acMissing = cases.filter((c) => !c.acRef);
  console.log(
    JSON.stringify({
      ok: true,
      path: file,
      scenarioCount: parsed.data.scenarios?.length ?? 0,
      caseCount: cases.length,
      open_questions: parsed.data.open_questions,
      acMissing: acMissing.map((c) => c.id),
    }),
  );
}

main();
