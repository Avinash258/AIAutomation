import fs from 'node:fs';
import path from 'node:path';

/** Extract failing step + error + 30-line trace excerpt only. */
function main() {
  const input = process.argv[2] ?? 'test-results';
  const out = path.resolve('artifacts/reports/heal-context.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });

  let title = 'unknown';
  let error = '';
  let traceExcerpt: string[] = [];

  const readFile = (file: string) => {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    title = path.basename(path.dirname(file));
    error = lines.find((l) => /Error:|Timeout|expect\(/.test(l)) ?? lines[0] ?? '';
    const idx = Math.max(0, lines.findIndex((l) => /Error:|Timeout|expect\(/.test(l)));
    traceExcerpt = lines.slice(idx, idx + 30);
  };

  if (fs.existsSync(input) && fs.statSync(input).isFile()) {
    readFile(input);
  } else if (fs.existsSync(input)) {
    const walk = (dir: string): string | undefined => {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          const hit = walk(p);
          if (hit) return hit;
        } else if (ent.name === 'error-context.md' || ent.name.endsWith('.txt')) return p;
      }
      return undefined;
    };
    const file = walk(input);
    if (file) readFile(file);
    else error = 'No error-context under test-results';
  } else {
    error = `Input not found: ${input}`;
  }

  const payload = {
    title,
    error: error.slice(0, 500),
    traceExcerpt: traceExcerpt.slice(0, 30),
    classificationHint: 'locator | timing | data | real-bug',
    maxAttempts: 2,
    rule: 'Auto-fix only locator|timing|data; never mask real bugs',
  };
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({ path: out, title, error: payload.error }));
}

main();
