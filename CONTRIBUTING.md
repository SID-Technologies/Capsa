# Contributing to Capsa

Thanks for your interest in improving Capsa! This guide covers local setup and
the contribution flow.

## Development setup

Requires **Node 20+** and **pnpm** (`npm i -g pnpm`).

```bash
git clone https://github.com/your-org/capsa.git
cd capsa
pnpm install
pnpm dev:web      # http://localhost:3001
```

Capsa is a pnpm monorepo:

- `apps/web` — the docs app (Vite + React + Tamagui).
- `apps/web/content` — example documentation (Markdown/MDX).
- `packages/configs` — the Tamagui config + theme presets.
- `apps/web/vite-plugins` — the build-time search-index / sitemap / llms.txt plugin.

## Scripts

| Command                             | What it does                |
| ----------------------------------- | --------------------------- |
| `pnpm dev:web`                      | Start the dev server        |
| `pnpm build:web`                    | Production build            |
| `pnpm typecheck`                    | TypeScript, no emit         |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                      |
| `pnpm format` / `pnpm format:check` | Prettier                    |
| `pnpm check:links`                  | Validate internal doc links |

## Before you open a PR

Run the same checks CI runs:

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm build:web && pnpm check:links
```

(`pnpm format` will auto-fix formatting.)

## Pull requests

1. Fork and create a branch off `main`.
2. Keep changes focused; one logical change per PR.
3. Update docs/examples if you change behavior.
4. Make sure CI is green.
5. Fill out the PR template.

## Reporting bugs / requesting features

Use the issue templates. For security issues, see [SECURITY.md](./SECURITY.md) —
please do **not** open a public issue.

## Code of Conduct

Be respectful and constructive. This project follows the
[Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
By participating, you agree to uphold it.
