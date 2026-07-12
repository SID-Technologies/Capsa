import { test, expect, type Page } from '@playwright/test';

// Prerendering (SSG) integrity. Three things must stay true:
//  1. Doc routes ship real body content in the static HTML (what no-JS
//     crawlers and bots see) with exactly one set of head tags.
//  2. The browser HYDRATES that HTML — reusing the DOM, not discarding it —
//     with zero React hydration errors, in light AND dark mode (dark once
//     regressed via Tamagui's inverse-theme wrapper).
//  3. The Scalar route stays a client-rendered shell.

async function seedTheme(page: Page, mode: 'light' | 'dark', style: string) {
  await page.addInitScript(
    ([m, s]) => {
      localStorage.setItem('capsa-theme-mode', m);
      localStorage.setItem('capsa-theme-style', s);
    },
    [mode, style],
  );
}

// Stamp the first prerendered <h1> as it streams in, before any JS runs. If
// hydration succeeds React adopts that exact node; if it fails, React replaces
// the DOM and the stamp is lost.
async function installHydrationProbe(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __stampedH1?: Element };
    const observer = new MutationObserver(() => {
      const h1 = document.querySelector('#root h1');
      if (h1 && !w.__stampedH1) {
        w.__stampedH1 = h1;
        observer.disconnect();
      }
    });
    // Init scripts run at document-start, before documentElement exists —
    // `document` itself is the only observable node this early.
    observer.observe(document, { childList: true, subtree: true });
  });
}

function collectHydrationErrors(page: Page): string[] {
  const errors: string[] = [];
  const record = (text: string) => {
    if (/hydrat/i.test(text) || /Minified React error #4(18|23|25)/.test(text)) {
      errors.push(text);
    }
  };
  page.on('console', (msg) => record(msg.text()));
  // React 19 surfaces hydration mismatches as uncaught page errors (#418).
  page.on('pageerror', (err) => record(String(err)));
  return errors;
}

async function expectHydrated(page: Page, path: string) {
  const errors = collectHydrationErrors(page);
  await installHydrationProbe(page);
  await page.goto(path, { waitUntil: 'networkidle' });
  const stampSurvived = await page.evaluate(() => {
    const w = window as unknown as { __stampedH1?: Element };
    return !!w.__stampedH1 && document.contains(w.__stampedH1);
  });
  expect(stampSurvived, 'prerendered DOM must be reused by hydration').toBe(true);
  expect(errors, 'no React hydration errors on the console').toEqual([]);
}

test('doc routes ship real body content for no-JS crawlers', async ({ request }) => {
  const res = await request.get('/docs/guides/theming');
  expect(res.ok()).toBe(true);
  const html = await res.text();

  // Body content inside the root div — what a crawler without JS indexes.
  const root = html.split('<div id="root">')[1] ?? '';
  expect(root).toContain('four theme styles');
  expect(root).toContain('Quickstart'); // sidebar rendered too
  // Nav renders as real anchors — crawlers can follow links between pages.
  expect(root).toContain('href="/docs/getting-started/quickstart"');

  // Exactly one set of head tags (helmet-duplicate strip regression).
  expect(html.match(/<title>/g)).toHaveLength(1);
  expect(html.match(/property="og:title"/g)).toHaveLength(1);
  expect(html).toContain('<title>Theming — Capsa</title>');

  // Hydration payloads present.
  expect(html).toContain('__CAPSA_MANIFEST__');
  expect(html).toContain('id="capsa-theme-vars"');
});

test('docs index route is prerendered with category cards', async ({ request }) => {
  const html = await (await request.get('/docs/')).text();
  const root = html.split('<div id="root">')[1] ?? '';
  expect(root).toContain('Getting Started');
});

test('prerendered page hydrates without discarding DOM (light)', async ({ page }) => {
  await seedTheme(page, 'light', 'steel');
  await expectHydrated(page, '/docs/guides/theming/');
});

