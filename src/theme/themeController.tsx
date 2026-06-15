// themeContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type FC, ReactNode } from 'react';

// Base theme (light/dark)
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme style options (different visual styles)
export type ThemeStyle = 'steel' | 'aurora' | 'retro' | 'shadcn';

// Optional per-deploy theme pin (4.2): a public product docs site can pin its
// brand theme via VITE_DEFAULT_THEME_STYLE and hide the style switcher.
export const PINNED_THEME_STYLE = ((): ThemeStyle | undefined => {
  try {
    const v = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_DEFAULT_THEME_STYLE;
    return v as ThemeStyle | undefined;
  } catch {
    return undefined;
  }
})();

// Accent color options (for default theme only)
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal';

// The actual Tamagui theme name
export type TamaguiThemeName =
  | 'light'
  | 'dark'
  | 'light_blue'
  | 'dark_blue'
  | 'light_green'
  | 'dark_green'
  | 'light_aurora'
  | 'dark_aurora'
  | 'light_retro'
  | 'dark_retro'
  | 'light_shadcn'
  | 'dark_shadcn'
  | 'light_steel'
  | 'dark_steel';

interface ThemeContextType {
  // Current settings
  themeMode: ThemeMode;
  themeStyle: ThemeStyle;
  accentColor: AccentColor;

  // Resolved theme name for Tamagui
  resolvedTheme: TamaguiThemeName;

  // Whether we're in dark mode (resolved from system if needed)
  isDark: boolean;

  // Whether current theme uses retro styling (sharp corners, hard shadows)
  isRetro: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setThemeStyle: (style: ThemeStyle) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;

  // Transition state
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  themeStyle: 'steel',
  accentColor: 'blue',
  resolvedTheme: 'light',
  isDark: false,
  isRetro: false,
  setThemeMode: () => {},
  setThemeStyle: () => {},
  setAccentColor: () => {},
  toggleTheme: () => {},
  isTransitioning: false,
});

// Helper to detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Helper to resolve theme name for Tamagui
const resolveThemeName = (
  mode: ThemeMode,
  style: ThemeStyle,
  systemTheme: 'light' | 'dark',
): TamaguiThemeName => {
  const baseTheme = mode === 'system' ? systemTheme : mode;

  // If using a non-default theme style, return that variant
  if (style === 'aurora') {
    return `${baseTheme}_aurora` as TamaguiThemeName;
  }
  if (style === 'retro') {
    return `${baseTheme}_retro` as TamaguiThemeName;
  }
  if (style === 'shadcn') {
    return `${baseTheme}_shadcn` as TamaguiThemeName;
  }
  // Steel is the default style (Tamagui's bare base theme is not used).
  return `${baseTheme}_steel` as TamaguiThemeName;
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>(PINNED_THEME_STYLE ?? 'steel');
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Resolve the actual theme
  const isDark = themeMode === 'system' ? systemTheme === 'dark' : themeMode === 'dark';
  const isRetro = themeStyle === 'retro';
  const resolvedTheme = resolveThemeName(themeMode, themeStyle, systemTheme);

  // Sync theme to document root for Tamagui CSS variable switching
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('t_light', 't_dark');
    root.classList.add(isDark ? 't_dark' : 't_light');
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [resolvedTheme, isDark]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setThemeModeState(mode);
    }, 0);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  const setThemeStyle = useCallback((style: ThemeStyle) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setThemeStyleState(style);
    }, 0);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  const setAccentColor = useCallback((color: AccentColor) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAccentColorState(color);
    }, 0);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        themeStyle,
        accentColor,
        resolvedTheme,
        isDark,
        isRetro,
        setThemeMode,
        setThemeStyle,
        setAccentColor,
        toggleTheme,
        isTransitioning,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeController = () => useContext(ThemeContext);

// Legacy export for backwards compatibility
export const useTheme = useThemeController;

// =============================================================================
// THEME-AWARE RADIUS HOOK
// =============================================================================
// Use this hook to get radius values that automatically adapt to the theme.
// For retro theme, all radii are 0 (sharp corners for video game aesthetic).
// For all other themes, standard rounded corners are used.

export interface ThemeRadiusValues {
  /** No rounding (always 0) */
  none: number;
  /** Small radius - badges, chips (4px or 0 for retro) */
  sm: number;
  /** Medium radius - inputs, buttons (6px or 0 for retro) */
  md: number;
  /** Large radius - cards, dialogs (8px or 0 for retro) */
  lg: number;
  /** Extra large radius - panels (12px or 0 for retro) */
  xl: number;
  /** 2XL radius - hero sections (16px or 2 for retro) */
  '2xl': number;
  /** 3XL radius - large decorative (24px or 2 for retro) */
  '3xl': number;
  /** Full/pill radius - avatars, pills (9999px or 2 for retro) */
  full: number;
}

const defaultRadius: ThemeRadiusValues = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

const retroRadius: ThemeRadiusValues = {
  none: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  '2xl': 2,
  '3xl': 2,
  full: 2,
};

/**
 * Hook to get theme-aware border radius values.
 * Returns sharp corners (0) for retro theme, rounded corners for others.
 *
 * @example
 * const radius = useThemeRadius();
 * <View borderRadius={radius.md} /> // 6px normally, 0px for retro
 */
export const useThemeRadius = (): ThemeRadiusValues => {
  const { isRetro } = useThemeController();
  return isRetro ? retroRadius : defaultRadius;
};
