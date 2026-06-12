import { useState, type ComponentProps } from 'react';
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
  // theme changes; Scalar re-applies it without a reload.
  const customCss = `
    .light-mode, .dark-mode {
      --scalar-color-1: ${tok('color12')};
      --scalar-color-2: ${tok('color11')};
      --scalar-color-3: ${tok('color10')};
      --scalar-color-accent: ${tok('accent')};
      --scalar-background-1: ${tok('background')};
      --scalar-background-2: ${tok('color2')};
      --scalar-background-3: ${tok('color3')};
      --scalar-border-color: ${tok('borderColor')};
    }
  `;

  return (
    <div className="sid-scalar" style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
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
