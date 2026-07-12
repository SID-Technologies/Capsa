import { useState, useEffect, useMemo } from 'react';
import type { ComponentType } from 'react';
import { titleFromFilename } from '../lib/markdown';
import { track } from '../lib/analytics';

// Vite glob import: every .mdx doc is compiled to a component and code-split.
// Each loader resolves to a module whose default export is the MDX component.
const docModules = import.meta.glob<{ default: ComponentType }>('/content/**/*.mdx');

// content/home.mdx is a RESERVED file: when present, `/` renders it as the
// landing page (App.tsx) and the build pipeline keeps it out of docs nav,
// search, and the manifest. Static at build time in both client + SSR bundles.
export const HAS_HOME = '/content/home.mdx' in docModules;

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
  date?: string; // ISO YYYY-MM-DD — set on changelog entries
}

// Optional per-product scope (4.1): when set, only that product's docs show.
const PRODUCT_SCOPE = import.meta.env.VITE_PRODUCT as string | undefined;

const scopeEntries = (entries: ManifestEntry[]): ManifestEntry[] =>
  PRODUCT_SCOPE ? entries.filter((e) => e.product === PRODUCT_SCOPE) : entries;

// ── SSG / hydration caches ────────────────────────────────────────────────
// Prerendering (vite-plugins/prerender.ts) renders routes with renderToString,
// which cannot wait for effects — so the hooks below check these module-level
// caches synchronously before falling back to their async paths. The server
// entry seeds them from an eager glob + the on-disk manifest; the client entry
// seeds the same caches BEFORE hydrateRoot so the first client render matches
// the prerendered HTML byte for byte. SPA navigation also benefits: once a doc
// has loaded it renders instantly on revisit.

declare global {
  interface Window {
    /** Inlined by the prerender plugin so hydration needs no manifest fetch. */
    __CAPSA_MANIFEST__?: ManifestEntry[];
  }
}

const docCache = new Map<string, LoadedDoc>();
let manifestCache: ManifestEntry[] | null = null;

// Static hosts serve prerendered directories at trailing-slash URLs
// (/docs/guides/theming/), and the router splat keeps that slash — normalize
// so cache keys, module paths, and manifest lookups always match.
export const normalizeSlug = (slug: string | undefined): string | undefined =>
  slug ? slug.replace(/\/+$/, '') || undefined : undefined;

function toLoadedDoc(slug: string, Component: ComponentType): LoadedDoc {
  const parts = slug.split('/');
  return {
    slug,
    title: titleFromFilename(parts[parts.length - 1]),
    category: parts.length > 1 ? parts[0] : 'general',
    Component,
  };
}

export function seedManifest(entries: ManifestEntry[]): void {
  manifestCache = entries;
  manifestPromise = Promise.resolve(entries);
}

export function getManifestSync(): ManifestEntry[] | null {
  return manifestCache;
}

export function seedDoc(slug: string, Component: ComponentType): void {
  docCache.set(slug, toLoadedDoc(slug, Component));
}

/** Resolve one doc's lazy chunk into the cache (used before hydrateRoot). */
export async function preloadDoc(rawSlug: string): Promise<void> {
  const slug = normalizeSlug(rawSlug);
  if (!slug || docCache.has(slug)) return;
  const loader = docModules[`/content/${slug}.mdx`];
  if (!loader) return;
  const mod = await loader();
  docCache.set(slug, toLoadedDoc(slug, mod.default));
}

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
    // Prerendered pages inline the manifest — no fetch on the critical path.
    const inline = typeof window !== 'undefined' ? window.__CAPSA_MANIFEST__ : undefined;
    if (inline) {
      seedManifest(inline);
      return manifestPromise!;
    }
    manifestPromise = fetch('/docs-manifest.json')
      .then((r) => (r.ok ? (r.json() as Promise<ManifestEntry[]>) : []))
      .catch(() => [])
      .then((entries: ManifestEntry[]) => {
        manifestCache = entries;
        return entries;
      });
  }
  return manifestPromise;
}

