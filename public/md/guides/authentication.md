# Authentication

Capsa is **public by default** — a fresh clone runs with no auth providers
mounted and every route open. Add auth only when your docs should be private.

## How it works

`src/lib/auth.ts` derives two flags from the environment:

```ts
export const AUTH_ENABLED = Boolean(import.meta.env.VITE_WORKOS_CLIENT_ID);
export const IS_PUBLIC = !AUTH_ENABLED || import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
```

- **No `VITE_WORKOS_CLIENT_ID`** → auth providers never mount; `AuthGuard` renders
  through; `/` and `/login` redirect straight to `/docs`.
- **Client id set** → the WorkOS provider wraps the app, the login screen renders,
  and `AuthGuard` requires a session.
- **`VITE_DEV_BYPASS_AUTH=true`** → forces public access even when auth is
  configured (handy for local dev or a public mirror).

## Enable the included WorkOS flow

Capsa ships a working [WorkOS AuthKit](https://workos.com/) example.

1. Create a WorkOS project and AuthKit client; copy the **client id**.
2. Set the environment:

   ```bash
   VITE_WORKOS_CLIENT_ID=client_xxx
   VITE_PLATFORM_API_URL=https://api.example.com   # your token-exchange backend
   ```

3. The flow is in `src/contexts/AuthContext.tsx` and
   `src/pages/authentication/LoginPage.tsx`: WorkOS signs the user in, the app
   exchanges the WorkOS token with your backend, and the session is stored in a
   cookie.

:::warning
`VITE_WORKOS_CLIENT_ID` is a **public** client id — that's expected. Any real
secret (the token-exchange logic, API keys) must live in your backend, never in a
`VITE_*` variable.
:::

## Use a different provider

`AuthContext` is the integration seam. To swap WorkOS for Auth0, Clerk, your own
SSO, etc.:

1. Replace the provider in `src/index.tsx` (it's only mounted when `AUTH_ENABLED`).
2. Reimplement `AuthContext` to expose the same shape — `isAuthenticated`,
   `isInitialized`, and a sign-in entry point.
3. `AuthGuard` and the routing keep working unchanged, since they only read those
   two flags.

## Note on static hosting

Capsa is a static SPA, so client-side auth gates the **UI**, not the bytes — the
compiled docs are still downloadable by anyone who has the URL. For truly private
docs, put the site behind a network gate too (Cloudflare Access, a VPN, or an
authenticating proxy) in addition to the in-app login.
