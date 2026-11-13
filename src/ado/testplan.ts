import { createHash } from 'node:crypto';
import { AdoClient } from './client.js';
import type { ManualCase } from '../schema/testcase.js';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build Microsoft.VSTS.TCM.Steps XML from manual case steps. */
export function buildStepsXml(steps: Array<{ action: string; expected: string }>): string {
  const parts = steps.map((s, i) => {
    return `<step id="${i + 1}" type="ActionStep"><parameterizedString isformatted="true">${escapeXml(s.action)}</parameterizedString><parameterizedString isformatted="true">${escapeXml(s.expected)}</parameterizedString><description/></step>`;
  });
  return `<steps id="0" last="${parts.length}">${parts.join('')}</steps>`;
}

export function caseContentHash(c: ManualCase): string {
  return createHash('sha256')
    .update(JSON.stringify({ title: c.title, steps: c.steps, acRef: c.acRef, type: c.type }))
    .digest('hex')
    .slice(0, 12);
}

export function aiTag(pbiId: number, hash: string): string {
  return `AI-${pbiId}-${hash}`;
}

type WiQueryResult = { workItems: Array<{ id: number }> };

export async function findCaseByAiTag(client: AdoClient, tag: string): Promise<number | undefined> {
  const wiql = {
    query: `SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'Test Case' AND [System.Tags] CONTAINS '${tag.replace(/'/g, "''")}'`,
  };
  const result = await client.request<WiQueryResult>('POST', `/_apis/wit/wiql`, wiql);
  return result.workItems[0]?.id;
}

export type PublishResult = {
  localId: string;
  adoId?: number;
  tag: string;
  action: 'create' | 'update' | 'dry-run-create' | 'dry-run-update';
};

export async function upsertTestCase(
  client: AdoClient,
  c: ManualCase,
  dryRun: boolean,
): Promise<PublishResult> {
  const hash = caseContentHash(c);
  const tag = aiTag(c.pbiId, hash);
  const existingId = await findCaseByAiTag(client, tag);

  const tags = [
    tag,
    `PBI-${c.pbiId}`,
    c.acRef,
    c.priority,
    c.type,
    'layer:ui',
    c.automationCandidate ? 'automationCandidate' : 'manualOnly',
  ].join('; ');

  const fields = [
    { op: 'add', path: '/fields/System.Title', value: `[${c.id}] ${c.title}` },
    { op: 'add', path: '/fields/Microsoft.VSTS.TCM.Steps', value: buildStepsXml(c.steps) },
    { op: 'add', path: '/fields/System.Tags', value: tags },
  ];

  if (dryRun) {
    return {
      localId: c.id,
      adoId: existingId,
      tag,
      action: existingId ? 'dry-run-update' : 'dry-run-create',
    };
  }

  if (existingId) {
    await client.patchWorkItem(existingId, [
      { op: 'replace', path: '/fields/System.Title', value: `[${c.id}] ${c.title}` },
      { op: 'replace', path: '/fields/Microsoft.VSTS.TCM.Steps', value: buildStepsXml(c.steps) },
      { op: 'replace', path: '/fields/System.Tags', value: tags },
    ]);
    return { localId: c.id, adoId: existingId, tag, action: 'update' };
  }

  const created = await client.patchWorkItem<{ id: number }>('Test Case', fields, true);
  return { localId: c.id, adoId: created.id, tag, action: 'create' };
}

export async function addToSuite(
  client: AdoClient,
  planId: number,
  suiteId: number,
  testCaseId: number,
): Promise<void> {
  await client.request('POST', `/_apis/testplan/Plans/${planId}/Suites/${suiteId}/TestCase`, [
    { workItem: { id: testCaseId } },
  ]);
}

export async function linkTestsPbi(
  client: AdoClient,
  testCaseId: number,
  pbiId: number,
): Promise<void> {
  try {
    await client.patchWorkItem(testCaseId, [
      {
        op: 'add',
        path: '/relations/-',
        value: {
          rel: 'Microsoft.VSTS.Common.TestedBy-Reverse',
          url: `https://dev.azure.com/${client.org}/${client.project}/_apis/wit/workItems/${pbiId}`,
        },
      },
    ]);
  } catch (e) {
    // Relation may already exist
    const msg = e instanceof Error ? e.message : String(e);
    if (!/already|duplicate|exists/i.test(msg)) throw e;
  }
}
