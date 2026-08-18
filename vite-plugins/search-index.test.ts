import { describe, it, expect } from 'vitest';

import {
  titleFromFilename,
  toPlainText,
  extractExcerpt,
  extractHeadings,
  parseEntry,
  buildSitemapXml,
  buildRssXml,
  type SearchEntry,
} from './search-index';

describe('titleFromFilename', () => {
  it('strips .md and .mdx and title-cases', () => {
    expect(titleFromFilename('getting-started.mdx')).toBe('Getting Started');
    expect(titleFromFilename('quickstart.md')).toBe('Quickstart');
    expect(titleFromFilename('api_reference')).toBe('Api Reference');
  });
});

describe('toPlainText', () => {
  it('drops fenced code blocks', () => {
    const md = 'before\n\n```ts\nconst x = 1;\n```\n\nafter';
    const out = toPlainText(md);
    expect(out).toContain('before');
    expect(out).toContain('after');
    expect(out).not.toContain('const x');
  });

  it('drops inline code and images', () => {
    expect(toPlainText('use `pnpm build` now')).toBe('use now');
    expect(toPlainText('![alt](/img.png) caption')).toBe('caption');
  });

  it('keeps link text but drops the URL', () => {
    expect(toPlainText('see [the guide](/docs/guide) here')).toBe('see the guide here');
  });

  it('strips heading markers, emphasis, and blockquote/list markers', () => {
    expect(toPlainText('# Title')).toBe('Title');
    expect(toPlainText('**bold** and _italic_')).toBe('bold and italic');
    expect(toPlainText('> quoted line')).toBe('quoted line');
    expect(toPlainText('- item one\n- item two')).toBe('item one item two');
  });

  it('collapses whitespace', () => {
    expect(toPlainText('a   \n\n  b')).toBe('a b');
  });
});

describe('extractExcerpt', () => {
  it('returns the first real prose paragraph', () => {
    const md = '# Heading\n\nThe first paragraph of prose.\n\nSecond paragraph.';
    expect(extractExcerpt(md)).toBe('The first paragraph of prose.');
  });

  it('skips headings, tables, blockquotes, and code fences', () => {
    const md = '# Title\n\n```ts\ncode\n```\n\n> a quote\n\n| a | b |\n\nReal text here.';
    expect(extractExcerpt(md)).toBe('Real text here.');
  });

  it('truncates to 200 characters', () => {
    const long = 'x'.repeat(500);
    expect(extractExcerpt(long)).toHaveLength(200);
  });

  it('returns empty string when there is no prose', () => {
    expect(extractExcerpt('# Only a heading')).toBe('');
  });
});

describe('extractHeadings', () => {
  it('collects h2 and h3 with slugified ids, ignoring h1', () => {
    const md = '# Page\n\n## First Section\n\n### A Sub Point\n\n## Second Section';
    expect(extractHeadings(md)).toEqual([
      { text: 'First Section', id: 'first-section' },
      { text: 'A Sub Point', id: 'a-sub-point' },
      { text: 'Second Section', id: 'second-section' },
    ]);
  });

  it('does not treat "#" lines inside fenced code as headings', () => {
    const md = '## Real\n\n```sh\n## not a heading\n```';
    expect(extractHeadings(md)).toEqual([{ text: 'Real', id: 'real' }]);
  });

  it('deduplicates ids the way rehype-slug does', () => {
    const md = '## Setup\n\n## Setup';
    expect(extractHeadings(md).map((h) => h.id)).toEqual(['setup', 'setup-1']);
  });
});

