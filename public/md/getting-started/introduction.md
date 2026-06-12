# Capsa

Capsa is a self-hosted documentation platform you own end to end. It renders
MDX, ships a real command palette, an OpenAPI reference, theming, and AI-friendly
exports — and deploys to Cloudflare Pages (or any static host) for free.

> A *capsa* was the cylindrical case a Roman carried their scrolls in. This one
> holds yours.

## Why Capsa

:::tip
If you've used Mintlify, Capsa will feel familiar — but it's yours: no per-seat
pricing, no vendor lock-in, and the whole thing is a Vite + React app you can
edit.
:::

- **MDX content** — write Markdown, drop in React components when you need them.
- **⌘K command palette** — instant, keyboard-first search over a build-time index.
- **OpenAPI reference** — a full interactive API explorer (Scalar) from your spec.
- **Theming** — five built-in styles × light/dark, all token-driven and brandable.
- **AI-native** — generates `llms.txt`, a per-page "Copy as Markdown", and "Open in ChatGPT/Claude".
- **Authoring components** — callouts, tabbed code samples, API method badges, "see also" cards.
- **Public by default** — auth is opt-in; a fresh clone runs with no configuration.

## How it's organized

```
apps/web/
├── content/        # your docs — Markdown/MDX files map to routes
│   └── guides/intro.mdx  →  /docs/guides/intro
├── src/            # the Capsa app (components, layout, hooks)
│   └── navigation.ts     # the sidebar + section tabs
└── public/openapi/ # your OpenAPI spec(s) for the API reference
```

Markdown lives in `content/`. Everything else is the platform — you rarely touch it.

## Next

<SeeAlso>

- [Quickstart](/docs/getting-started/quickstart)
- [Writing content](/docs/guides/writing-content)
- [Deploy to Cloudflare](/docs/deploy/cloudflare)

</SeeAlso>
