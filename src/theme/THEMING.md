# Capsa Theming System

How theming works internally and how to extend it. For the user-facing guide
(pinning a theme, adding a brand theme step-by-step), see
`content/guides/theming.mdx` — this file covers the machinery underneath.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     index.html (pre-hydration)                    │
│  Inline script reads localStorage (capsa-theme-mode/-style) and   │
│  the pinned style, then sets t_<base> + t_<base>_<style> classes  │
│  on <html> before first paint — no flash of the wrong theme.      │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                Theme Controller (themeController.tsx)             │
│  - themeMode: light | dark | system   (persisted to localStorage) │
│  - themeStyle: steel | aurora | retro | shadcn   (persisted)      │
│  - PINNED_THEME_STYLE from VITE_DEFAULT_THEME_STYLE (validated)   │
│  - resolvedTheme = `${light|dark}_${style}`                       │
│  - Mirrors theme classes onto <html> so CSS variables resolve     │
│    for content portaled to <body> (Scalar modals, dropdowns)      │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         index.tsx                                 │
│  <TamaguiProvider config={config}>                                │
│    <Theme name={resolvedTheme}>  ← switches active theme          │
│      <App />                                                      │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                        themes.ts                                  │
│  createThemes({ base, accent, childrenThemes: { steel, aurora,    │
│  retro, shadcn } }) → light_steel, dark_steel, light_aurora, ...  │
│  Semantic tokens: $accent, $success, $surface, $sidebar*, ...     │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                     tamagui.config.ts                             │
│  Combines themes with tokens (space, size, radius, zIndex) and    │
│  fonts (fonts.ts). Exported for TamaguiProvider + vite plugin.    │
└──────────────────────────────────────────────────────────────────┘
```

## File Locations

| File                            | Purpose                                       |
| ------------------------------- | --------------------------------------------- |
| `src/theme/themes.ts`           | Theme definitions (palettes, semantic colors) |
| `src/theme/themeController.tsx` | React context, persistence, root classes      |
| `src/theme/tamagui.config.ts`   | Tokens + fonts + themes → Tamagui config      |
| `src/theme/fonts.ts`            | Font loading (weights) and `createFont`       |
| `index.html`                    | Pre-hydration theme script (keep in sync!)    |
| `src/pages/ApiReference.tsx`    | Bridges tokens → Scalar `--scalar-*` vars     |

## How Palettes Work

A **palette** is an array of 12 colors defining the neutral spectrum for a
theme, mapped by Tamagui to `$color1` … `$color12` (and `$background`,
`$color`, `$borderColor` anchors):

```typescript
const steelLightPalette = [
  '#f6f7f9', // color1 - background
  // ... 10 steps ...
  '#141a22', // color12 - primary text
];
```

## How Semantic Colors Work

Semantic tokens give meaning to colors so components never hardcode hex:

```tsx
<Button backgroundColor="$accent" color="$accentForeground" />
<Card borderColor="$borderDefault" shadowColor="$shadowCard" />
<Text color="$error">Something went wrong</Text>
```

Every theme style defines the same ~50-token vocabulary (accent family with
foreground pairs, status colors, surfaces/elevations, input states,
sidebar/nav, borders) so components work unchanged under any theme. Beyond
colors, themes also carry style tokens (`shadowCard`, `radiusMd`, `hoverLift`,
motion durations/easings) — this is how retro gets hard shadows and sharp
corners without component changes.

## Adding a New Theme Style

The four styles (`steel`, `aurora`, `retro`, `shadcn`) are `childrenThemes`
entries in the `createThemes({...})` call in `themes.ts`. To add one:

1. Define light/dark 12-step palettes and the semantic color objects (copy the
   `steel` block; it's the most neutral).
2. Register it under `childrenThemes` with the palettes in `palette` and the
   semantic colors spread into `extra.light` / `extra.dark`.
3. Add the name to `ThemeStyle` and `THEME_STYLES` in `themeController.tsx`.
4. Add the name to the `styles` array in the `index.html` pre-hydration script.
5. Add it to `styleOptions` in `src/components/layout/TopNav.tsx`.

Full walkthrough with code: `content/guides/theming.mdx`.

## Persistence & FOUC

- Mode and style persist to localStorage under `capsa-theme-mode` /
  `capsa-theme-style` (constants exported from `themeController.tsx`).
- The inline script in `index.html` applies the persisted (or pinned) theme
  classes to `<html>` before first paint. **Any change to the storage keys,
  class scheme, or style list must be made in both places.**
- `VITE_DEFAULT_THEME_STYLE` pins a style per deploy and hides the style
  switcher. Invalid values are ignored with a console warning.

## Root Classes & Portals

`<Theme>` scopes CSS variables to the app subtree, but Scalar (and anything
else that portals to `<body>`) renders outside it. The controller therefore
mirrors both `t_<base>` and the full `t_<base>_<style>` class onto `<html>`,
so `var(--accent)` etc. resolve to the active style everywhere.

## Token Reference

Tokens are global (theme-independent) and defined in `tamagui.config.ts`:

- **Space** (`$1` = 4px, `$2` = 8px, … Tailwind-compatible n×4 scale, negatives
  included) — padding, margin, gap.
- **Size** (`$3` = 32px, `$4` = 40px = `$true`, …) — component heights/widths.
- **Radius** (`$sm` 4px, `$md` 6px, `$lg` 8px, … plus numeric scale). For
  theme-aware radius use the theme values `$radiusSm`/`$radiusMd`/… — retro
  overrides those to 0.
- **zIndex** (`$0`–`$10`, 1 → 2000) — documented stacking contexts.

## Using Themes in Components

```tsx
// Semantic tokens (preferred)
<Button backgroundColor="$accent" color="$accentForeground" />

// Palette steps (when you need a specific neutral shade)
<View backgroundColor="$color3" />

// Label colors (tags, categories)
import { LABEL_COLOR_MAP } from '@/theme/themes';
<Badge backgroundColor={LABEL_COLOR_MAP.labelBlue} />

// Reading values in JS
import { useTheme } from 'tamagui';
const theme = useTheme();
theme.accent?.val;    // concrete value, e.g. '#4a73a8'
theme.accent?.get();  // CSS var reference on web, e.g. 'var(--accent)'
```

`.get()` is what `ApiReference.tsx` uses to bridge tokens into Scalar's
`--scalar-*` variables — the var reference keeps working when the theme flips.

## Troubleshooting

**Theme not updating?**

- `<Theme name={resolvedTheme}>` must wrap the app (see `index.tsx`).
- `ThemeProvider` (ours) must sit above `ThemedApp` — it owns the state.

**Wrong colors before React loads / flash on reload?**

- The `index.html` pre-hydration script is out of sync with
  `themeController.tsx` (keys, class names, or style list).

**Portaled content (modals, dropdowns) ignores the style theme?**

- Check `<html>` carries the full class (e.g. `t_dark_steel`), not just
  `t_dark`.

**Can't access theme values in JS?**

- Use `useTheme()` from `tamagui` (not the controller) and read `.val`.
