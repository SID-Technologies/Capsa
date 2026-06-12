// Optional: copy an external OpenAPI spec into the docs so the API reference
// renders the latest version. Set OPENAPI_SOURCE to the spec path (e.g. a
// sibling service repo); the file is copied to public/openapi/v1.yaml.
//
// Tolerant by design: if OPENAPI_SOURCE is unset or missing, it does nothing and
// the committed spec is used. Wired as a `predev` hook — harmless when unused.
//
//   OPENAPI_SOURCE=../api/openapi.yaml pnpm dev:web

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const source = process.env.OPENAPI_SOURCE;
if (!source) process.exit(0); // nothing configured — use the committed spec

const src = resolve(source);
const dest = resolve(repoRoot, 'apps/web/public/openapi/v1.yaml');

if (!existsSync(src)) {
  console.warn(`[sync-openapi] OPENAPI_SOURCE not found at ${src} — using committed spec.`);
  process.exit(0);
}

try {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log(`[sync-openapi] copied ${src} → ${dest}`);
} catch (err) {
  console.warn(`[sync-openapi] copy failed (${err.message}) — using committed spec.`);
  process.exit(0);
}
