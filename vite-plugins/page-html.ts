// Shared per-route HTML helpers, used by both the search-index plugin
// (head-only fallback files) and the prerender plugin (full SSG output).

// Slim per-doc metadata for nav, SEO, and sitemap.
export interface ManifestEntry {
  slug: string;
  title: string;
  category: string;
  description: string;
  order: number;
  product: string; // top-level folder unless overridden in frontmatter
  date?: string; // ISO YYYY-MM-DD — set on changelog entries
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Rewrite the SPA shell's head for one doc page: title, description, OG tags,
// plus canonical/og:url when the deploy has a public base URL.
export function pageHtml(shell: string, entry: ManifestEntry, siteName: string, siteUrl?: string): string {
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
