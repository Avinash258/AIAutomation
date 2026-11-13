import dotenv from 'dotenv';
import { AdoClient, loadAdoConfig } from '../src/ado/client.js';
import { fetchPbi, fetchPbis, writePbiArtifact } from '../src/ado/pbi.js';
import { logUsage } from '../src/usage/logger.js';
import { log } from '../src/logging/logger.js';

dotenv.config();

function parseIds(): number[] {
  const fromArgs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (fromArgs.length) {
    return fromArgs.join(',')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
  }
  const env = process.env.ADO_PBI_ID ?? '';
  return env
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
}

async function main() {
  const ids = parseIds();
  if (!ids.length) {
    console.error(
      JSON.stringify({
        error: 'missing_pbi_id',
        open_questions: [
          'Provide PBI ID(s): npm run ai:fetch-pbi -- <id>[,id2] or set ADO_PBI_ID',
        ],
      }),
    );
    process.exit(1);
  }

  const client = new AdoClient(loadAdoConfig());
  const pbis = ids.length === 1 ? [await fetchPbi(client, ids[0])] : await fetchPbis(client, ids);

  const summaries = [];
  for (const pbi of pbis) {
    const { path: out, cacheHit } = writePbiArtifact(pbi);
    logUsage({
      agent: 'ado-reader',
      phase: 'fetch-pbi',
      inputChars: 48,
      outputChars: JSON.stringify(pbi).length,
      cacheHit,
      notes: out,
    });
    summaries.push({
      id: pbi.id,
      rev: pbi.rev,
      title: pbi.title,
      acCount: pbi.acceptanceCriteriaList.length,
      cacheHit,
      path: out,
    });
    log('info', 'pbi_fetched', summaries[summaries.length - 1]);
  }

  console.log(JSON.stringify({ count: summaries.length, items: summaries, open_questions: [] }, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
