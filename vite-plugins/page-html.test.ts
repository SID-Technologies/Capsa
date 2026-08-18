import { describe, it, expect } from 'vitest';

import { escapeHtml, pageHtml, type ManifestEntry } from './page-html';

const SHELL = [
  '<!doctype html>',
  '<html>',
  '<head>',
  '<title>Capsa</title>',
  '<meta name="description" content="default" />',
  '<meta property="og:title" content="Capsa" />',
  '<meta property="og:description" content="default" />',
  '<meta property="og:type" content="website" />',
  '</head>',
  '<body><div id="root"></div></body>',
  '</html>',
].join('\n');

const entry: ManifestEntry = {
  slug: 'guides/theming',
  title: 'Theming',
  category: 'guides',
  description: 'Style your docs.',
  order: 1,
  product: 'guides',
};

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&z</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title='y'&gt;&amp;z&lt;/a&gt;",
    );
  });

  it('escapes ampersands before other entities (no double-encoding)', () => {
    expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('just words')).toBe('just words');
  });
});

describe('pageHtml', () => {
  it('rewrites the title with the site name suffix', () => {
    const out = pageHtml(SHELL, entry, 'Capsa');
    expect(out).toContain('<title>Theming — Capsa</title>');
    expect(out.match(/<title>/g)).toHaveLength(1);
  });

  it('fills description and OpenGraph tags from the entry', () => {
    const out = pageHtml(SHELL, entry, 'Capsa');
    expect(out).toContain('<meta name="description" content="Style your docs." />');
    expect(out).toContain('<meta property="og:title" content="Theming" />');
    expect(out).toContain('<meta property="og:description" content="Style your docs." />');
    expect(out).toContain('<meta property="og:type" content="article" />');
  });

  it('falls back to a generated description when the entry has none', () => {
    const out = pageHtml(SHELL, { ...entry, description: '' }, 'Capsa');
    expect(out).toContain('content="Theming — Capsa documentation."');
  });

  it('omits canonical/og:url without a site URL', () => {
    const out = pageHtml(SHELL, entry, 'Capsa');
    expect(out).not.toContain('rel="canonical"');
    expect(out).not.toContain('og:url');
  });

  it('adds canonical and og:url when a site URL is given', () => {
    const out = pageHtml(SHELL, entry, 'Capsa', 'https://example.com');
    expect(out).toContain('<link rel="canonical" href="https://example.com/docs/guides/theming" />');
    expect(out).toContain('<meta property="og:url" content="https://example.com/docs/guides/theming" />');
  });

  it('strips a trailing slash from the site URL', () => {
    const out = pageHtml(SHELL, entry, 'Capsa', 'https://example.com/');
    expect(out).toContain('href="https://example.com/docs/guides/theming"');
    expect(out).not.toContain('example.com//docs');
  });

  it('escapes HTML-significant characters in title and description', () => {
    const out = pageHtml(SHELL, { ...entry, title: 'A & B', description: '<script>' }, 'Capsa');
    expect(out).toContain('<title>A &amp; B — Capsa</title>');
    expect(out).toContain('content="&lt;script&gt;"');
    // The raw, unescaped script tag must never reach the output.
    expect(out).not.toContain('content="<script>"');
  });
});
