import posthog from 'posthog-js';

// Privacy-respecting, env-gated analytics (PostHog). Nothing initializes
// unless VITE_POSTHOG_KEY is set — so a default deploy ships zero tracking.
// Custom events power the high-signal data: failed searches (content gaps),
// 404s, per-doc feedback, and copy-page / open-in-LLM actions.

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';

let enabled = false;

export function initAnalytics(): void {
  if (!KEY || enabled) return;
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // we fire $pageview on route change (SPA)
    capture_pageleave: true,
    autocapture: false,
  });
  enabled = true;
}

export function trackPageview(path: string): void {
  if (enabled) posthog.capture('$pageview', { path });
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (enabled) posthog.capture(event, props);
}
