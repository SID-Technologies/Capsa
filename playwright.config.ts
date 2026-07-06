import { defineConfig } from '@playwright/test';

// E2E smoke tests run against the production build via `vite preview`.
// Run `pnpm build` first (CI does; locally the preview server fails fast with
// a clear error if dist/ is missing). Uses the installed Google Chrome
// (channel: 'chrome') so no browser download is needed locally or in CI —
// GitHub's ubuntu runners ship Chrome stable.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
