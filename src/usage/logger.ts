import fs from 'node:fs';
import path from 'node:path';

export type UsageEntry = {
  ts: string;
  agent: string;
  phase: string;
  inputChars: number;
  outputChars: number;
  estimatedTokens: number;
  cacheHit?: boolean;
  notes?: string;
};

const USAGE_PATH = path.resolve('artifacts/usage.json');

function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

export function logUsage(entry: Omit<UsageEntry, 'ts' | 'estimatedTokens'> & { estimatedTokens?: number }): void {
  fs.mkdirSync(path.dirname(USAGE_PATH), { recursive: true });
  let list: UsageEntry[] = [];
  if (fs.existsSync(USAGE_PATH)) {
    try {
      list = JSON.parse(fs.readFileSync(USAGE_PATH, 'utf8')) as UsageEntry[];
    } catch {
      list = [];
    }
  }
  const estimatedTokens =
    entry.estimatedTokens ?? estimateTokens(entry.inputChars + entry.outputChars);
  list.push({ ...entry, estimatedTokens, ts: new Date().toISOString() });
  fs.writeFileSync(USAGE_PATH, JSON.stringify(list, null, 2));
}

export function summarizeUsage(): { totalEstimatedTokens: number; byAgent: Record<string, number> } {
  if (!fs.existsSync(USAGE_PATH)) return { totalEstimatedTokens: 0, byAgent: {} };
  const list = JSON.parse(fs.readFileSync(USAGE_PATH, 'utf8')) as UsageEntry[];
  const byAgent: Record<string, number> = {};
  let total = 0;
  for (const e of list) {
    total += e.estimatedTokens;
    byAgent[e.agent] = (byAgent[e.agent] ?? 0) + e.estimatedTokens;
  }
  return { totalEstimatedTokens: total, byAgent };
}
