# Deploy to Cloudflare Pages

Capsa builds to a static site, so it runs on Cloudflare Pages and the global edge
for free. Two ways: the dashboard (Git integration) or the Wrangler CLI.

## Prerequisites

- A Cloudflare account (the free plan is enough).
- Your docs pushed to GitHub or GitLab.
- The repo pins pnpm via the root `package.json` `"packageManager"` field, so
  Cloudflare uses the right pnpm version automatically.

## Option A — Git integration (recommended)

1. Push your docs repo to GitHub/GitLab.
2. In the dashboard: **Workers & Pages → Create → Pages → Connect to Git**, and
   pick your repo.
3. Set the build configuration:

| Setting | Value |
|---------|-------|
| Framework preset | None |
| Root directory | `/` (repo root) |
| Build command | `pnpm install && pnpm build` |
| Build output directory | `dist` |

4. Under **Settings → Variables and Secrets**, add a **build variable** to pin
   Node, plus any site config:

| Variable | Example |
|----------|---------|
| `NODE_VERSION` | `20` |
| `VITE_SITE_NAME` | `Acme Docs` |
| `VITE_SITE_URL` | `https://docs.acme.com` |

5. **Save and Deploy.** Every push to your production branch redeploys; every
   other branch and PR gets a preview URL.

:::tip
Set `VITE_SITE_URL` to your final domain so `sitemap.xml` and `llms.txt` get
absolute URLs.
:::

## SPA routing

Capsa is a single-page app, so deep links like `/docs/guides/intro` must serve
`index.html` and let the client router take over. This repo ships a
`wrangler.jsonc` that configures exactly that:

```jsonc title="wrangler.jsonc"
{
  "name": "capsa",
  "compatibility_date": "2026-06-15",
  "assets": {
    "not_found_handling": "single-page-application"
  }
}
```

Real files (`/assets/*`, `/openapi/*`, `/llms.txt`) still take precedence — only
unmatched paths fall through to the app.

:::warning
Don't add a `_redirects` file with `/* /index.html 200` — Cloudflare's Workers
Assets handles SPA fallback via `not_found_handling` above, and the catch-all
rule is rejected as a redirect loop.
:::

## Environment variables are build-time

Vite inlines `VITE_*` variables **at build time**, so set them as Pages build
variables *before* the build — changing one requires a redeploy.

:::warning
`VITE_*` values are compiled into the public bundle. **Never** put a secret
(API key, token) in one. The included WorkOS auth uses a public client id, which
is fine; anything truly secret belongs in a server/Function, not a `VITE_` var.
:::

Production and Preview environments can hold different values — e.g. point
preview deploys at a staging `VITE_SITE_URL`.

## Option B — Wrangler (CLI)

```bash
pnpm build
npx wrangler pages deploy dist --project-name your-docs
```

Set variables in the dashboard, or per deploy with `--var`:

```bash
npx wrangler pages deploy dist --project-name your-docs \
  --var VITE_SITE_NAME:"Acme Docs"
```

## Custom domain

In your Pages project: **Custom domains → Set up a domain**, point DNS at
Cloudflare, and you're live on HTTPS in a minute or two.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Doc URLs 404 on refresh / direct load | Ensure `public/_redirects` exists (see above). |
| Build fails: `pnpm: not found` | Keep the `"packageManager"` field in root `package.json`; Cloudflare reads it. |
| Build fails on an old Node | Set the `NODE_VERSION` build variable (e.g. `20`). |
| Blank page, console errors about a base path | Don't set a Vite `base` unless serving from a subpath. |
| Config change didn't apply | `VITE_*` vars are build-time — redeploy after changing them. |

## Self-hosting instead

A `Dockerfile` (nginx, with SPA fallback built in) is included if you'd rather
run it yourself:

```bash
docker build -t my-docs .
docker run -p 8080:80 my-docs
```
