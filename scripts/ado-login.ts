/**
 * Interactive browser login to Microsoft Entra for Azure DevOps API access.
 * No PAT. Opens the system browser (or device-code prompt).
 *
 *   npm run ai:ado-login
 */
import dotenv from 'dotenv';
import { ensureAdoBrowserLogin } from '../src/ado/auth.js';

dotenv.config();

async function main() {
  const mode = process.env.ADO_AUTH_MODE ?? 'browser';
  console.log(
    JSON.stringify({
      message: 'Starting Azure DevOps browser login (no PAT)',
      mode,
      tip: 'Sign in with the account that can read PBIs / manage Test Plans',
    }),
  );
  const result = await ensureAdoBrowserLogin();
  console.log(JSON.stringify({ ...result, next: 'npm run ai:fetch-pbi -- <pbiId>' }, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
