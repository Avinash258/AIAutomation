import fs from 'node:fs';
import path from 'node:path';
import { sha256, writeCacheHash, readCacheHash } from './hash-cache.js';

export type PageModel = {
  url?: string;
  title?: string;
  routes: string[];
  forms: Array<{ name?: string; fields: string[] }>;
  fields: Array<{ role?: string; name?: string; testId?: string; placeholder?: string }>;
  buttons: Array<{ name?: string; testId?: string }>;
  validationHints: string[];
  locatorHints: Array<{ strategy: string; value: string; role?: string; name?: string }>;
  flows: string[];
  prunedFromLines: number;
  keptNodes: number;
};

const INTERACTIVE = new Set([
  'button',
  'link',
  'textbox',
  'searchbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'menuitem',
  'tab',
  'switch',
]);

/** Deterministic prune: drop scripts/styles/svg/hidden; collapse repeated rows to 2 + count. */
export function pruneSnapshotYaml(
  yamlText: string,
  meta: { url?: string; title?: string } = {},
): PageModel {
  const lines = yamlText.split(/\r?\n/);
  const fields: PageModel['fields'] = [];
  const buttons: PageModel['buttons'] = [];
  const locatorHints: PageModel['locatorHints'] = [];
  const validationHints: string[] = [];
  const sigCount = new Map<string, number>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/script|stylesheet|\bsvg\b|meta/i.test(trimmed) && !/\[ref=/.test(trimmed)) continue;
    if (/aria-hidden|hidden|decorative/i.test(trimmed)) continue;

    const roleMatch = trimmed.match(
      /^-?\s*(button|link|textbox|searchbox|checkbox|radio|combobox|heading|navigation|main|listitem|menuitem|tab|switch)\b/i,
    );
    const role = roleMatch?.[1]?.toLowerCase();
    const name = trimmed.match(/"([^"]+)"/)?.[1];
    const testId = trimmed.match(/testid[=:]"?([^"\s\]]+)"?/i)?.[1];
    const placeholder = trimmed.match(/placeholder[=:]?\s*"([^"]+)"/i)?.[1];

    if (/required|invalid|error|aria-invalid/i.test(trimmed) && name) {
      validationHints.push(name);
    }

    if (!role && !testId) continue;
    const sig = `${role}|${name}|${testId}`;
    const count = (sigCount.get(sig) ?? 0) + 1;
    sigCount.set(sig, count);
    if (count > 2 && role === 'listitem') continue;

    if (role === 'button' || role === 'link') {
      if (count <= 2) buttons.push({ name, testId });
    }
    if (role && INTERACTIVE.has(role)) {
      if (count <= 2) fields.push({ role, name, testId, placeholder });
      if (count === 3) fields.push({ role, name: name ? `${name} (+repeats)` : name, testId });
      if (count > 3) continue;
    }

    if (testId) locatorHints.push({ strategy: 'getByTestId', value: testId, role, name });
    else if (role && name)
      locatorHints.push({ strategy: 'getByRole', value: `${role}:${name}`, role, name });
    else if (placeholder)
      locatorHints.push({ strategy: 'getByPlaceholder', value: placeholder });
  }

  const routes: string[] = [];
  if (meta.url) {
    try {
      routes.push(new URL(meta.url).pathname);
    } catch {
      routes.push(meta.url);
    }
  }

  return {
    url: meta.url,
    title: meta.title,
    routes,
    forms: fields.some((f) => f.role === 'textbox' || f.role === 'checkbox')
      ? [{ name: 'main', fields: fields.map((f) => f.name ?? f.role ?? 'field').slice(0, 30) }]
      : [],
    fields: fields.slice(0, 80),
    buttons: buttons.slice(0, 40),
    validationHints: [...new Set(validationHints)].slice(0, 20),
    locatorHints: locatorHints.slice(0, 60),
    flows: buttons
      .filter((b) => b.name)
      .slice(0, 15)
      .map((b) => `click:${b.name}`),
    prunedFromLines: lines.length,
    keptNodes: fields.length + buttons.length,
  };
}

export function pruneSnapshotFile(
  snapshotPath: string,
  pageKey: string,
  meta: { url?: string; title?: string } = {},
): { model: PageModel; outPath: string; cacheHit: boolean } {
  const yamlText = fs.readFileSync(snapshotPath, 'utf8');
  const hash = sha256(yamlText);
  const cacheKey = `snap-${pageKey}`;
  const cacheHit = readCacheHash(cacheKey) === hash;
  const outPath = path.resolve('artifacts/page-model', `${pageKey}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (cacheHit && fs.existsSync(outPath)) {
    return { model: JSON.parse(fs.readFileSync(outPath, 'utf8')) as PageModel, outPath, cacheHit };
  }
  const model = pruneSnapshotYaml(yamlText, meta);
  fs.writeFileSync(outPath, JSON.stringify(model, null, 2));
  writeCacheHash(cacheKey, hash);
  return { model, outPath, cacheHit: false };
}
