import { defineConfig } from 'vitest/config';

// Unit tests for the pure logic: build-pipeline helpers (vite-plugins/) and
// framework-free utilities (src/lib/). These run in a plain Node environment
// with no Vite/Tamagui/React in the graph, so they're fast and deterministic.
// Component and end-to-end behavior is covered separately by Playwright
// (see e2e/ and `pnpm test:e2e`).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'vite-plugins/**/*.test.ts'],
    environment: 'node',
  },
});
