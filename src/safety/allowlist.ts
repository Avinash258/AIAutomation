/**
 * Refuse runs against any base URL not in ALLOWED_BASE_URLS.
 * Production hosts are blocked unless explicitly allowlisted AND APP_ENV=prod is set.
 */
export function assertAllowedBaseUrl(url: string): void {
  const allow = (process.env.ALLOWED_BASE_URLS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!allow.length) {
    throw new Error('ALLOWED_BASE_URLS is empty. Set an explicit allowlist in .env');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid UI_BASE_URL: ${url}`);
  }

  const origin = parsed.origin;
  const ok = allow.some((a) => {
    try {
      return new URL(a).origin === origin;
    } catch {
      return a === origin || a === url;
    }
  });

  if (!ok) {
    throw new Error(
      `Refusing base URL ${origin} — not in ALLOWED_BASE_URLS. Update .env allowlist.`,
    );
  }

  const host = parsed.hostname.toLowerCase();
  const looksProd =
    host === 'prod' ||
    host.startsWith('prod.') ||
    host.includes('.prod.') ||
    host === 'www' ||
    /(^|\.)production\.|(\.|-)prd(\.|$)/i.test(host);

  if (looksProd && process.env.APP_ENV !== 'prod') {
    throw new Error(
      `Refusing likely production host ${host}. Set APP_ENV=prod only after explicit approval.`,
    );
  }
}
