import path from 'path';
import { fileURLToPath } from 'url';

import mdx from '@mdx-js/rollup';
import { tamaguiPlugin } from '@tamagui/vite-plugin';
import react from '@vitejs/plugin-react';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import remarkCodeTitle from './src/lib/remark-code-title';
import remarkDirectiveCallouts from './src/lib/remark-directive-callouts';
import { searchIndexPlugin } from './vite-plugins/search-index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    searchIndexPlugin({
      contentDir: path.resolve(__dirname, './content'),
      outFile: path.resolve(__dirname, './public/search-index.json'),
      manifestFile: path.resolve(__dirname, './public/docs-manifest.json'),
      // Sitemap only emitted when a public base URL is configured.
      sitemapFile: path.resolve(__dirname, './public/sitemap.xml'),
      siteUrl: process.env.VITE_SITE_URL,
      // llms.txt — AI-agent discoverability (always emitted).
      llmsFile: path.resolve(__dirname, './public/llms.txt'),
      llmsFullFile: path.resolve(__dirname, './public/llms-full.txt'),
      // Per-page raw markdown for the "Copy page" action (served at /md/<slug>.md).
      pagesDir: path.resolve(__dirname, './public/md'),
      siteTitle: process.env.VITE_SITE_NAME || 'Capsa',
    }),
    // MDX must run before the React plugin so its JSX output is transformed.
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        // remarkFrontmatter strips the YAML block so it doesn't render;
        // remarkDirective parses :::callout syntax; remarkDirectiveCallouts
        // (after it) converts those nodes into <callout> elements.
        remarkPlugins: [
          remarkFrontmatter,
          remarkGfm,
          remarkDirective,
          remarkDirectiveCallouts,
          remarkCodeTitle,
        ],
        // ignoreMissing: don't fail the build on an unknown language fence
        // (e.g. ```mermaid / ```text). Highlighting runs at build time, so no
        // highlight.js ships in the client bundle.
        rehypePlugins: [rehypeSlug, [rehypeHighlight, { ignoreMissing: true }]],
      }),
    },
    react(),
    tamaguiPlugin({
      config: path.resolve(__dirname, './src/tamagui.config.ts'),
      components: ['@tamagui/core'],
      logTimings: true,
      disableExtraction: process.env.NODE_ENV === 'development',
    }),
    tsconfigPaths(),
  ],

  define: {
    __DEV__: process.env.NODE_ENV !== 'production',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        // Split the heavy framework deps out of the main entry. Scalar stays in
        // its own lazy chunk (loaded only on the API route) — not matched here.
        // remark/rehype/highlight.js run at build time in the MDX plugin, so
        // they are not in the client bundle at all.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            if (id.includes('@tamagui') || /[\\/]tamagui[\\/]/.test(id)) return 'vendor-tamagui';
            if (id.includes('@tabler')) return 'vendor-icons';
            if (id.includes('@mdx-js')) return 'vendor-mdx';
          }
          if (id.includes('/src/theme/')) return 'vendor-themes';
        },
      },
    },
  },

  server: {
    port: 3001,
    open: true,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), path.resolve(__dirname, 'node_modules')],
    },
  },
});
