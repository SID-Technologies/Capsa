# Capsa

**A self-hosted documentation platform. Fast as in Vite, free as in libre.**

[![CI](https://github.com/SID-Technologies/Capsa/actions/workflows/ci.yml/badge.svg)](https://github.com/SID-Technologies/Capsa/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![Made with Vite](https://img.shields.io/badge/Vite-React_19-646cff.svg)](https://vitejs.dev)

Capsa renders MDX into a polished docs site — command palette, OpenAPI reference,
theming, AI-friendly exports — and deploys to Cloudflare Pages (or any static
host) for free. It's a Vite + React + Tamagui app you fully own and can edit.

**[Live demo](https://capsa.pages.dev)** · **[Documentation](https://capsa.pages.dev/docs)**

<!-- TODO: add a screenshot or GIF of the docs (palette open + a themed page) here. -->
<!-- ![Capsa](./docs/screenshot.png) -->

> Using Capsa for your own docs? Point the badges, demo link, and `VITE_GITHUB_URL`
> at your repo and deployment.

> A _capsa_ was the cylindrical case a Roman carried their scrolls in. This one
> holds yours.

## Features

- **MDX content** — Markdown with React components when you need them.
- **⌘K command palette** — keyboard-first search over a build-time index.
- **OpenAPI reference** — an interactive API explorer (Scalar) from your spec.
- **Theming** — five styles × light/dark, token-driven and brandable.
- **AI-native** — generates `llms.txt`, per-page "Copy as Markdown", and "Open in ChatGPT/Claude".
- **Authoring components** — callouts, tabbed code samples, API method badges, see-also cards.
- **Multi-deploy** — env-driven, so one codebase powers many branded docs sites.
- **Public by default** — auth is opt-in; a fresh clone runs with zero config.

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
pnpm build      # output → dist
```

The build also emits the search index, sitemap, `llms.txt`, and per-page Markdown
into `public/`.

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

| Variable                   | Effect                                            |
| -------------------------- | ------------------------------------------------- |
| `VITE_SITE_NAME`           | Brand name (default `Capsa`)                      |
| `VITE_DEFAULT_THEME_STYLE` | Pin a theme + hide the switcher                   |
| `VITE_SITE_URL`            | Enables `sitemap.xml` + absolute `llms.txt` links |
| `VITE_POSTHOG_KEY`         | Enables analytics (off by default)                |
| `VITE_WORKOS_CLIENT_ID`    | Opt into auth (public by default)                 |

See **Configuration** in the docs for the full list.

## Stack

Vite · React 19 · TypeScript · Tamagui · MDX · Scalar (OpenAPI).

## License

[Apache-2.0](./LICENSE).
