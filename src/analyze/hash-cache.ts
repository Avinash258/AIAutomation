import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const CACHE_DIR = path.resolve('.cache');

export function sha256(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function cachePath(key: string): string {
  const safe = key.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
  return path.join(CACHE_DIR, `${safe}.sha256`);
}

export function readCacheHash(key: string): string | undefined {
  const p = cachePath(key);
  if (!fs.existsSync(p)) return undefined;
  return fs.readFileSync(p, 'utf8').trim();
}

export function writeCacheHash(key: string, hash: string): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(key), hash, 'utf8');
}

export function isUnchanged(key: string, content: string | Buffer): boolean {
  const hash = sha256(content);
  const prev = readCacheHash(key);
  if (prev === hash) return true;
  writeCacheHash(key, hash);
  return false;
}
