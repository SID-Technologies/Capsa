// Fonts are loaded by src/theme/fonts.ts (imported via the Tamagui config).
import './highlight.css';
import './docs.css';

import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppRoot, InnerApp } from './AppRoot';
import { injectThemeVariables } from '@/theme/injectThemeVars';
import { initAnalytics } from './lib/analytics';
import { getManifestSync, loadManifest, preloadDoc } from './hooks/useDocs';

initAnalytics();
injectThemeVariables();

const root = document.getElementById('root') as HTMLElement;
const tree = (
  <AppRoot>
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  </AppRoot>
);

// Prerendered pages need the manifest and the current route's doc component
// available SYNCHRONOUSLY at first render, or React's hydration pass would
// render a spinner against real content and throw the DOM away.
async function seedForHydration(): Promise<void> {
  if (!getManifestSync()) await loadManifest();
  const m = window.location.pathname.match(/^\/docs\/(.+?)\/?$/);
  if (m && m[1] !== 'api') await preloadDoc(decodeURIComponent(m[1]));
}

async function start(): Promise<void> {
  if (root.firstElementChild) {
    // Prerendered HTML (see vite-plugins/prerender.ts) — seed, then hydrate.
    try {
      await seedForHydration();
      hydrateRoot(root, tree);
      return;
    } catch (err) {
      // A blank-then-render beats hydrating against mismatched content.
      console.warn('[capsa] hydration seeding failed — client rendering', err);
      root.replaceChildren();
    }
  }
  // Dev server, /docs/api shell, 404s, or the fallback above.
  createRoot(root).render(tree);
}

void start();
