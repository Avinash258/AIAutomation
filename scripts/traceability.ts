import fs from 'node:fs';
import path from 'node:path';
import { ManualCaseBundleSchema } from '../src/schema/testcase.js';

/** Build PBI -> AC -> Case -> Spec matrix from artifacts. */
function main() {
  const casesFile = path.resolve('artifacts/testcases/latest.json');
  if (!fs.existsSync(casesFile)) {
    console.error(JSON.stringify({ error: 'missing_cases', open_questions: ['Generate cases first'] }));
    process.exit(1);
  }
  const bundle = ManualCaseBundleSchema.parse(JSON.parse(fs.readFileSync(casesFile, 'utf8')));
  const genDir = path.resolve('tests/generated');
  const specs = fs.existsSync(genDir)
    ? fs.readdirSync(genDir).filter((f) => f.endsWith('.spec.ts'))
    : [];

  const rows = bundle.cases.map((c) => {
    const tag = `@${c.acRef}`.replace(/\s+/g, '');
    const pbiTag = `@PBI-${c.pbiId}`;
    const matched = specs.filter((s) => {
      const text = fs.readFileSync(path.join(genDir, s), 'utf8');
      return text.includes(c.id) || text.includes(tag) || text.includes(pbiTag);
    });
    return {
      pbiId: c.pbiId,
      acRef: c.acRef,
      caseId: c.id,
      title: c.title,
      specs: matched,
    };
  });

  const out = path.resolve('artifacts/reports/traceability.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ pbiId: bundle.pbiId, rows }, null, 2));
  console.log(JSON.stringify({ path: out, rows: rows.length }, null, 2));
}

main();