export function useDocsList() {
  // Cache-first so prerender (and hydration of prerendered pages) renders the
  // real list synchronously; falls back to the async manifest fetch otherwise.
  const cached = getManifestSync();
  const [docs, setDocs] = useState<ManifestEntry[]>(() => (cached ? scopeEntries(cached) : []));
  const [isLoading, setIsLoading] = useState(cached === null);

  useEffect(() => {
    if (getManifestSync()) return;
    let cancelled = false;
    loadManifest().then((entries) => {
      if (cancelled) return;
      setDocs(scopeEntries(entries));
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
export function useDocMeta(rawSlug: string | undefined) {
  const slug = normalizeSlug(rawSlug);
  const [manifest, setManifest] = useState<ManifestEntry[] | null>(() => getManifestSync());
  useEffect(() => {
    if (manifest !== null) return;
    let cancelled = false;
    loadManifest().then((entries) => {
      if (!cancelled) setManifest(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [manifest]);
  return useMemo(
    () => (slug && manifest ? (manifest.find((e) => e.slug === slug) ?? null) : null),
    [manifest, slug],
  );
}

export interface LoadedDoc {
  slug: string;
  title: string;
  category: string;
  Component: ComponentType;
}

export function useDoc(rawSlug: string | undefined) {
  const slug = normalizeSlug(rawSlug);
  // Cache-first: prerender and hydration render the doc synchronously; SPA
  // navigation to an uncached doc takes the async loader path as before.
  const [doc, setDoc] = useState<LoadedDoc | null>(() => (slug ? (docCache.get(slug) ?? null) : null));
  const [isLoading, setIsLoading] = useState(() => !!slug && !docCache.has(slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setDoc(null);
      setIsLoading(false);
      return;
    }

    const cached = docCache.get(slug);
    if (cached) {
      setDoc(cached);
      setError(null);
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
        const loaded = toLoadedDoc(slug, mod.default);
        docCache.set(slug, loaded);
        setDoc(loaded);
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

// ── Pagefind (production search) ─────────────────────────────────────────
// Production builds ship a Pagefind index over the prerendered article bodies
// (written by vite-plugins/prerender.ts). Its runtime loads lazily from
// /pagefind/pagefind.js; when absent (dev server, PRERENDER=0 builds) we fall
// back to the in-memory JSON index above.

interface PagefindSubResult {
  title: string;
  url: string;
}
interface PagefindDocData {
  url: string;
  excerpt?: string;
  meta?: { title?: string };
  sub_results?: PagefindSubResult[];
}
interface PagefindApi {
  init?: () => Promise<void>;
  search: (q: string) => Promise<{ results: { data: () => Promise<PagefindDocData> }[] }>;
}

let pagefindPromise: Promise<PagefindApi | null> | null = null;
function loadPagefind(): Promise<PagefindApi | null> {
  if (!pagefindPromise) {
    const runtimeUrl = '/pagefind/pagefind.js';
    pagefindPromise = import(/* @vite-ignore */ runtimeUrl)
      .then(async (pf: PagefindApi) => {
        await pf.init?.();
        return pf;
      })
      .catch(() => null);
  }
  return pagefindPromise;
}

const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

async function pagefindSearch(pf: PagefindApi, query: string): Promise<SearchResult[]> {
  const { results } = await pf.search(query);
  const pages = await Promise.all(results.slice(0, 15).map((r) => r.data()));
  return pages.map((d) => {
    const slug = normalizeSlug(d.url.replace(/^\/docs\//, '').replace(/\.html$/, '')) ?? '';
    const title = d.meta?.title || titleFromFilename(slug.split('/').pop() ?? slug);
    // Best matching section with an anchor (skip the page-title pseudo-section)
    // so results deep-link like the JSON index did.
    const sub = d.sub_results?.find((s) => s.url.includes('#') && s.title !== title);
    return {
      slug,
      title,
      category: slug.includes('/') ? slug.split('/')[0] : 'general',
      excerpt: stripTags(d.excerpt ?? ''),
      headingText: sub?.title,
      headingId: sub?.url.split('#')[1],
    };
  });
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
    // Debounce keystrokes; both backends cache after the first call.
    const handle = setTimeout(() => {
      void (async () => {
        let ranked: SearchResult[] | null = null;
        const pf = await loadPagefind();
        if (pf) {
          try {
            ranked = await pagefindSearch(pf, trimmed);
          } catch {
            ranked = null; // fall through to the JSON index
          }
        }
        if (ranked === null) ranked = rankResults(await loadSearchIndex(), trimmed);
        if (cancelled) return;
        setResults(ranked);
        setIsSearching(false);
        // High-signal analytics: queries that find nothing = content gaps.
        if (ranked.length === 0) track('docs_search_no_results', { query: trimmed });
      })();
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return { results, isSearching };
}
