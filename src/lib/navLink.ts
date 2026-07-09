import type { MouseEvent } from 'react';

// Nav elements render as real <a href> so prerendered pages are crawlable and
// cmd/ctrl/middle-click open-in-new-tab works — while plain left clicks stay
// client-side (no full reload).
export function spaClick(navigateTo: () => void) {
  return (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return; // let the browser handle new-tab/window/download clicks
    }
    e.preventDefault();
    navigateTo();
  };
}

/** Spread onto a Tamagui stack to render it as an SPA-friendly anchor. */
export function anchorNavProps(href: string, navigateTo: () => void) {
  return {
    tag: 'a',
    href,
    className: 'sid-nav-link',
    onClick: spaClick(navigateTo),
  } as const;
}
