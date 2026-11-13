import { execFileSync } from 'node:child_process';
import { InteractiveBrowserCredential, DeviceCodeCredential } from '@azure/identity';
import { log } from '../logging/logger.js';

/** Azure DevOps resource app id */
export const ADO_RESOURCE = '499b84ac-1321-427f-aa17-267ca6975798';
const ADO_SCOPE = `${ADO_RESOURCE}/.default`;

export type AdoAuthMode = 'browser' | 'device-code' | 'az-cli';

let cachedToken: { token: string; expiresOnTimestamp: number } | undefined;

function authMode(): AdoAuthMode {
  const m = (process.env.ADO_AUTH_MODE ?? 'browser').toLowerCase();
  if (m === 'device-code' || m === 'az-cli' || m === 'browser') return m;
  return 'browser';
}

function fromAzCli(): string {
  try {
    const raw = execFileSync(
      'az',
      ['account', 'get-access-token', '--resource', ADO_RESOURCE, '-o', 'json'],
      { encoding: 'utf8' },
    );
    const json = JSON.parse(raw) as { accessToken?: string };
    if (!json.accessToken) throw new Error('az returned no accessToken');
    return json.accessToken;
  } catch (e) {
    throw new Error(
      JSON.stringify({
        error: 'az_cli_token_failed',
        open_questions: [
          'Install Azure CLI, run: npm run ai:ado-login',
          'Or set ADO_AUTH_MODE=browser (default)',
        ],
        detail: e instanceof Error ? e.message : String(e),
      }),
    );
  }
}

async function fromInteractiveBrowser(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID || undefined;
  const credential = new InteractiveBrowserCredential({
    tenantId,
    redirectUri: 'http://localhost',
  });
  const result = await credential.getToken(ADO_SCOPE);
  if (!result?.token) {
    throw new Error(
      JSON.stringify({
        error: 'browser_login_failed',
        open_questions: ['Complete the browser sign-in when the window opens'],
      }),
    );
  }
  cachedToken = {
    token: result.token,
    expiresOnTimestamp: result.expiresOnTimestamp,
  };
  return result.token;
}

async function fromDeviceCode(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID || undefined;
  const credential = new DeviceCodeCredential({
    tenantId,
    userPromptCallback: (info) => {
      console.log(info.message);
    },
  });
  const result = await credential.getToken(ADO_SCOPE);
  if (!result?.token) {
    throw new Error(
      JSON.stringify({
        error: 'device_code_failed',
        open_questions: ['Complete device-code login in the browser using the printed code'],
      }),
    );
  }
  cachedToken = {
    token: result.token,
    expiresOnTimestamp: result.expiresOnTimestamp,
  };
  return result.token;
}

/**
 * Acquire Azure DevOps Bearer token via browser login (default). No PAT.
 * Modes: browser (InteractiveBrowserCredential) | device-code | az-cli
 */
export async function getAdoAccessToken(forceRefresh = false): Promise<string> {
  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresOnTimestamp > Date.now() + 60_000
  ) {
    return cachedToken.token;
  }

  const mode = authMode();
  log('info', 'ado_auth_start', { mode });

  if (mode === 'az-cli') {
    const token = fromAzCli();
    cachedToken = { token, expiresOnTimestamp: Date.now() + 50 * 60_000 };
    return token;
  }
  if (mode === 'device-code') {
    return fromDeviceCode();
  }
  return fromInteractiveBrowser();
}

export async function ensureAdoBrowserLogin(): Promise<{ ok: true; mode: AdoAuthMode }> {
  const mode = authMode();
  if (mode === 'az-cli') {
    try {
      execFileSync('az', ['login', '--allow-no-subscriptions'], { stdio: 'inherit' });
    } catch {
      throw new Error(
        JSON.stringify({
          error: 'az_login_failed',
          open_questions: ['Install Azure CLI from https://aka.ms/installazurecliwindows then retry'],
        }),
      );
    }
    fromAzCli();
    return { ok: true, mode };
  }
  await getAdoAccessToken(true);
  return { ok: true, mode };
}
