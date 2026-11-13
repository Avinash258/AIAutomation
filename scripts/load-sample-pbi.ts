import fs from 'node:fs';
import path from 'node:path';
import { writePbiArtifact, type CompactPbi } from '../src/ado/pbi.js';

/** Offline demo when ADO credentials are not yet available. */
function main() {
  const sample = path.resolve('fixtures/sample-pbi.json');
  const pbi = JSON.parse(fs.readFileSync(sample, 'utf8')) as CompactPbi;
  const { path: out } = writePbiArtifact(pbi);
  console.log(JSON.stringify({ ok: true, path: out, id: pbi.id, mode: 'sample' }, null, 2));
}

main();
