import { useState, useEffect, useMemo } from 'react';
import type { ComponentType } from 'react';
import { titleFromFilename } from '../lib/markdown';
import { track } from '../lib/analytics';

// Vite glob import: every .mdx doc is compiled to a component and code-split.
// Each loader resolves to a module whose default export is the MDX component.
const docModules = import.meta.glob<{ default: ComponentType }>('/content/**/*.mdx');

export interface NavItem {
  slug: string;
  title: string;
  category: string;
  children?: NavItem[];
}

export interface NavCategory {
  name: string;
  label: string;
  items: NavItem[];
}

// Build-time manifest entry (mirrors vite-plugins/search-index ManifestEntry).
export interface ManifestEntry {
  slug: string;
  title: string;
  category: string;
  description: string;
  order: number;
  product: string;
}

// Optional per-product scope (4.1): when set, only that product's docs show.
const PRODUCT_SCOPE = import.meta.env.VITE_PRODUCT as string | undefined;

function buildNavTree(docs: ManifestEntry[]): NavCategory[] {
  const categories = new Map<string, NavItem[]>();

  for (const doc of docs) {
    const category = doc.category || 'general';
    if (!categories.has(category)) categories.set(category, []);
    categories.get(category)!.push({ slug: doc.slug, title: doc.title, category });
  }

  return Array.from(categories.entries()).map(([name, items]) => ({
    name,
    label: titleFromFilename(name),
    // Manifest already arrives sorted by (order, title) — preserve that.
    items,
  }));
}

let manifestPromise: Promise<ManifestEntry[]> | null = null;
function loadManifest(): Promise<ManifestEntry[]> {
  if (!manifestPromise) {
    manifestPromise = fetch('/docs-manifest.json')
      .then((r) => (r.ok ? (r.json() as Promise<ManifestEntry[]>) : []))
      .catch(() => []);
  }
  return manifestPromise;
}

export function useDocsList() {
  const [docs, setDocs] = useState<ManifestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadManifest().then((entries) => {
      if (cancelled) return;
      const scoped = PRODUCT_SCOPE ? entries.filter((e) => e.product === PRODUCT_SCOPE) : entries;
      setDocs(scoped);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const navTree = useMemo(() => buildNavTree(docs), [docs]);

  return { docs, navTree, isLoading };
}

export { loadManifest };

// Per-doc metadata (title/description/...) for SEO tags — see DocPage.
export function useDocMeta(slug: string | undefined) {
  const [meta, setMeta] = useState<ManifestEntry | null>(null);
  useEffect(() => {
    if (!slug) {
      setMeta(null);
      return;
    }
    let cancelled = false;
    loadManifest().then((entries) => {
      if (!cancelled) setMeta(entries.find((e) => e.slug === slug) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return meta;
}

export interface LoadedDoc {
  slug: string;
  title: string;
  category: string;
  Component: ComponentType;
}

export function useDoc(slug: string | undefined) {
  const [doc, setDoc] = useState<LoadedDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setDoc(null);
      setIsLoading(false);
      return;
    }

    const filePath = `/content/${slug}.mdx`;
    const loader = docModules[filePath];

    if (!loader) {
      setDoc(null);
      setError(`Document not found: ${slug}`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    let cancelled = false;

    loader()
      .then((mod) => {
        if (cancelled) return;
        const parts = slug.split('/');
        const category = parts.length > 1 ? parts[0] : 'general';
        const filename = parts[parts.length - 1];

        setDoc({
          slug,
          title: titleFromFilename(filename),
          category,
          Component: mod.default,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(`Failed to load document: ${err.message}`);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { doc, isLoading, error };
}

// ── Search ──────────────────────────────────────────────────────────────
// Backed by the build-time index (public/search-index.json, produced by the
// search-index Vite plugin). Fetched once, matched in memory, ranked
// title > heading > body. Heading ids match rehype-slug, so results deep-link.

interface SearchHeading {
  text: string;
  id: string;
}

interface SearchEntry {
  slug: string;
  title: string;
  category: string;
  product: string;
  headings: SearchHeading[];
  excerpt: string;
  body: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  headingText?: string;
  headingId?: string;
}

let searchIndexPromise: Promise<SearchEntry[]> | null = null;
function loadSearchIndex(): Promise<SearchEntry[]> {
  if (!searchIndexPromise) {
    searchIndexPromise = fetch('/search-index.json')
      .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : []))
      .catch(() => []);
  }
  return searchIndexPromise;
}

function rankResults(entries: SearchEntry[], query: string): SearchResult[] {
  const q = query.toLowerCase();
  const scored: { entry: SearchEntry; score: number; heading?: SearchHeading }[] = [];

  for (const e of entries) {
    if (PRODUCT_SCOPE && e.product !== PRODUCT_SCOPE) continue;
    let score = 0;
    let heading: SearchHeading | undefined;
    if (e.title.toLowerCase().includes(q)) score = Math.max(score, 4);
    const h = e.headings.find((x) => x.text.toLowerCase().includes(q));
    if (h) {
      score = Math.max(score, 3);
      heading = h;
    }
    if (e.body.includes(q)) score = Math.max(score, 2);
    if (e.category.toLowerCase().includes(q)) score = Math.max(score, 1);
    if (score > 0) scored.push({ entry: e, score, heading });
  }

  scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return scored.map(({ entry, heading }) => ({
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    excerpt: entry.excerpt,
    headingText: heading?.text,
    headingId: heading?.id,
  }));
}

export function useDocSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    let cancelled = false;
    // Debounce keystrokes; the index fetch is cached after the first call.
    const handle = setTimeout(() => {
      loadSearchIndex().then((entries) => {
        if (cancelled) return;
        const ranked = rankResults(entries, trimmed);
        setResults(ranked);
        setIsSearching(false);
        // High-signal analytics: queries that find nothing = content gaps.
        if (ranked.length === 0) track('docs_search_no_results', { query: trimmed });
      });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return { results, isSearching };
}
