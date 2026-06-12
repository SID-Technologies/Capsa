// CI check: find broken INTERNAL doc links across content/*.mdx.
// External (http/https), mailto, and pure #anchor links are skipped — those
// have their own failure modes (rate limits, transient) and aren't our concern.
// Exits 1 if any internal link points at a doc that doesn't exist.

import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, '..', 'apps/web/content');

// Real routes that aren't backed by a content file.
const ROUTE_WHITELIST = new Set(['api']);

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

const files = walk(contentDir);
const slugs = new Set(files.map((f) => f.slice(contentDir.length + 1).replace(/\.mdx$/, '')));

const broken = [];
const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;

// Resolve a link target to a content slug, honoring ./ and ../ relative to the
// linking file's directory. Returns null for links we don't validate.
function resolveSlug(fileSlug, target) {
  if (/^(https?:|mailto:|#)/.test(target)) return null; // external / anchor
  let t = target.replace(/#.*$/, '').replace(/\.mdx?$/, '');
  if (!t) return null;

  if (t.startsWith('/docs/')) t = t.slice('/docs/'.length);
  else if (t.startsWith('/')) t = t.slice(1);
  else if (t.startsWith('.')) {
    // Relative to the current file's directory.
    const dir = fileSlug.includes('/') ? fileSlug.replace(/\/[^/]*$/, '') : '';
    t = resolve('/' + dir, t).slice(1);
  }
  return t.replace(/\/$/, ''); // drop trailing slash (section links)
}

for (const file of files) {
  const fileSlug = file.slice(contentDir.length + 1).replace(/\.mdx$/, '');
  const text = readFileSync(file, 'utf-8');
  let m;
  while ((m = linkRe.exec(text)) !== null) {
    const target = m[1].trim().split(' ')[0]; // drop optional "title"
    const slug = resolveSlug(fileSlug, target);
    if (!slug) continue;
    if (ROUTE_WHITELIST.has(slug)) continue;
    if (!slugs.has(slug)) {
      broken.push({ file: fileSlug + '.mdx', target: m[1] });
    }
  }
}

if (broken.length) {
  console.error(`✗ ${broken.length} broken internal link(s):`);
  for (const b of broken) console.error(`  ${b.file} → ${b.target}`);
  process.exit(1);
}
console.log(`✓ no broken internal links (${files.length} docs checked)`);
