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

test('Scalar route stays a client-rendered shell', async ({ request }) => {
  const html = await (await request.get('/docs/api')).text();
  const root = html.split('<div id="root">')[1] ?? '';
  // No prerendered content for the API route — it renders client-side.
  expect(root.slice(0, 20).trim().startsWith('</div>')).toBe(true);
});
