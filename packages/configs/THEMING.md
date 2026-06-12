# Torch Theming System

This document explains how theming works in the Torch platform and how to create new themes.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  AccountThemeSettings.tsx / DashboardNavbar (theme toggle)      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Theme Controller                            │
│  themeController.tsx                                             │
│  - Manages themeMode (light/dark/system)                        │
│  - Manages accentColor (blue/green/purple/etc)                  │
│  - Detects system preference                                     │
│  - Exports: resolvedTheme, isDark, setThemeMode, setAccentColor │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  <TamaguiProvider>                                               │
│    <Theme name={resolvedTheme}>  ← switches active theme        │
│      {children}                                                  │
│    </Theme>                                                      │
│  </TamaguiProvider>                                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      themes.ts                                   │
│  Defines all theme palettes and semantic colors                  │
│  - Base themes: light, dark                                      │
│  - Accent theme: inverse palette                                 │
│  - Child themes: blue, red, yellow, green                       │
│  - Semantic tokens: $accent, $success, $error, etc.             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    tamagui.config.ts                             │
│  Combines themes with tokens (space, size, radius, fonts)        │
│  Exports final config for TamaguiProvider                        │
└─────────────────────────────────────────────────────────────────┘
```

## File Locations

| File                                       | Purpose                              |
| ------------------------------------------ | ------------------------------------ |
| `packages/configs/src/themes.ts`           | Theme definitions (palettes, colors) |
| `packages/configs/src/themeController.tsx` | React context for theme state        |
| `packages/configs/src/tamagui.config.ts`   | Main Tamagui configuration           |
| `apps/web/src/App.tsx`                     | Applies theme to app                 |

## How Palettes Work

A **palette** is an array of 12 colors that define the grayscale spectrum for a theme:

```typescript
// Light palette: white → black
const lightPalette = [
  '#fff', // color1 - lightest (background)
  '#f8f8f8', // color2
  'hsl(0, 0%, 96%)', // color3
  'hsl(0, 0%, 94%)', // color4
  'hsl(0, 0%, 92%)', // color5
  'hsl(0, 0%, 90%)', // color6
  'hsl(0, 0%, 88%)', // color7
  'hsl(0, 0%, 81%)', // color8
  'hsl(0, 0%, 56%)', // color9
  'hsl(0, 0%, 50%)', // color10
  'hsl(0, 0%, 42%)', // color11
  'hsl(0, 0%, 9%)', // color12 - darkest (text)
];

// Dark palette: black → white (inverted)
const darkPalette = [
  '#050505', // color1 - darkest (background)
  '#151515', // color2
  '#191919', // color3
  // ... etc
  '#fff', // color12 - lightest (text)
];
```

Tamagui maps these to tokens like `$background`, `$color`, `$borderColor`, etc.

## How Semantic Colors Work

Semantic colors give **meaning** to colors rather than just values:

```typescript
const lightSemanticColors = {
  // Primary brand color
  accent: Colors.blue.blue9, // Main accent
  accentLight: Colors.blue.blue3, // Hover backgrounds
  accentDark: Colors.blue.blue10, // Pressed states

  // Feedback colors
  success: Colors.green.green10,
  error: Colors.red.red10,
  warning: Colors.yellow.yellow10,

  // Utility
  overlay: 'rgba(0,0,0,0.5)', // Modal backdrops
  transparent: 'transparent',

  // Borders
  borderDefault: 'hsl(0, 0%, 90%)',
  borderFocus: Colors.blue.blue7,
};
```

Use these in components:

```tsx
<Button backgroundColor="$accent" />
<Card borderColor="$borderDefault" />
<YStack backgroundColor="$overlay" />  // Modal backdrop
```

## Creating a New Accent Theme

To add a new accent color (e.g., "indigo"):

### Step 1: Add semantic colors in `themes.ts`

```typescript
// Create indigo semantic colors for light mode
const lightIndigoSemanticColors = {
  ...lightSemanticColors,
  accent: Colors.indigo.indigo9,
  accentLight: Colors.indigo.indigo3,
  accentLighter: Colors.indigo.indigo1,
  accentDark: Colors.indigo.indigo10,
  accentDarker: Colors.indigo.indigo11,
  accentBorder: Colors.indigo.indigo6,
  accentBorderHover: Colors.indigo.indigo8,
  borderFocus: Colors.indigo.indigo7,
};

// Create indigo semantic colors for dark mode
const darkIndigoSemanticColors = {
  ...darkSemanticColors,
  accent: Colors.indigoDark.indigo9,
  accentLight: Colors.indigoDark.indigo3,
  // ... etc
};
```

### Step 2: Add to childrenThemes

```typescript
const generatedThemes = createThemes({
  base: {
    /* ... */
  },

  childrenThemes: {
    blue: {
      /* existing */
    },
    green: {
      /* existing */
    },

    // Add new indigo theme
    indigo: {
      palette: {
        dark: Object.values(Colors.indigoDark),
        light: Object.values(Colors.indigo),
      },
      extra: {
        light: lightIndigoSemanticColors,
        dark: darkIndigoSemanticColors,
      },
    },
  },
});
```

### Step 3: Update themeController.tsx

```typescript
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'indigo';

