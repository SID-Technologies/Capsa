import { test, expect, type Page } from '@playwright/test';

// Regression tests for the theming pipeline. These exist because the style
// themes once silently fell back to base light/dark everywhere CSS variables
// were consumed (theme-builder drops childrenThemes `extra`; see themes.ts) —
// the kind of break that is invisible to typecheck and build.

// Expected semantic values per theme (source of truth: src/theme/themes.ts).
const STEEL_DARK_ACCENT = '#5b86bd';
const RETRO_LIGHT_ACCENT = '#d97706';
const AURORA_DARK_ACCENT = '#8b5cf6';

async function seedTheme(page: Page, mode: 'light' | 'dark', style: string) {
  await page.addInitScript(
    ([m, s]) => {
      localStorage.setItem('capsa-theme-mode', m);
      localStorage.setItem('capsa-theme-style', s);
    },
    [mode, style],
  );
}

// Computed value of a CSS custom property on the Scalar root (var()s resolved).
async function scalarVar(page: Page, name: string): Promise<string> {
  const root = page.locator('.light-mode, .dark-mode').first();
  await root.waitFor({ timeout: 30_000 });
  return root.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop).trim(), name);
}

test('pre-hydration script applies persisted theme classes to <html>', async ({ page }) => {
  await seedTheme(page, 'dark', 'steel');
  await page.goto('/docs');
  const html = page.locator('html');
  await expect(html).toHaveClass(/t_dark_steel/);
  await expect(html).toHaveClass(/t_dark(\s|$)/);
  await expect(html).toHaveAttribute('data-theme', 'dark_steel');
});

test('Scalar API reference inherits steel dark theme', async ({ page }) => {
  await seedTheme(page, 'dark', 'steel');
  await page.goto('/docs/api');
  expect(await scalarVar(page, '--scalar-color-accent')).toBe(STEEL_DARK_ACCENT);
  expect(await scalarVar(page, '--scalar-font')).toContain('Space Grotesk');
});

test('Scalar API reference inherits retro theme (accent + sharp corners)', async ({ page }) => {
  await seedTheme(page, 'light', 'retro');
  await page.goto('/docs/api');
  expect(await scalarVar(page, '--scalar-color-accent')).toBe(RETRO_LIGHT_ACCENT);
  expect(await scalarVar(page, '--scalar-radius')).toBe('0px');
});

test('semantic tokens resolve per style theme at the root (portal-safe)', async ({ page }) => {
  await seedTheme(page, 'dark', 'aurora');
  await page.goto('/docs');
  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
  );
  expect(accent).toBe(AURORA_DARK_ACCENT);
});

test('Scalar chrome: Ask AI hidden, sidebar footer sticks inside viewport', async ({ page }) => {
  await seedTheme(page, 'dark', 'steel');
  await page.goto('/docs/api');
  const sidebar = page.locator('.t-doc__sidebar');
  await sidebar.waitFor({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: /ask ai/i })).toBeHidden();
  // Sidebar (sticky, holds the footer) must not extend past the viewport —
  // requires --scalar-custom-header-height to account for the 56px top nav.
  // Poll: Scalar applies customCss asynchronously after first paint.
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  await expect
    .poll(() => sidebar.evaluate((el) => el.getBoundingClientRect().bottom), { timeout: 15_000 })
    .toBeLessThanOrEqual(viewportHeight + 1);
});

test('per-route HTML ships page-specific head tags for unfurl bots', async ({ request }) => {
  // No JS execution here — this is exactly what a link-preview bot sees.
  const res = await request.get('/docs/guides/theming');
  expect(res.ok()).toBe(true);
  const html = await res.text();
  expect(html).toContain('<title>Theming — Capsa</title>');
  expect(html).toMatch(/<meta property="og:title" content="Theming"/);
  expect(html).toMatch(/<meta property="og:type" content="article"/);
});
