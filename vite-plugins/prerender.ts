import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, ResolvedConfig } from 'vite';

import { pageHtml } from './page-html';
import type { ManifestEntry } from './page-html';
import { generateOgImage } from './og-image';

// Build-time prerendering (SSG). Runs in the CLIENT build's closeBundle,
// registered AFTER searchIndexPlugin: by then the head-only per-route files
// exist on disk, and this plugin overwrites them with fully rendered bodies by
// importing the SSR bundle (built first — see the `build` script order:
// `vite build --ssr src/entry-server.tsx --outDir dist-ssr && vite build`).
//
// Every bail path below leaves the search-index head-only files in place, so a
// prerender failure degrades to today's behavior instead of breaking releases.
// Set PRERENDER=0 to skip deliberately.

interface PrerenderOptions {
  manifestFile: string; // docs-manifest.json (already regenerated this build)
  ssrEntry?: string; // default: dist-ssr/entry-server.js
  siteTitle?: string;
}

interface ServerEntry {
  render: (url: string) => { appHtml: string };
  seedServer: (manifest: ManifestEntry[]) => void;
  buildThemeVariablesCSS: () => string;
}

// The shell head (rewritten by pageHtml) is the single source of truth for
// title/meta. React 19 hoists DocPage's helmet tags into the rendered app
// fragment, which would duplicate them — strip those.
function stripHelmetDuplicates(appHtml: string): string {
  return appHtml
    .replace(/<title>[^<]*<\/title>/g, '')
    .replace(/<meta name="description"[^>]*\/?>/g, '')
    .replace(/<meta property="og:[^"]*"[^>]*\/?>/g, '');
}

// renderToString has no <head>, so React 19 emits its hoisted <style
// data-precedence> tags (Tamagui's CSS) as the FIRST CHILDREN of the app
// fragment. Left inside #root they structurally break hydration (the client
// expects the app's first element there). Relocate them to <head> — that's
// where streaming SSR would put them, and React 19 dedupes hoistables by
// data-href against the whole document, so the client adopts them cleanly.
function extractHoistedStyles(appHtml: string): { body: string; styles: string } {
  const styles: string[] = [];
  const body = appHtml.replace(/<style [^>]*data-precedence[^>]*>[\s\S]*?<\/style>/g, (match) => {
    styles.push(match);
    return '';
  });
  return { body, styles: styles.join('\n') };
}

// Inline JSON must not be able to close its own <script> tag.
const toInlineJson = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');