const resolveThemeName = (mode: ThemeMode, accent: AccentColor, systemTheme): TamaguiThemeName => {
  const baseTheme = mode === 'system' ? systemTheme : mode;

  // Return combined theme name like 'light_indigo' or 'dark_indigo'
  if (accent !== 'blue') {
    return `${baseTheme}_${accent}` as TamaguiThemeName;
  }
  return baseTheme;
};
```

### Step 4: Update AccountThemeSettings.tsx

```typescript
const ACCENT_COLORS: AccentColorOption[] = [
  { id: 'blue', name: 'Blue', color: '#228BE6' },
  // ... existing colors
  { id: 'indigo', name: 'Indigo', color: '#6366f1' },
];
```

## Creating a Completely New Theme

For a totally custom brand theme (not just accent swap):

### Step 1: Define your palette

```typescript
// Example: "Midnight" theme with deep blues
const midnightDarkPalette = [
  '#0a0a1a', // Deep navy background
  '#12122a',
  '#1a1a3a',
  '#22224a',
  '#2a2a5a',
  '#32326a',
  '#4a4a8a',
  '#6262aa',
  '#8a8aca',
  '#aaaaea',
  '#cacaff',
  '#ffffff',
];

const midnightLightPalette = [
  '#ffffff',
  '#f0f0ff',
  '#e0e0ff',
  // ... light version
];
```

### Step 2: Define semantic colors

```typescript
const midnightSemanticColors = {
  accent: '#6366f1', // Indigo accent
  accentLight: '#818cf8',
  accentDark: '#4f46e5',
  success: '#10b981',
  error: '#ef4444',
  // ... etc
};
```

### Step 3: Add to createThemes

```typescript
const generatedThemes = createThemes({
  base: {
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },
    extra: {
      /* ... */
    },
  },

  // Add as a sibling to base, not a child
  midnight: {
    palette: {
      dark: midnightDarkPalette,
      light: midnightLightPalette,
    },
    extra: {
      dark: { ...midnightSemanticColors },
      light: { ...midnightSemanticColors },
    },
  },
});
```

## Token Reference

### Spacing Tokens (`$space`)

```
$0 = 0px, $1 = 2px, $2 = 7px, $3 = 13px, $4 = 18px, $5 = 24px...
$0.5 = 1px, $1.5 = 4px, $2.5 = 10px
```

### Size Tokens (`$size`)

```
$1 = 20px, $2 = 28px, $3 = 36px, $4 = 44px...
$true = 44px (default)
```

### Radius Tokens (`$radius`)

```
$0 = 0px, $1 = 3px, $2 = 5px, $3 = 7px, $4 = 9px, $5 = 10px...
$true = 9px (default)
```

### Color Tokens

```
$background    - Main background
$color         - Main text color
$borderColor   - Default border
$accent        - Primary accent (buttons, links)
$accentLight   - Lighter accent (hover states)
$success       - Success states
$error         - Error states
$warning       - Warning states
$overlay       - Modal/drawer backdrop
```

## Using Themes in Components

```tsx
// Semantic tokens (recommended)
<Button backgroundColor="$accent" color="$textInverse" />
<Card borderColor="$borderDefault" />
<Text color="$error">Error message</Text>

// Palette colors (when you need specific shades)
<View backgroundColor="$color3" />  // 3rd color in palette

// Label colors (for tags, categories)
import { LABEL_COLOR_MAP } from '@repo/configs/themes';
<Badge backgroundColor={LABEL_COLOR_MAP.labelBlue} />

// Accessing theme in component
import { useTheme } from 'tamagui';

function MyComponent() {
  const theme = useTheme();
  const accentColor = theme.accent?.val;  // Get actual hex value
}
```

## Available Colors from @tamagui/colors

Tamagui provides these color scales (each with 12 shades):

**Light mode:** `blue`, `green`, `red`, `yellow`, `orange`, `purple`, `pink`, `gray`, `indigo`, `violet`, `cyan`, `teal`

**Dark mode:** `blueDark`, `greenDark`, `redDark`, etc.

Each scale has shades 1-12:

```typescript
Colors.blue.blue1; // Lightest
Colors.blue.blue9; // Primary (good for buttons)
Colors.blue.blue11; // Dark text
Colors.blue.blue12; // Darkest
```

## Testing Themes

1. Run the dev server: `pnpm dev:web`
2. Navigate to Dashboard → Account → Theme
3. Switch between Light/Dark/System modes
4. (Once accent themes are set up) Select different accent colors

## Troubleshooting

**Theme not updating?**

- Make sure `<Theme name={resolvedTheme}>` wraps your content
- Check that `ThemeProvider` is in `index.tsx` (not duplicated in App.tsx)

**Colors look wrong in dark mode?**

- Use `Colors.blueDark` instead of `Colors.blue` for dark variants
- Check that both light and dark semantic colors are defined

**Can't access theme values?**

- Use `useTheme()` from `tamagui` (not from themeController)
- Access values with `.val`: `theme.accent?.val`
