// Theme controller — React context for the mode (light/dark/system) and the
// style (steel/aurora/retro/shadcn). State persists to localStorage and is
// pre-applied before hydration by the inline script in index.html, so there is
// no flash of the wrong theme on load. Keep the storage keys and class logic
// here in sync with that script.
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type FC,
  ReactNode,
} from 'react';

// Base theme (light/dark)
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme style options (different visual styles)
export type ThemeStyle = 'steel' | 'aurora' | 'retro' | 'shadcn';

const THEME_STYLES: readonly ThemeStyle[] = ['steel', 'aurora', 'retro', 'shadcn'];
const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

// localStorage keys — shared with the pre-hydration script in index.html.
export const THEME_MODE_STORAGE_KEY = 'capsa-theme-mode';
export const THEME_STYLE_STORAGE_KEY = 'capsa-theme-style';

const isThemeStyle = (v: unknown): v is ThemeStyle => THEME_STYLES.includes(v as ThemeStyle);
const isThemeMode = (v: unknown): v is ThemeMode => THEME_MODES.includes(v as ThemeMode);

// Optional per-deploy theme pin: a public product docs site can pin its brand
// theme via VITE_DEFAULT_THEME_STYLE and hide the style switcher. An invalid
// value is ignored (with a warning) rather than producing a broken theme name.
export const PINNED_THEME_STYLE: ThemeStyle | undefined = (() => {
  const v = import.meta.env.VITE_DEFAULT_THEME_STYLE;
  if (v === undefined || v === '') return undefined;
  if (isThemeStyle(v)) return v;
  console.warn(
    `[capsa] Ignoring invalid VITE_DEFAULT_THEME_STYLE "${v}" — expected one of: ${THEME_STYLES.join(', ')}`,
  );
  return undefined;
})();

// The actual Tamagui theme name ("<mode>_<style>"). Tamagui's bare base
// light/dark themes are never used directly — steel is the default style.
export type TamaguiThemeName = `${'light' | 'dark'}_${ThemeStyle}`;

interface ThemeContextType {
  // Current settings
  themeMode: ThemeMode;
  themeStyle: ThemeStyle;

  // Resolved theme name for Tamagui
  resolvedTheme: TamaguiThemeName;

  // Whether we're in dark mode (resolved from system if needed)
  isDark: boolean;

  // Whether current theme uses retro styling (sharp corners, hard shadows)
  isRetro: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setThemeStyle: (style: ThemeStyle) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  themeStyle: 'steel',
  resolvedTheme: 'light_steel',
  isDark: false,
  isRetro: false,
  setThemeMode: () => {},
  setThemeStyle: () => {},
  toggleTheme: () => {},
});

// Helper to detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const readStored = <T,>(key: string, guard: (v: unknown) => v is T): T | undefined => {
  try {
    const v = window.localStorage.getItem(key);
    return v !== null && guard(v) ? v : undefined;
  } catch {
    return undefined; // storage blocked (private mode, embedded) — fall back
  }
};

const writeStored = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // non-fatal — theme simply won't persist
  }
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Two-pass state for prerender/hydration safety: the server render and the
  // first client render both use deterministic defaults (light, pinned-or-
  // steel); the persisted values apply in a mount effect. Visuals are already
  // correct before hydration because the index.html inline script sets the
  // theme classes on <html> — only state consumers (mode icon, isRetro
  // conditionals) flip one frame after mount.
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>(PINNED_THEME_STYLE ?? 'steel');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Mount: adopt persisted + system values, then track system changes.
  useEffect(() => {
    const stored = readStored(THEME_MODE_STORAGE_KEY, isThemeMode);
    if (stored) setThemeModeState(stored);
    if (!PINNED_THEME_STYLE) {
      const storedStyle = readStored(THEME_STYLE_STORAGE_KEY, isThemeStyle);
      if (storedStyle) setThemeStyleState(storedStyle);
    }
    setSystemTheme(getSystemTheme());

    if (!window.matchMedia) return;
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
  const resolvedTheme: TamaguiThemeName = `${isDark ? 'dark' : 'light'}_${themeStyle}`;

  // Sync theme classes to <html> so CSS variables resolve everywhere — including
  // content portaled to <body> (Scalar modals, dropdowns), which sits outside
  // the <Theme> wrapper. Both the base class (t_dark) and the full theme class
  // (t_dark_steel) are applied; the full class must come last so its variables
  // win. Mirrors the pre-hydration script in index.html.
  //
  // The FIRST run is skipped entirely: it fires while state still holds the
  // two-pass defaults, but the pre-hydration script has already applied the
  // user's real theme to <html> — writing defaults here would flash the wrong
  // theme for a frame. Once the mount effect adopts the persisted values, any
  // actual change re-runs this effect and writes normally.
  const firstThemeSync = useRef(true);
  useEffect(() => {
    if (firstThemeSync.current) {
      firstThemeSync.current = false;
      return;
    }
    const root = document.documentElement;
    const stale = Array.from(root.classList).filter((c) => c.startsWith('t_'));
    root.classList.remove(...stale);
    root.classList.add(isDark ? 't_dark' : 't_light', `t_${resolvedTheme}`);
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [resolvedTheme, isDark]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    writeStored(THEME_MODE_STORAGE_KEY, mode);
  }, []);

  const setThemeStyle = useCallback((style: ThemeStyle) => {
    setThemeStyleState(style);
    writeStored(THEME_STYLE_STORAGE_KEY, style);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        themeStyle,
        resolvedTheme,
        isDark,
        isRetro,
        setThemeMode,
        setThemeStyle,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeController = () => useContext(ThemeContext);

// Legacy export for backwards compatibility
export const useTheme = useThemeController;
