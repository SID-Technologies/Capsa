import { useEffect, useMemo, useState } from 'react';
import { navigation } from '../navigation';
import type { AutoPages, NavGroup, NavTab } from '../navigation';
import { loadManifest } from './useDocs';
import type { ManifestEntry } from './useDocs';
import { titleFromFilename } from '../lib/markdown';

export interface ResolvedPage {
  type: 'page';
  slug: string;
  title: string;
}
export interface ResolvedGroup {
  type: 'group';
  group: string;
  icon?: string;
  tag?: string;
  expanded: boolean;
  items: Array<ResolvedPage | ResolvedGroup>;
}
export type ResolvedItem = ResolvedPage | ResolvedGroup;

const PRODUCT_SCOPE = import.meta.env.VITE_PRODUCT as string | undefined;

function isAuto(p: NavGroup['pages']): p is AutoPages {
  return !Array.isArray(p) && typeof (p as AutoPages).auto === 'string';
}

function titleFromSlug(slug: string): string {
  return titleFromFilename(slug.split('/').pop() ?? slug);
}

function resolvePages(
  pages: NavGroup['pages'],
  bySlug: Map<string, ManifestEntry>,
  byCategory: Map<string, ManifestEntry[]>,
): ResolvedItem[] {
  if (isAuto(pages)) {
    return (byCategory.get(pages.auto) ?? []).map((e) => ({ type: 'page', slug: e.slug, title: e.title }));
  }
  return pages
    .map((p): ResolvedItem | null => {
      if (typeof p === 'string') {
        if (!bySlug.has(p)) return null; // skip pages filtered out (hidden / scope)
        return { type: 'page', slug: p, title: bySlug.get(p)?.title ?? titleFromSlug(p) };
      }
      return resolveGroup(p, bySlug, byCategory);
    })
    .filter((x): x is ResolvedItem => x !== null);
}

function resolveGroup(
  g: NavGroup,
  bySlug: Map<string, ManifestEntry>,
  byCategory: Map<string, ManifestEntry[]>,
): ResolvedGroup {
  // Drop nested subgroups that resolved to nothing (e.g. a product filtered out
  // by VITE_PRODUCT scoping) so the sidebar never shows an empty group header.
  const items = resolvePages(g.pages, bySlug, byCategory).filter(
    (it) => it.type === 'page' || flattenPages([it]).length > 0,
  );
  return {
    type: 'group',
    group: g.group,
    icon: g.icon,
    tag: g.tag,
    expanded: g.expanded !== false,
    items,
  };
}

function flattenPages(items: ResolvedItem[]): ResolvedPage[] {
  return items.flatMap((i) => (i.type === 'page' ? [i] : flattenPages(i.items)));
}

export interface NavData {
  tabs: NavTab[];
  activeTab: number;
  groups: ResolvedGroup[];
  /** First navigable page slug of a tab (for clicking the tab). */
  firstPage: (tabIndex: number) => string | undefined;
  /** Ordered pages of the active tab, for prev/next. */
  orderedPages: ResolvedPage[];
  isLoading: boolean;
}

// Resolve the navigation config against the manifest, and figure out which tab
// the current route belongs to.
export function useNavigation(currentSlug: string | undefined, currentPath: string): NavData {
  const [manifest, setManifest] = useState<ManifestEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadManifest().then((m) => {
      if (!cancelled) setManifest(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo<NavData>(() => {
    const entries = (manifest ?? []).filter((e) => !PRODUCT_SCOPE || e.product === PRODUCT_SCOPE);
    const bySlug = new Map(entries.map((e) => [e.slug, e]));
    const byCategory = new Map<string, ManifestEntry[]>();
    for (const e of entries) {
      if (!byCategory.has(e.category)) byCategory.set(e.category, []);
      byCategory.get(e.category)!.push(e);
    }

    const tabs = navigation.tabs;
    const resolvedPerTab = tabs.map((t) =>
      t.groups
        ? t.groups
            .map((g) => resolveGroup(g, bySlug, byCategory))
            .filter((g) => flattenPages(g.items).length > 0)
        : [],
    );
    const pagesPerTab = resolvedPerTab.map((groups) => flattenPages(groups));
    const slugsPerTab = pagesPerTab.map((pages) => pages.map((p) => p.slug));

    // Active tab = the one containing the current doc, or whose href matches.
    let activeTab = 0;
    const byHref = tabs.findIndex((t) => t.href && currentPath.startsWith(t.href));
    if (byHref >= 0) {
      activeTab = byHref;
    } else if (currentSlug) {
      const byContent = slugsPerTab.findIndex((slugs) => slugs.includes(currentSlug));
      if (byContent >= 0) activeTab = byContent;
    }

    return {
      tabs,
      activeTab,
      groups: resolvedPerTab[activeTab] ?? [],
      firstPage: (i: number) => slugsPerTab[i]?.[0],
      orderedPages: pagesPerTab[activeTab] ?? [],
      isLoading: manifest === null,
    };
  }, [manifest, currentSlug, currentPath]);
}
