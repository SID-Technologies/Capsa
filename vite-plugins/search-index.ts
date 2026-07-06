import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';
import GithubSlugger from 'github-slugger';
import matter from 'gray-matter';
import type { Plugin, ResolvedConfig } from 'vite';

// Build-time docs index. Walks the content/ tree and emits two files:
//   • search-index.json  — full records (headings + body) for in-memory search
//   • docs-manifest.json — slim records for nav, SEO meta, and the sitemap
// Both are kept fresh on content edits during dev.
//
// It also owns the static HTML head: __CAPSA_*__ placeholders in index.html
// are filled from VITE_SITE_* env vars (dev + build), and on build every doc
// route gets its own dist/docs/<slug>/index.html with the page's real title,
// description, and OpenGraph tags. Link-preview bots don't execute JS, so
// per-route head tags are what make shared docs links unfurl correctly —
// static hosts (Cloudflare Pages, nginx) serve the per-route file when
// present and fall back to the SPA index.html otherwise.
//
// Frontmatter (gray-matter) supplies optional title/description/order/hidden/
// product. Heading ids use github-slugger — the same lib rehype-slug uses — so
// search-result deep links land on the real rendered anchors.

export interface SearchHeading {
  text: string;
  id: string;
}

// Slim per-doc metadata for nav, SEO, and sitemap.
export interface ManifestEntry {
  slug: string;
  title: string;
  category: string;
  description: string;
  order: number;
  product: string; // top-level folder unless overridden in frontmatter
}

export interface SearchEntry extends ManifestEntry {
  headings: SearchHeading[];
  excerpt: string;
  body: string; // lowercased plain text, for body matching
  hidden: boolean;
}

interface Options {
  contentDir: string;
  outFile: string; // search-index.json
  manifestFile: string; // docs-manifest.json
  sitemapFile?: string; // sitemap.xml (public deploys)
  siteUrl?: string; // base URL for sitemap + llms entries
  llmsFile?: string; // llms.txt (curated index for AI agents)
  llmsFullFile?: string; // llms-full.txt (concatenated content)
  pagesDir?: string; // per-page raw markdown for the "Copy page" action
  siteTitle?: string;
}

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.mdx?$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