export function prerenderPlugin(options: PrerenderOptions): Plugin {
  let resolved: ResolvedConfig | undefined;

  return {
    name: 'capsa-prerender',
    configResolved(config) {
      resolved = config;
    },
    async closeBundle() {
      if (!resolved || resolved.command !== 'build' || resolved.build.ssr) return;
      if (process.env.PRERENDER === '0') {
        this.info?.('prerender: skipped (PRERENDER=0) — head-only pages remain');
        return;
      }
      const env = resolved.env ?? {};
      // Security invariant: never bake auth-gated content into public HTML.
      if (env.VITE_WORKOS_CLIENT_ID && env.VITE_DEV_BYPASS_AUTH !== 'true') {
        this.warn('prerender: skipped — auth-gated deploy (head-only pages remain)');
        return;
      }

      const outDir = resolve(resolved.root, resolved.build.outDir);
      const ssrEntry = resolve(resolved.root, options.ssrEntry ?? 'dist-ssr/entry-server.js');
      if (!existsSync(ssrEntry)) {
        this.warn(`prerender: skipped — SSR bundle not found at ${ssrEntry}`);
        return;
      }
      let shell: string;
      try {
        shell = readFileSync(join(outDir, 'index.html'), 'utf-8');
      } catch {
        this.warn('prerender: skipped — no client index.html');
        return;
      }

      const { render, seedServer, buildThemeVariablesCSS } = (await import(
        pathToFileURL(ssrEntry).href
      )) as ServerEntry;

      const manifest: ManifestEntry[] = JSON.parse(readFileSync(options.manifestFile, 'utf-8'));
      const scope = env.VITE_PRODUCT as string | undefined;
      const entries = scope ? manifest.filter((e) => e.product === scope) : manifest;
      seedServer(entries);

      const siteName = env.VITE_SITE_NAME || options.siteTitle || 'Capsa';
      const siteUrl = (env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '');
      const siteDescription =
        env.VITE_SITE_DESCRIPTION || `${siteName} documentation — guides and API reference.`;

      // Head additions shared by every prerendered page: the semantic theme
      // variables (pre-JS style fidelity) and the inlined manifest (hydration
      // seeds synchronously — no fetch on the critical path).
      const headExtras =
        `  <style id="capsa-theme-vars">${buildThemeVariablesCSS()}</style>\n` +
        `    <script>window.__CAPSA_MANIFEST__ = ${toInlineJson(entries)};</script>\n  </head>`;

      const ROOT_DIV = '<div id="root"></div>';
      if (!shell.includes(ROOT_DIV)) {
        this.error(`prerender: shell is missing the exact marker ${ROOT_DIV}`);
        return;
      }

      // '' renders the /docs index (DocsIndex); slugs render DocPage.
      const routes: Array<{ slug: string; entry: ManifestEntry | null }> = [
        { slug: '', entry: null },
        ...entries.map((e) => ({ slug: e.slug, entry: e })),
      ];

      let rendered = 0;
      for (const { slug, entry } of routes) {
        try {
          const url = slug ? `/docs/${slug}` : '/docs';
          const { appHtml } = render(url);
          const { body, styles } = extractHoistedStyles(stripHelmetDuplicates(appHtml));

          // Social card PNG for this route. The file is always emitted; the
          // og:image tags need an absolute URL, so they're only injected when
          // the deploy has a public base URL (same rule as canonical).
          let ogTags = '';
          try {
            const png = await generateOgImage(resolved.root, {
              siteName,
              title: entry?.title ?? siteName,
              description: entry?.description || siteDescription,
              category: entry?.category,
            });
            const relPath = slug ? `assets/og/${slug}.png` : 'assets/og/docs-index.png';
            const imgDest = join(outDir, relPath);
            mkdirSync(dirname(imgDest), { recursive: true });
            writeFileSync(imgDest, png);
            if (siteUrl) {
              const abs = `${siteUrl}/${relPath}`;
              ogTags =
                `<meta property="og:image" content="${abs}" />\n` +
                `    <meta property="og:image:width" content="1200" />\n` +
                `    <meta property="og:image:height" content="630" />\n` +
                `    <meta name="twitter:image" content="${abs}" />\n    `;
            }
          } catch (err) {
            this.warn(`prerender: og image for "${slug || '/docs'}" failed — ${(err as Error).message}`);
          }

          let page = (entry ? pageHtml(shell, entry, siteName, siteUrl) : shell)
            .replace('</head>', `${styles}\n  ${ogTags}${headExtras}`)
            .replace(ROOT_DIV, `<div id="root">${body}</div>`);
          if (ogTags) {
            page = page.replace(
              '<meta name="twitter:card" content="summary" />',
              '<meta name="twitter:card" content="summary_large_image" />',
            );
          }

          const dirDest = slug
            ? join(outDir, 'docs', slug, 'index.html')
            : join(outDir, 'docs', 'index.html');
          mkdirSync(dirname(dirDest), { recursive: true });
          writeFileSync(dirDest, page, 'utf-8');
          if (slug) writeFileSync(join(outDir, 'docs', `${slug}.html`), page, 'utf-8');
          rendered++;
        } catch (err) {
          // Leave the head-only fallback for this route; keep going.
          this.warn(`prerender: route "${slug || '/docs'}" failed — ${(err as Error).message}`);
        }
      }
      this.info?.(`prerender: rendered ${rendered}/${routes.length} routes`);

      // Pagefind: index the prerendered article bodies (scoped by
      // data-pagefind-body in DocPage) into dist/pagefind/. The ⌘K palette
      // uses this at runtime, falling back to the JSON index when absent.
      try {
        const pagefind = await import('pagefind');
        const { index, errors: createErrors } = await pagefind.createIndex({});
        if (!index) throw new Error(createErrors?.join('; ') || 'createIndex failed');
        const { page_count, errors: addErrors } = await index.addDirectory({
          path: outDir,
          glob: 'docs/**/index.html',
        });
        if (addErrors?.length) throw new Error(addErrors.join('; '));
        await index.writeFiles({ outputPath: join(outDir, 'pagefind') });
        await pagefind.close();
        this.info?.(`prerender: pagefind indexed ${page_count} pages`);
      } catch (err) {
        this.warn(`prerender: pagefind indexing failed — ${(err as Error).message}`);
      }
    },
  };
}
