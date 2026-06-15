export interface DocMeta {
  slug: string;
  title: string;
  path: string;
  category: string;
}

export interface DocContent extends DocMeta {
  content: string;
}

// Build a title from a filename: "auth-billing-flow.md" → "Auth Billing Flow"
export function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// A heading in the on-page table of contents.
// Sourced from the rendered DOM (rehype-slug-generated ids) — see DocPage —
// so TOC ids always match the real heading anchors. No second slugifier.
export interface TocEntry {
  id: string;
  text: string;
  level: number;
}