// Reduce markdown/MDX to plain text for indexing: drop fenced code, inline
// code, images, link syntax, headings markers, emphasis, blockquotes, tables.
function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/^#{1,6}\s+/gm, '') // heading markers
    .replace(/^[>\-*+|]\s?/gm, ' ') // blockquote/list/table markers
    .replace(/[*_~]/g, '') // emphasis
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(md: string): SearchHeading[] {
  // Skip fenced code so "# comment" lines inside code don't become headings.
  const noFence = md.replace(/```[\s\S]*?```/g, '');
  const slugger = new GithubSlugger();
  const headings: SearchHeading[] = [];
  const re = /^(#{2,3})\s+(.+)$/gm; // h2/h3 mirror the on-page TOC
  let m: RegExpExecArray | null;
  while ((m = re.exec(noFence)) !== null) {
    const text = m[2].replace(/[*_`~]/g, '').trim();
    headings.push({ text, id: slugger.slug(text) });
  }
  return headings;
}

// First real prose paragraph — skips the H1/title, headings, code, tables.
function extractExcerpt(raw: string): string {
  const noFence = raw.replace(/```[\s\S]*?```/g, '');
  for (const block of noFence.split(/\n\s*\n/)) {
    const line = block.trim();
    if (!line) continue;
    if (line.startsWith('#') || line.startsWith('|') || line.startsWith('>')) continue;
    return toPlainText(line).slice(0, 200);
  }
  return '';
}

function buildEntry(contentDir: string, file: string): SearchEntry {
  const raw = readFileSync(file, 'utf-8');
  const { data: fm, content } = matter(raw);
  const rel = relative(contentDir, file).replace(/\\/g, '/');
  const slug = rel.replace(/\.mdx?$/, '');
  const parts = slug.split('/');
  const category = parts.length > 1 ? parts[0] : 'general';
  const filename = parts[parts.length - 1];

  const description = typeof fm.description === 'string' ? fm.description : extractExcerpt(content);

  return {
    slug,
    title: typeof fm.title === 'string' ? fm.title : titleFromFilename(filename),
    category,
    description,
    order: typeof fm.order === 'number' ? fm.order : Number.MAX_SAFE_INTEGER,
    product: typeof fm.product === 'string' ? fm.product : category,
    hidden: fm.hidden === true,
    headings: extractHeadings(content),
    excerpt: extractExcerpt(content),
    body: toPlainText(content).toLowerCase(),
  };
}

function writeSitemap(sitemapFile: string, siteUrl: string, slugs: string[], lastmod: string): void {
  const base = siteUrl.replace(/\/$/, '');
  const urls = slugs
    .map((slug) => `  <url><loc>${base}/docs/${slug}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  mkdirSync(dirname(sitemapFile), { recursive: true });
  writeFileSync(sitemapFile, xml, 'utf-8');
}

// llms.txt — a curated, link-first index for AI coding assistants (the emerging
// standard shipped by Anthropic, Vercel, etc.). llms-full.txt concatenates the
// actual prose for agents that want the whole corpus in one fetch.
function writeLlms(opts: Options, visible: SearchEntry[]): void {
  const { contentDir, siteUrl, siteTitle = 'Documentation', llmsFile, llmsFullFile } = opts;
  const base = siteUrl ? siteUrl.replace(/\/$/, '') : '';
  const url = (slug: string) => `${base}/docs/${slug}`;

  // Group by category, preserving the manifest's (order, title) sort.
  const byCat = new Map<string, SearchEntry[]>();
  for (const e of visible) {
    if (!byCat.has(e.category)) byCat.set(e.category, []);
    byCat.get(e.category)!.push(e);
  }

  if (llmsFile) {
    const lines: string[] = [`# ${siteTitle}`, '', `> Developer documentation. ${visible.length} pages.`, ''];
    for (const [cat, entries] of byCat) {
      lines.push(`## ${titleFromFilename(cat)}`, '');
      for (const e of entries) {
        lines.push(`- [${e.title}](${url(e.slug)})${e.description ? `: ${e.description}` : ''}`);
      }
      lines.push('');
    }
    mkdirSync(dirname(llmsFile), { recursive: true });
    writeFileSync(llmsFile, lines.join('\n'), 'utf-8');
  }

  if (llmsFullFile) {
    const parts: string[] = [`# ${siteTitle}`, ''];
    for (const e of visible) {
      let body = '';
      try {
        body = matter(readFileSync(join(contentDir, `${e.slug}.mdx`), 'utf-8')).content.trim();
      } catch {
        /* skip unreadable */
      }
      parts.push(`---`, `URL: ${url(e.slug)}`, '', body, '');
    }
    mkdirSync(dirname(llmsFullFile), { recursive: true });
    writeFileSync(llmsFullFile, parts.join('\n'), 'utf-8');
  }
}

function generate(opts: Options): number {
  const { contentDir, outFile, manifestFile, sitemapFile, siteUrl } = opts;
  const all = walk(contentDir).map((f) => buildEntry(contentDir, f));
  // Drafts (hidden: true) are excluded from search and nav alike.
  const visible = all.filter((e) => !e.hidden);
  visible.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(visible), 'utf-8');

  // Slim manifest: nav + SEO + sitemap don't need headings/body.
  const manifest: ManifestEntry[] = visible.map(({ slug, title, category, description, order, product }) => ({
    slug,
    title,
    category,
    description,
    order,
    product,
  }));
  mkdirSync(dirname(manifestFile), { recursive: true });
  writeFileSync(manifestFile, JSON.stringify(manifest), 'utf-8');

  if (sitemapFile && siteUrl) {
    const lastmod = new Date().toISOString().slice(0, 10);
    writeSitemap(
      sitemapFile,
      siteUrl,
      visible.map((e) => e.slug),
      lastmod,
    );
  }

  writeLlms(opts, visible);

  // Per-page raw markdown (frontmatter stripped) for the "Copy page" / "View as
  // markdown" actions — one file per doc so the client fetches only what it needs.
  if (opts.pagesDir) {
    for (const e of visible) {
      try {
        const md = matter(readFileSync(join(contentDir, `${e.slug}.mdx`), 'utf-8')).content.trim();
        const dest = join(opts.pagesDir, `${e.slug}.md`);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, `${md}\n`, 'utf-8');
      } catch {
        /* skip unreadable */
      }
    }
  }

  return visible.length;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Rewrite the SPA shell's head for one doc page: title, description, OG tags,
// plus canonical/og:url when the deploy has a public base URL.
function pageHtml(shell: string, entry: ManifestEntry, siteName: string, siteUrl?: string): string {
  const title = escapeHtml(`${entry.title} — ${siteName}`);
  const desc = escapeHtml(entry.description || `${entry.title} — ${siteName} documentation.`);
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(entry.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, '$1article$2');
  if (siteUrl) {
    const url = `${siteUrl.replace(/\/$/, '')}/docs/${entry.slug}`;
    html = html.replace(
      '</head>',
      `  <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n  </head>`,
    );
  }
  return html;
}

export function searchIndexPlugin(options: Options): Plugin {
  const isContentFile = (p: string) => p.startsWith(options.contentDir + sep) && /\.mdx?$/.test(p);
  let resolved: ResolvedConfig | undefined;

  return {
    name: 'capsa-search-index',
    configResolved(config) {
      resolved = config;
    },
    buildStart() {
      const n = generate(options);
      this.info?.(`search-index: indexed ${n} docs`);
    },
    // Fill the __CAPSA_*__ head placeholders from env (dev and build alike).
    transformIndexHtml(html) {
      const env = resolved?.env ?? {};
      const siteName = env.VITE_SITE_NAME || options.siteTitle || 'Capsa';
      const description =
        env.VITE_SITE_DESCRIPTION || `${siteName} documentation — guides and API reference.`;
      return html
        .replaceAll('__CAPSA_SITE_NAME__', escapeHtml(siteName))
        .replaceAll('__CAPSA_SITE_DESCRIPTION__', escapeHtml(description))
        .replaceAll('__CAPSA_PINNED_THEME__', env.VITE_DEFAULT_THEME_STYLE || '');
    },
    // After the bundle is on disk, stamp out one HTML file per doc route so
    // link unfurls and search snippets see real per-page metadata.
    closeBundle() {
      if (!resolved || resolved.command !== 'build') return;
      const outDir = resolve(resolved.root, resolved.build.outDir);
      let shell: string;
      try {
        shell = readFileSync(join(outDir, 'index.html'), 'utf-8');
      } catch {
        return; // no client HTML emitted (e.g. non-client build)
      }
      const env = resolved.env ?? {};
      const siteName = env.VITE_SITE_NAME || options.siteTitle || 'Capsa';
      const siteUrl = options.siteUrl || env.VITE_SITE_URL;
      const manifest: ManifestEntry[] = JSON.parse(readFileSync(options.manifestFile, 'utf-8'));
      for (const entry of manifest) {
        const html = pageHtml(shell, entry, siteName, siteUrl);
        // Emit both directory-index and flat-file forms: static hosts resolve
        // the extensionless /docs/<slug> as either <slug>/index.html (nginx,
        // Cloudflare) or <slug>.html (sirv/vite preview, some CDNs).
        const dirDest = join(outDir, 'docs', entry.slug, 'index.html');
        mkdirSync(dirname(dirDest), { recursive: true });
        writeFileSync(dirDest, html, 'utf-8');
        writeFileSync(join(outDir, 'docs', `${entry.slug}.html`), html, 'utf-8');
      }
      this.info?.(`search-index: emitted ${manifest.length} per-route HTML pages`);
    },
    configureServer(server) {
      const regen = (p: string) => {
        if (!isContentFile(p)) return;
        try {
          const n = generate(options);
          server.config.logger.info(`search-index: regenerated (${n} docs)`);
        } catch (e) {
          server.config.logger.error(`search-index: ${(e as Error).message}`);
        }
      };
      // Ensure the content dir is watched even though it isn't imported as a module.
      try {
        if (statSync(options.contentDir).isDirectory()) {
          server.watcher.add(options.contentDir);
        }
      } catch {
        /* content dir missing — nothing to watch */
      }
      server.watcher.on('add', regen);
      server.watcher.on('change', regen);
      server.watcher.on('unlink', regen);
    },
  };
}
