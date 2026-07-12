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

// Format an ISO date string (YYYY-MM-DD) as "Jul 10, 2026" WITHOUT going
// through Date/toLocaleDateString: UTC-midnight parsing shifts a day across
// timezones, and prerendered pages must render the identical string during
// hydration on any client. Pure string math is deterministic everywhere.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1] ?? m[2];
  return `${month} ${Number(m[3])}, ${m[1]}`;
}