test('prerendered page hydrates without discarding DOM (dark)', async ({ page }) => {
  // Dark mode once caused a structural mismatch via Tamagui's inverse-theme
  // wrapper — this is the regression test for the style-only <Theme> fix.
  await seedTheme(page, 'dark', 'steel');
  await expectHydrated(page, '/docs/guides/theming/');
});

test('hydrated page is interactive (command palette opens)', async ({ page }) => {
  await page.goto('/docs/guides/theming/', { waitUntil: 'networkidle' });
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k');
  await expect(page.locator('.sid-cmdk-panel')).toBeVisible();
});

test('pagefind index is emitted and scoped to article bodies', async ({ page, request }) => {
  const res = await request.get('/pagefind/pagefind.js');
  expect(res.ok()).toBe(true);

  await page.goto('/docs/');
  const hits = await page.evaluate(async () => {
    const pf = await import(/* @vite-ignore */ '/pagefind/pagefind.js');
    await pf.init?.();
    const { results } = await pf.search('theming');
    const pages = await Promise.all(results.map((r: { data: () => Promise<{ url: string }> }) => r.data()));
    return pages.map((p) => p.url);
  });
  expect(hits).toContain('/docs/guides/theming/');
  // "Theming" appears in every page's SIDEBAR — if body scoping broke, every
  // doc page would match. Several pages mention theming in prose, so only a
  // full sweep (all docs) indicates a leak. The docs index page has no
  // data-pagefind-body and must never appear.
  const totalDocs = 9;
  expect(hits.length).toBeLessThan(totalDocs);
  expect(hits).not.toContain('/docs/');
});

test('command palette returns pagefind results', async ({ page }) => {
  await page.goto('/docs/', { waitUntil: 'networkidle' });
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k');
  await page.locator('.sid-cmdk-input').fill('retro');
  await expect(page.locator('.sid-cmdk-item').first()).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.sid-cmdk-item-title').first()).not.toBeEmpty();
});

test('OG card images are generated per doc', async ({ request }) => {
  const res = await request.get('/assets/og/guides/theming.png');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toContain('image/png');
  const index = await request.get('/assets/og/docs-index.png');
  expect(index.ok()).toBe(true);
});

test('sidebar links are anchors but navigate client-side', async ({ page }) => {
  await page.goto('/docs/guides/theming/', { waitUntil: 'networkidle' });
  // Mark the current document; a full page load would lose the marker.
  await page.evaluate(() => {
    (window as unknown as { __spaMarker?: boolean }).__spaMarker = true;
  });
  const link = page.locator('a.sid-nav-link[href="/docs/getting-started/quickstart"]').first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/docs\/getting-started\/quickstart$/);
  await expect(page.locator('#root h1')).toContainText('Quickstart');
  const stillSpa = await page.evaluate(
    () => (window as unknown as { __spaMarker?: boolean }).__spaMarker === true,
  );
  expect(stillSpa, 'plain click must navigate client-side, not reload').toBe(true);
});

test('landing page is prerendered at / with route marker', async ({ request }) => {
  const res = await request.get('/');
  expect(res.ok()).toBe(true);
  const html = await res.text();
  const root = html.split('<div id="root">')[1] ?? '';
  expect(root).toContain('Documentation that ships itself');
  expect(root).toContain('Get started');
  expect(html).toContain('name="capsa-prerendered" content="/"');
  expect(html.match(/<title>/g)).toHaveLength(1);
});

test('landing page hydrates without discarding DOM', async ({ page }) => {
  await expectHydrated(page, '/');
});

test('SPA fallback for non-prerendered routes renders cleanly', async ({ page }) => {
  // Unknown URLs are served the landing-page HTML (dist/index.html is the
  // static-host fallback). The route marker must force a clean client render
  // — never a hydration of home markup against a 404 tree.
  const errors = collectHydrationErrors(page);
  await page.goto('/docs/this-page-does-not-exist', { waitUntil: 'networkidle' });
  await expect(page.locator('#root')).toContainText('404');
  expect(errors).toEqual([]);
});

