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
  const path = window.location.pathname;
  if (path === '/' || path === '') {
    await preloadDoc('home');
    return;
  }
  const m = path.match(/^\/docs\/(.+?)\/?$/);
  if (m && m[1] !== 'api') await preloadDoc(decodeURIComponent(m[1]));
}

const normalizePath = (p: string) => p.replace(/\/+$/, '') || '/';

// The prerender plugin stamps every page with the route it was rendered for.
// dist/index.html (the landing page, when one exists) is ALSO the SPA
// fallback for non-prerendered URLs — hydrating its markup against a
// different route's tree would blow up, so hydrate only on a marker match.
function isPrerenderOfCurrentRoute(): boolean {
  if (!root.firstElementChild) return false;
  const marker = document.querySelector('meta[name="capsa-prerendered"]')?.getAttribute('content');
  if (!marker) return true; // legacy prerender without marker — best effort
  return normalizePath(marker) === normalizePath(window.location.pathname);
}

async function start(): Promise<void> {
  if (isPrerenderOfCurrentRoute()) {
    // Prerendered HTML (see vite-plugins/prerender.ts) — seed, then hydrate.
    try {
      await seedForHydration();
      hydrateRoot(root, tree);
      return;
    } catch (err) {
      // A blank-then-render beats hydrating against mismatched content.
      console.warn('[capsa] hydration seeding failed — client rendering', err);
    }
  }
  // Dev server, /docs/api shell, SPA fallback for non-prerendered routes
  // (marker mismatch), or the seed failure above.
  root.replaceChildren();
  createRoot(root).render(tree);
}

void start();