describe('parseEntry', () => {
  it('derives slug and category from the relative path', () => {
    const e = parseEntry('guides/theming.mdx', '# Theming\n\nStyle it.');
    expect(e.slug).toBe('guides/theming');
    expect(e.category).toBe('guides');
  });

  it('uses "general" category for top-level files', () => {
    expect(parseEntry('intro.mdx', 'hi').category).toBe('general');
  });

  it('falls back to a filename-derived title and excerpt', () => {
    const e = parseEntry('guides/writing-content.mdx', 'Just some prose.');
    expect(e.title).toBe('Writing Content');
    expect(e.description).toBe('Just some prose.');
  });

  it('reads frontmatter title, description, order, and product', () => {
    const raw = [
      '---',
      'title: Custom',
      'description: A desc',
      'order: 3',
      'product: acme',
      '---',
      'body',
    ].join('\n');
    const e = parseEntry('x.mdx', raw);
    expect(e.title).toBe('Custom');
    expect(e.description).toBe('A desc');
    expect(e.order).toBe(3);
    expect(e.product).toBe('acme');
  });

  it('normalizes a quoted string date', () => {
    const e = parseEntry('changelog/v1.mdx', '---\ndate: "2026-07-10"\n---\nx');
    expect(e.date).toBe('2026-07-10');
  });

  it('normalizes an unquoted YAML date (parsed as a Date object)', () => {
    const e = parseEntry('changelog/v1.mdx', '---\ndate: 2026-07-10\n---\nx');
    expect(e.date).toBe('2026-07-10');
  });

  it('leaves date undefined when absent', () => {
    expect(parseEntry('guides/x.mdx', 'no frontmatter').date).toBeUndefined();
  });

  it('marks hidden: true drafts', () => {
    expect(parseEntry('x.mdx', '---\nhidden: true\n---\nx').hidden).toBe(true);
    expect(parseEntry('x.mdx', 'x').hidden).toBe(false);
  });
});

describe('buildSitemapXml', () => {
  it('emits a /docs/<slug> url per entry', () => {
    const xml = buildSitemapXml('https://example.com', ['guides/theming', 'intro'], '2026-07-10', false);
    expect(xml).toContain('<loc>https://example.com/docs/guides/theming</loc>');
    expect(xml).toContain('<loc>https://example.com/docs/intro</loc>');
    expect(xml).toContain('<lastmod>2026-07-10</lastmod>');
  });

  it('includes the site root first when a landing page exists', () => {
    const xml = buildSitemapXml('https://example.com', ['intro'], '2026-07-10', true);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml.indexOf('example.com/</loc>')).toBeLessThan(xml.indexOf('/docs/intro'));
  });

  it('omits the root when there is no landing page', () => {
    const xml = buildSitemapXml('https://example.com', ['intro'], '2026-07-10', false);
    expect(xml).not.toContain('<loc>https://example.com/</loc>');
  });

  it('strips a trailing slash from the base URL', () => {
    const xml = buildSitemapXml('https://example.com/', ['intro'], '2026-07-10', false);
    expect(xml).toContain('https://example.com/docs/intro');
    expect(xml).not.toContain('example.com//docs');
  });
});

describe('buildRssXml', () => {
  const entries: SearchEntry[] = [
    {
      slug: 'changelog/v0-2-0',
      title: 'v0.2.0',
      category: 'changelog',
      description: 'Second release',
      order: 0,
      product: '',
      date: '2026-07-10',
      headings: [],
      excerpt: '',
      body: '',
      hidden: false,
    },
  ];

  it('renders an RSS 2.0 channel with items', () => {
    const xml = buildRssXml('https://example.com', 'Capsa', entries);
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('<title>Capsa Changelog</title>');
    expect(xml).toContain('<link>https://example.com/docs/changelog</link>');
    expect(xml).toContain('<title>v0.2.0</title>');
    expect(xml).toContain('<link>https://example.com/docs/changelog/v0-2-0</link>');
    expect(xml).toContain('<guid>https://example.com/docs/changelog/v0-2-0</guid>');
  });

  it('formats the date as an RFC-1123 pubDate at UTC midnight', () => {
    const xml = buildRssXml('https://example.com', 'Capsa', entries);
    expect(xml).toContain('<pubDate>Fri, 10 Jul 2026 00:00:00 GMT</pubDate>');
  });

  it('escapes HTML-significant characters in titles and descriptions', () => {
    const xml = buildRssXml('https://example.com', 'A & B', [
      { ...entries[0], title: '<v1>', description: 'a & b' },
    ]);
    expect(xml).toContain('<title>A &amp; B Changelog</title>');
    expect(xml).toContain('<title>&lt;v1&gt;</title>');
    expect(xml).toContain('<description>a &amp; b</description>');
  });
});
