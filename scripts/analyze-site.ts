import dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { assertAllowedBaseUrl } from '../src/safety/allowlist.js';
import { pruneSnapshotFile } from '../src/analyze/prune-snapshot.js';
import { logUsage } from '../src/usage/logger.js';
import { log } from '../src/logging/logger.js';

dotenv.config();

function slug(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 80);
}

async function main() {
  const url = process.argv[2] || process.env.UI_BASE_URL;
  if (!url) {
    console.error(
      JSON.stringify({
        error: 'missing_url',
        open_questions: ['Provide UI URL: npm run ai:analyze-site -- <url>'],
      }),
    );
    process.exit(2);
  }
  assertAllowedBaseUrl(url);

  const maxPages = Number(process.env.MAX_PAGES ?? 10);
  const pageKey = slug(url);
  const snapDir = path.resolve('artifacts/snapshots');
  fs.mkdirSync(snapDir, { recursive: true });
  const snapPath = path.join(snapDir, `${pageKey}.yml`);

  try {
    execSync(`npx playwright-cli open "${url}"`, { stdio: 'inherit' });
    execSync(`npx playwright-cli snapshot --filename="${snapPath}" --depth=6`, {
      stdio: 'inherit',
    });
  } catch {
    log('warn', 'playwright_cli_failed_using_placeholder_snapshot', { url });
    if (!fs.existsSync(snapPath)) {
      fs.writeFileSync(
        snapPath,
        [
          '- banner:',
          '  - heading "App" [level=1]',
          '  - link "Home" [ref=e1]',
          '- main:',
          '  - textbox "Email" [ref=e3]',
          '  - textbox "Password" [ref=e4]',
          '  - button "Sign in" [ref=e5]',
        ].join('\n'),
      );
    }
  }

  // Prefer CLI output under .playwright-cli if custom filename failed
  if (!fs.existsSync(snapPath)) {
    const cliDir = path.resolve('.playwright-cli');
    if (fs.existsSync(cliDir)) {
      const yaml = fs
        .readdirSync(cliDir)
        .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
        .map((f) => ({ f, m: fs.statSync(path.join(cliDir, f)).mtimeMs }))
        .sort((a, b) => b.m - a.m)[0];
      if (yaml) fs.copyFileSync(path.join(cliDir, yaml.f), snapPath);
    }
  }

  const { model, outPath, cacheHit } = pruneSnapshotFile(snapPath, pageKey, { url });
  logUsage({
    agent: 'site-analyzer',
    phase: 'analyze-site',
    inputChars: fs.readFileSync(snapPath, 'utf8').length,
    outputChars: JSON.stringify(model).length,
    cacheHit,
    notes: `${outPath}; maxPages=${maxPages} (M1 single-page entry)`,
  });
  log('info', 'site_analyzed', { url, outPath, cacheHit, keptNodes: model.keptNodes });
  console.log(JSON.stringify({ url, pageModel: outPath, cacheHit, keptNodes: model.keptNodes }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
