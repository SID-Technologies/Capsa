// Privacy-respecting, env-gated analytics (PostHog). Nothing initializes
// unless VITE_POSTHOG_KEY is set — so a default deploy ships zero tracking.
// Custom events power the high-signal data: failed searches (content gaps),
// 404s, per-doc feedback, and copy-page / open-in-LLM actions.
//
// posthog-js is loaded via dynamic import so it never enters the SSR module
// graph (this file is imported at module scope from App.tsx and useDocs.ts,
// which the prerender bundle also loads). Events fired before the import
// resolves are dropped — acceptable for the first milliseconds of a visit.

type PostHogClient = (typeof import('posthog-js'))['default'];

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';

let client: PostHogClient | null = null;

export function initAnalytics(): void {
  if (!KEY || client || typeof window === 'undefined') return;
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: false, // we fire $pageview on route change (SPA)
      capture_pageleave: true,
      autocapture: false,
    });
    client = posthog;
  });
}

export function trackPageview(path: string): void {
  client?.capture('$pageview', { path });
}

export function track(event: string, props?: Record<string, unknown>): void {
  client?.capture(event, props);
}
