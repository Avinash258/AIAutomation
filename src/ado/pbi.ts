import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { AdoClient } from './client.js';
import { readCacheHash, writeCacheHash } from '../analyze/hash-cache.js';

export type CompactPbi = {
  id: number;
  rev: number;
  type: string;
  title: string;
  state: string;
  description: string;
  acceptanceCriteria: string;
  acceptanceCriteriaList: string[];
  priority?: number;
  tags: string[];
  areaPath?: string;
  iterationPath?: string;
  parent?: { id: number; title: string; type: string };
  contentHash: string;
};

export function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitAcceptanceCriteria(text: string): string[] {
  if (!text) return [];
  const byBullet = text
    .split(/\r?\n|•|\u2022|(?:^|\s)(?:\d+[\).]|[-*])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  if (byBullet.length > 1) return byBullet.slice(0, 40);

  const byKeyword = text
    .split(/(?=\b(?:AC\s*\d+|Given|When|Then)\b)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  if (byKeyword.length) return byKeyword.slice(0, 40);

  return text.match(/.{1,200}(?:\s|$)/g)?.map((s) => s.trim()).filter(Boolean).slice(0, 20) ?? [
    text,
  ];
}

type WorkItem = {
  id: number;
  rev: number;
  fields: Record<string, unknown>;
  relations?: Array<{ rel: string; url: string }>;
};

/** When AC field is empty (common on bugs/issues), derive from Expected/Problem in description. */
export function deriveAcceptanceCriteria(
  description: string,
  acceptanceCriteria: string,
): string[] {
  if (acceptanceCriteria.trim()) {
    return splitAcceptanceCriteria(acceptanceCriteria).map((line, i) =>
      /^AC\s*\d+/i.test(line) ? line : `AC${i + 1}: ${line}`,
    );
  }

  const expected = description.match(/Expected:\s*(.+?)(?:\s+Actual:|$)/i)?.[1]?.trim();
  const problem = description.match(/Problem:\s*(.+?)(?:\s+Expected:|$)/i)?.[1]?.trim();
  const list: string[] = [];
  if (expected) list.push(`AC1: ${expected}`);
  if (problem) list.push(`AC2: Reproduce and confirm problem — ${problem.slice(0, 180)}`);
  if (expected) {
    list.push('AC3: Negative — legacy codes RPAM/TIM must not appear on INFO lines when headers show ALC/TAX');
  }
  return list;
}

function toCompact(wi: WorkItem, parent?: CompactPbi['parent']): CompactPbi {
  const fields = wi.fields;
  const description = stripHtml(fields['System.Description'] as string | undefined);
  const acceptanceCriteria = stripHtml(
    fields['Microsoft.VSTS.Common.AcceptanceCriteria'] as string | undefined,
  );
  const list = deriveAcceptanceCriteria(description, acceptanceCriteria);

  const compact: CompactPbi = {
    id: wi.id,
    rev: wi.rev,
    type: String(fields['System.WorkItemType'] ?? ''),
    title: String(fields['System.Title'] ?? ''),
    state: String(fields['System.State'] ?? ''),
    description,
    acceptanceCriteria,
    acceptanceCriteriaList: list,
    priority: fields['Microsoft.VSTS.Common.Priority'] as number | undefined,
    tags: String(fields['System.Tags'] ?? '')
      .split(';')
      .map((t) => t.trim())
      .filter(Boolean),
    areaPath: fields['System.AreaPath'] as string | undefined,
    iterationPath: fields['System.IterationPath'] as string | undefined,
    parent,
    contentHash: '',
  };

  compact.contentHash = createHash('sha256')
    .update(
      JSON.stringify({
        id: compact.id,
        rev: compact.rev,
        title: compact.title,
        acceptanceCriteria,
      }),
    )
    .digest('hex');
  return compact;
}

export async function fetchPbi(client: AdoClient, id: number): Promise<CompactPbi> {
  const wi = await client.request<WorkItem>(
    'GET',
    `/_apis/wit/workitems/${id}?$expand=relations`,
  );

  let parent: CompactPbi['parent'];
  const parentRel = (wi.relations ?? []).find((r) => r.rel.includes('Hierarchy-Reverse'));
  if (parentRel) {
    const parentId = Number(parentRel.url.split('/').pop());
    if (parentId) {
      const [p] = await client.getWorkItems([parentId]);
      if (p) {
        parent = {
          id: p.id,
          title: String(p.fields['System.Title'] ?? ''),
          type: String(p.fields['System.WorkItemType'] ?? ''),
        };
      }
    }
  }

  return toCompact(wi, parent);
}

export async function fetchPbis(client: AdoClient, ids: number[]): Promise<CompactPbi[]> {
  const results: CompactPbi[] = [];
  for (const id of ids) {
    results.push(await fetchPbi(client, id));
  }
  return results;
}

export function writePbiArtifact(pbi: CompactPbi): { path: string; cacheHit: boolean } {
  const outDir = path.resolve('artifacts/pbi');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${pbi.id}.json`);
  const latest = path.join(outDir, 'latest.json');
  const cacheKey = `pbi-${pbi.id}`;
  const prev = readCacheHash(cacheKey);
  const cacheHit = prev === pbi.contentHash;
  const payload = JSON.stringify(pbi, null, 2);
  fs.writeFileSync(out, payload);
  fs.writeFileSync(latest, payload);
  writeCacheHash(cacheKey, pbi.contentHash);
  return { path: out, cacheHit };
}
