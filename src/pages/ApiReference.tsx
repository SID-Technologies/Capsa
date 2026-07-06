import { useState, type ComponentProps, type CSSProperties } from 'react';
import { ApiReferenceReact } from '@scalar/api-reference-react';
// Explicit stylesheet import — the component imports this internally, but doing
// it here guarantees Vite pulls Scalar's CSS into the lazy chunk.
import '@scalar/api-reference-react/style.css';
import { useTheme } from 'tamagui';
import { useThemeController } from '@/theme/themeController';

import { apiVersions } from '../apiVersions';

// API reference, rendered by Scalar from the versioned OpenAPI specs in
// public/openapi/ (see apiVersions.ts). Lazy-loaded in App.tsx.
//
// Theme: Scalar is a self-contained component that themes via its own
// `--scalar-*` CSS variables, so we (a) force its light/dark state from the app
// and (b) bridge our Tamagui tokens into those variables via `customCss`. Both
// apply in place via Scalar's reactive `updateConfiguration` — no remount, no
// flash on theme flip. See the "API Reference" guide to customize.
export default function ApiReference() {
  const [version, setVersion] = useState(apiVersions[0]);
  const { isDark } = useThemeController();
  const theme = useTheme();
  const tok = (k: string) => (theme[k as keyof typeof theme]?.get?.() as string | undefined) ?? '';

  // Map Tamagui theme tokens → Scalar's CSS variables. Recomputed whenever the
  // theme changes; Scalar re-applies it without a reload. tok() yields CSS var
  // references, which resolve because themeController mirrors the full theme
  // class onto <html> — including for Scalar UI portaled to <body>.
  const customCss = `
    .light-mode, .dark-mode {
      /* Text + surfaces */
      --scalar-color-1: ${tok('color12')};
      --scalar-color-2: ${tok('color11')};
      --scalar-color-3: ${tok('color10')};
      --scalar-color-accent: ${tok('accent')};
      --scalar-background-1: ${tok('background')};
      --scalar-background-2: ${tok('color2')};
      --scalar-background-3: ${tok('color3')};
      --scalar-background-accent: ${tok('accentLight')};
      --scalar-border-color: ${tok('borderColor')};

      /* Typography — match the site (Space Grotesk body, system mono code) */
      --scalar-font: 'Space Grotesk', sans-serif;
      --scalar-font-code: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

      /* Corner radius follows the theme (retro = sharp corners) */
      --scalar-radius: ${tok('radiusMd')};
      --scalar-radius-lg: ${tok('radiusLg')};
      --scalar-radius-xl: ${tok('radiusXl')};

      /* Primary buttons ("Send request", auth) */
      --scalar-button-1: ${tok('accent')};
      --scalar-button-1-hover: ${tok('accentDark')};
      --scalar-button-1-color: ${tok('accentForeground')};

      /* HTTP method + status colors from the theme's status palette */
      --scalar-color-green: ${tok('success')};
      --scalar-color-red: ${tok('error')};
      --scalar-color-yellow: ${tok('warning')};
      --scalar-color-blue: ${tok('info')};
      --scalar-color-orange: ${tok('labelOrange')};
      --scalar-color-purple: ${tok('labelPurple')};
    }
    .light-mode .t-doc__sidebar, .dark-mode .t-doc__sidebar {
      /* Scalar's own sidebar — mirror the exact tokens the app sidebar uses
         (Sidebar.tsx): $background surface, $color3/$color4 hover/active,
         and the same search-field treatment as the "Search" opener. */
      --scalar-sidebar-background-1: ${tok('background')};
      --scalar-sidebar-color-1: ${tok('color12')};
      --scalar-sidebar-color-2: ${tok('color11')};
      --scalar-sidebar-border-color: ${tok('borderColor')};
      --scalar-sidebar-item-hover-background: ${tok('color3')};
      --scalar-sidebar-item-active-background: ${tok('color4')};
      --scalar-sidebar-color-active: ${tok('color12')};
      --scalar-sidebar-search-background: ${tok('color3')};
      --scalar-sidebar-search-border-color: ${tok('borderColor')};
      --scalar-sidebar-search-color: ${tok('colorPress')};
    }
    /* Match the app's search opener (Sidebar.tsx) exactly: 36px tall,
       8/12px padding, 8px gap, radius $lg, 13.5px label, 15px icon. */
    .sid-scalar .bg-sidebar-b-search {
      border-radius: ${tok('radiusLg')};
      font-size: 13.5px;
      height: 36px;
      padding: 0 12px;
      gap: 8px;
    }
    .sid-scalar .bg-sidebar-b-search svg {
      width: 15px;
      height: 15px;
    }
    .sid-scalar .bg-sidebar-b-search:hover {
      border-color: ${tok('accentBorder')};
    }
    /* The ⌘K shortcut renders as a bordered chip in the app sidebar — style
       Scalar's plain-text shortcut the same way. */
    .sid-scalar .bg-sidebar-b-search kbd,
    .sid-scalar .bg-sidebar-b-search .sidebar-search-shortcut {
      background: ${tok('color2')};
      border: 1px solid ${tok('borderColor')};
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 11px;
      font-weight: 400;
      line-height: normal;
      color: ${tok('color10')};
    }
    /* Hide Scalar's "Ask AI" assistant (button + its modal entry point) —
       no config flag for it in this version. The button shares
       .bg-sidebar-b-search with the search field; .whitespace-nowrap is
       unique to it (search is .w-full). */
    .sid-scalar .t-doc__sidebar button.bg-sidebar-b-search.whitespace-nowrap {
      display: none;
    }
  `;

  return (
    <div
      className="sid-scalar"
      style={
        {
          height: '100%',
          overflow: 'auto',
          position: 'relative',
          // Scalar sizes its sticky sidebar as 100dvh minus this var (default
          // 0). Our top nav is 56px (TopNav.tsx); without it the sidebar
          // footer lands 56px below the fold. Set inline (not via customCss,
          // which Scalar applies asynchronously) so the first layout is right.
          '--scalar-custom-header-height': '56px',
          // Match the app sidebar's width (Sidebar.tsx) — Scalar defaults wider.
          '--scalar-sidebar-width': '280px',
        } as CSSProperties
      }
    >
      {/* Version switcher — only shown once there's more than one version. */}
      {apiVersions.length > 1 && (
        <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
          <select
            value={version.url}
            onChange={(e) => setVersion(apiVersions.find((v) => v.url === e.target.value) ?? apiVersions[0])}
            style={{
              fontSize: 13,
              padding: '4px 8px',
              borderRadius: 6,
              border: `1px solid ${tok('borderColor') || '#333'}`,
              background: tok('background') || '#fff',
              color: tok('color12') || '#111',
            }}
          >
            {apiVersions.map((v) => (
              <option key={v.url} value={v.url}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <ApiReferenceReact
        // Key on the version only — a version switch reloads the spec cleanly.
        // Theme changes are applied in place (no isDark here), so no flash.
        key={version.url}
        configuration={
          {
            url: version.url,
            // Follow the app's theme instead of Scalar's own persisted state.
            forceDarkModeState: isDark ? 'dark' : 'light',
            hideDarkModeToggle: true,
            // Hide the Developer Tools / Configure / Share / Deploy toolbar.
            // `showToolbar` is missing from this wrapper's stale types but is
            // supported at runtime — hence the cast.
            showToolbar: 'never',
            // Match the active Capsa theme.
            customCss,
          } as ComponentProps<typeof ApiReferenceReact>['configuration']
        }
      />
    </div>
  );
}
