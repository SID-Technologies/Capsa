// Server entry for build-time prerendering (see vite-plugins/prerender.ts).
// Bundled separately via `vite build --ssr src/entry-server.tsx`.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import type { ComponentType } from 'react';

import { AppRoot, InnerApp } from './AppRoot';
import { seedDoc, seedManifest } from './hooks/useDocs';
import type { ManifestEntry } from './hooks/useDocs';
import { IS_PUBLIC } from './lib/auth';

export { buildThemeVariablesCSS } from '@/theme/injectThemeVars';
export type { ManifestEntry };

// Every MDX doc, eagerly bundled — renderToString cannot await lazy chunks.
const eagerDocs = import.meta.glob<{ default: ComponentType }>('/content/**/*.mdx', {
  eager: true,
});

export function seedServer(manifest: ManifestEntry[]): void {
  // Security invariant: gated content must never be baked into world-readable
  // static HTML. Effectively-public deploys (no auth, or explicit dev bypass)
  // are fine. The prerender plugin also bails; this is belt-and-braces.
  if (!IS_PUBLIC) {
    throw new Error('[capsa] refusing to prerender an auth-gated deploy');
  }
  seedManifest(manifest);
  for (const [path, mod] of Object.entries(eagerDocs)) {
    const slug = path.replace(/^\/content\//, '').replace(/\.mdx$/, '');
    seedDoc(slug, mod.default);
  }
}

export function render(url: string): { appHtml: string } {
  const appHtml = renderToString(
    <AppRoot>
      <StaticRouter location={url}>
        <InnerApp />
      </StaticRouter>
    </AppRoot>,
  );
  return { appHtml };
}
