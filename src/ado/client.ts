import { log } from '../logging/logger.js';
import { getAdoAccessToken } from './auth.js';

export type AdoConfig = {
  org: string;
  project: string;
};

export function loadAdoConfig(): AdoConfig {
  const org = process.env.ADO_ORG ?? '';
  const project = process.env.ADO_PROJECT ?? '';
  const missing: string[] = [];
  if (!org) missing.push('ADO_ORG');
  if (!project) missing.push('ADO_PROJECT');
  if (missing.length) {
    throw new Error(
      JSON.stringify({
        error: 'missing_ado_env',
        open_questions: [
          ...missing.map((m) => `Set ${m} in .env`),
          'Run npm run ai:ado-login once (browser) — no PAT required',
        ],
      }),
    );
  }
  return { org, project };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export class AdoClient {
  readonly org: string;
  readonly project: string;
  readonly base: string;

  constructor(cfg: AdoConfig) {
    this.org = cfg.org;
    this.project = cfg.project;
    this.base = `https://dev.azure.com/${encodeURIComponent(cfg.org)}/${encodeURIComponent(cfg.project)}`;
  }

  private async authHeader(): Promise<string> {
    const token = await getAdoAccessToken();
    return `Bearer ${token}`;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    opts?: { apiVersion?: string; contentType?: string; retries?: number },
  ): Promise<T> {
    const apiVersion = opts?.apiVersion ?? '7.1';
    const retries = opts?.retries ?? 3;
    const url = path.startsWith('http')
      ? path
      : `${this.base}${path}${path.includes('?') ? '&' : '?'}api-version=${apiVersion}`;

    let lastErr: Error | undefined;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const authorization = await this.authHeader();
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: authorization,
          Accept: 'application/json',
          'Content-Type': opts?.contentType ?? 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      if (res.status === 401 && attempt < retries) {
        log('warn', 'ado_unauthorized_refresh', { attempt });
        await getAdoAccessToken(true);
        continue;
      }

      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const backoff = Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt;
        lastErr = new Error(`ADO ${method} ${url} → ${res.status}`);
        log('warn', 'ado_retry', { status: res.status, attempt, backoff });
        await sleep(backoff);
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`ADO ${method} ${url} → ${res.status}: ${text.slice(0, 500)}`);
      }
      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    }
    throw lastErr ?? new Error('ADO request failed');
  }

  async patchWorkItem<T = unknown>(
    idOrType: string | number,
    operations: unknown[],
    create = false,
  ): Promise<T> {
    const path = create
      ? `/_apis/wit/workitems/$${encodeURIComponent(String(idOrType))}`
      : `/_apis/wit/workitems/${idOrType}`;
    return this.request<T>(create ? 'POST' : 'PATCH', path, operations, {
      contentType: 'application/json-patch+json',
    });
  }

  async getWorkItems(ids: number[]): Promise<
    Array<{ id: number; rev: number; fields: Record<string, unknown>; relations?: unknown[] }>
  > {
    const unique = [...new Set(ids.filter((n) => Number.isFinite(n)))];
    const out: Array<{
      id: number;
      rev: number;
      fields: Record<string, unknown>;
      relations?: unknown[];
    }> = [];
    for (let i = 0; i < unique.length; i += 200) {
      const chunk = unique.slice(i, i + 200);
      if (!chunk.length) continue;
      const page = await this.request<{ value: typeof out }>(
        'GET',
        `/_apis/wit/workitems?ids=${chunk.join(',')}&$expand=relations`,
      );
      out.push(...(page.value ?? []));
    }
    return out;
  }
}