test('home is reserved — absent from manifest and search', async ({ request }) => {
  const manifest = (await (await request.get('/docs-manifest.json')).json()) as {
    slug: string;
  }[];
  expect(manifest.some((e) => e.slug === 'home')).toBe(false);
  expect(manifest.some((e) => e.slug === 'guides/landing-page')).toBe(true);
});

test('docs pages link to GitHub editing and back home', async ({ page, request }) => {
  const html = await (await request.get('/docs/guides/theming')).text();
  expect(html).toContain('/edit/main/content/guides/theming.mdx');
  expect(html).toContain('href="/"'); // brand wordmark → landing page

  await page.goto('/docs/guides/theming/', { waitUntil: 'networkidle' });
  await expect(page.locator('a.sid-edit-link')).toContainText('Edit this page');
  await page.locator('a.sid-nav-link[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#root h1')).toContainText('Documentation that ships itself');
});

test('changelog listing is prerendered newest-first', async ({ request }) => {
  const html = await (await request.get('/docs/changelog')).text();
  expect(html).toContain('<title>Changelog — Capsa</title>');
  const root = html.split('<div id="root">')[1] ?? '';
  const v2 = root.indexOf('v0.2.0');
  const v1 = root.indexOf('v0.1.0');
  expect(v2).toBeGreaterThan(-1);
  expect(v1).toBeGreaterThan(-1);
  expect(v2, 'newest entry listed first').toBeLessThan(v1);
  expect(root).toContain('Jul 10, 2026'); // TZ-free formatted date
});

test('changelog entry renders as a doc with its date and hydrates', async ({ page, request }) => {
  const html = await (await request.get('/docs/changelog/v0-2-0')).text();
  const root = html.split('<div id="root">')[1] ?? '';
  expect(root).toContain('Jul 10, 2026'); // breadcrumb date
  expect(root).toContain('Pagefind search'); // article body prerendered
  await expectHydrated(page, '/docs/changelog/v0-2-0/');
});

test('changelog stays out of the Documentation sidebar and docs index', async ({ request }) => {
  const doc = await (await request.get('/docs/guides/theming')).text();
  const sidebar = doc.split('<div id="root">')[1] ?? '';
  expect(sidebar).not.toContain('v0.1.0');
  const index = await (await request.get('/docs/')).text();
  const indexRoot = index.split('<div id="root">')[1] ?? '';
  // No changelog CATEGORY CARD on the docs index (cards render <h3> labels;
  // the TopNav tab and the "Changelog" guide's sidebar links are spans).
  expect(indexRoot).not.toMatch(/<h3[^>]*>Changelog</);
  expect(indexRoot).toMatch(/<h3[^>]*>Guides</); // cards themselves render
});

test('changelog entries are searchable via pagefind', async ({ page }) => {
  await page.goto('/docs/');
  const hits = await page.evaluate(async () => {
    const pf = await import(/* @vite-ignore */ '/pagefind/pagefind.js');
    await pf.init?.();
    const { results } = await pf.search('front door');
    const pages = await Promise.all(results.map((r: { data: () => Promise<{ url: string }> }) => r.data()));
    return pages.map((p) => p.url);
  });
  expect(hits).toContain('/docs/changelog/v0-2-0/');
});

test('Scalar route client-renders via the marker-mismatch fallback', async ({ page, request }) => {
  // /docs/api is not prerendered; static hosts serve the landing-page HTML as
  // the SPA fallback. The route marker ("/") must not match, forcing a clean
  // client render of the real route — never hydration of home markup.
  const html = await (await request.get('/docs/api')).text();
  expect(html).toContain('name="capsa-prerendered" content="/"');

  const errors = collectHydrationErrors(page);
  await page.goto('/docs/api', { waitUntil: 'networkidle' });
  await expect(page.locator('.t-doc__sidebar')).toBeVisible({ timeout: 30_000 });
  expect(errors).toEqual([]);
});
