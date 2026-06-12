// CI check (3.3): warn about docs not touched in a long time. Uses git's
// last-commit date per file (no `updated` frontmatter required). Warns only —
// stale docs are a signal to review, not a build failure. Exit code stays 0.
//
// Threshold overridable: STALE_MONTHS=12 node scripts/check-stale-docs.mjs

import { readdirSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const contentDir = resolve(repoRoot, 'apps/web/content');
const months = Number(process.env.STALE_MONTHS || 9);
const cutoff = Date.now() - months * 30 * 24 * 60 * 60 * 1000;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

const stale = [];
for (const file of walk(contentDir)) {
  let iso;
  try {
    iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: repoRoot,
      encoding: 'utf-8',
    }).trim();
  } catch {
    continue; // not in git yet — skip
  }
  if (!iso) continue;
  const when = Date.parse(iso);
  if (when < cutoff) {
    stale.push({ file: relative(repoRoot, file), date: iso.slice(0, 10) });
  }
}

if (stale.length) {
  console.warn(`⚠ ${stale.length} doc(s) untouched for >${months} months:`);
  for (const s of stale.sort((a, b) => a.date.localeCompare(b.date))) {
    console.warn(`  ${s.date}  ${s.file}`);
  }
} else {
  console.log(`✓ no docs older than ${months} months`);
}
// Warning only — never fail the build.
process.exit(0);
