// Capsa is public by default. Auth is opt-in: set VITE_WORKOS_CLIENT_ID (and
// wire AuthContext to your provider) to gate the docs behind a login. With no
// client id, the auth providers aren't mounted and every route is public.
//
// VITE_DEV_BYPASS_AUTH=true forces public access even when auth is configured.

export const AUTH_ENABLED = Boolean(import.meta.env.VITE_WORKOS_CLIENT_ID);
export const IS_PUBLIC = !AUTH_ENABLED || import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
