import { useEffect } from 'react';
import { useTheme } from 'tamagui';
import { useThemeController } from '@/theme/themeController';

// Tamagui applies theme tokens inline at runtime instead of emitting CSS custom
// properties, so hand-written CSS (docs.css) and inline style={{}} blocks that
// reference var(--token) would otherwise fall back to their defaults. This
// bridges the gap: it writes the tokens those styles use onto :root, refreshed
// whenever the active theme (style or light/dark) changes.
const TOKENS = [
  'accent',
  'background',
  'backgroundHover',
  'blue10',
  'borderColor',
  'color2',
  'color3',
  'color4',
  'color10',
  'color11',
  'color12',
  'colorPress',
  'green10',
] as const;

export default function ThemeCssVars() {
  const theme = useTheme();
  const { resolvedTheme } = useThemeController();

  useEffect(() => {
    const root = document.documentElement;
    for (const name of TOKENS) {
      const token = theme[name as keyof typeof theme] as { get?: () => string } | undefined;
      const value = token?.get?.();
      if (value) root.style.setProperty(`--${name}`, value);
    }
    // resolvedTheme is the dependency; `theme` is read fresh on each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  return null;
}
