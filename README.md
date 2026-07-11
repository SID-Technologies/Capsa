# Capsa

**A self-hosted documentation platform. Fast as in Vite, free as in libre.**

[![CI](https://github.com/SID-Technologies/Capsa/actions/workflows/ci.yml/badge.svg)](https://github.com/SID-Technologies/Capsa/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![Made with Vite](https://img.shields.io/badge/Vite-React_19-646cff.svg)](https://vitejs.dev)

Capsa renders MDX into a polished docs site — prerendered static HTML, command
palette search, OpenAPI reference, theming, social cards, AI-friendly exports —
and deploys to Cloudflare Pages (or any static host) for free. It's a Vite +
React + Tamagui app you fully own and can edit.

**[Live demo](https://capsa.romans.dev)** · **[Documentation](https://capsa.romans.dev/docs)**

<!-- TODO: add a screenshot or GIF of the docs (palette open + a themed page) here. -->
<!-- ![Capsa](./docs/screenshot.png) -->

> Using Capsa for your own docs? Point the badges, demo link, and `VITE_GITHUB_URL`
> at your repo and deployment.

> A _capsa_ was the cylindrical case a Roman carried their scrolls in. This one
> holds yours.

## Features

- **MDX content** — Markdown with React components when you need them.
- **Landing page** — drop in `content/home.mdx` and `/` becomes a real home
  page with hero, feature-grid, and CTA components; delete it and `/` redirects
  to the docs.
- **Prerendered (SSG)** — every doc ships as real static HTML with the full
  article and crawlable nav links, then hydrates into the SPA. SEO-complete
  out of the box: titles, descriptions, OpenGraph, canonical URLs, sitemap.
- **⌘K command palette** — keyboard-first search powered by
  [Pagefind](https://pagefind.app) over the prerendered pages (typo-tolerant,
  fully static, no search service), with a build-time JSON index as fallback.
- **Social cards** — a branded 1200×630 `og:image` PNG is generated per page
  at build time, so shared links unfurl with real previews.
- **OpenAPI reference** — an interactive API explorer (Scalar) from your spec,
  fully themed to match the site.
- **Theming** — four styles × light/dark, token-driven and brandable, with
  zero-flash persistence.
- **AI-native** — generates `llms.txt`, per-page "Copy as Markdown", and "Open in ChatGPT/Claude".
- **Edit this page** — every doc links to its source on GitHub (menu + below
  the article), so readers can send fixes.
- **Authoring components** — callouts, tabbed code samples, API method badges, see-also cards.
- **Multi-deploy** — env-driven, so one codebase powers many branded docs sites.
- **Public by default** — auth is opt-in; a fresh clone runs with zero config.
  (Auth-gated deploys automatically skip prerendering so gated content never
  lands in static HTML.)

## Quickstart

```bash
# Use this repo as a GitHub template, or clone it
pnpm install
pnpm dev        # http://localhost:3001
```

Add a page by dropping a Markdown file under `content/` and listing it
in `src/navigation.ts`. See the live docs (this repo _is_ a Capsa site):
**Getting Started → Quickstart**.

## Build

```bash
pnpm build      # SSR bundle → prerendered client build → dist
```

One command runs the whole pipeline: an SSR bundle is built first, then the
client build prerenders every doc route into static HTML (with per-page head
tags, social-card PNGs, and the Pagefind search index in `dist/`). The search
index JSON, sitemap, `llms.txt`, and per-page Markdown land in `public/`.

Set `PRERENDER=0` to skip prerendering and ship the plain SPA with head-only
per-route pages (the previous behavior — also the automatic fallback if any
prerender step fails).

## Test

```bash
pnpm test:e2e   # Playwright smoke tests against the production build
```

Covers theming, Scalar integration, prerender/hydration integrity, search,
and social-card output. Uses your installed Chrome — no browser download.

## Deploy

Cloudflare Pages, with:

| Setting          | Value                        |
| ---------------- | ---------------------------- |
| Build command    | `pnpm install && pnpm build` |
| Output directory | `dist`                       |

Full guide (Wrangler, custom domain, Docker self-host) is in the docs under
**Deploy → Deploy to Cloudflare**.

## Configuration

All optional, all env vars — a bare deploy needs none:

| Variable                   | Effect                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `VITE_SITE_NAME`           | Brand name (default `Capsa`)                                      |
| `VITE_DEFAULT_THEME_STYLE` | Pin a theme + hide the switcher                                   |
| `VITE_SITE_URL`            | Enables `sitemap.xml`, canonical + `og:image` tags, absolute URLs |
| `VITE_POSTHOG_KEY`         | Enables analytics (off by default)                                |
| `VITE_WORKOS_CLIENT_ID`    | Opt into auth (public by default; disables prerendering)          |
| `PRERENDER=0`              | Build-time: skip SSG, ship the plain SPA                          |

See **Configuration** in the docs for the full list.

## Stack

Vite · React 19 · TypeScript · Tamagui · MDX · Scalar (OpenAPI) · Pagefind (search) · Satori (social cards).

## License

[Apache-2.0](./LICENSE).
