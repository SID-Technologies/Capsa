import { StrictMode } from 'react';
import type { FC, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthKitProvider } from '@workos-inc/authkit-react';
import { TamaguiProvider, Theme } from 'tamagui';

import config from '@/theme/tamagui.config';
import { ThemeProvider, useThemeController } from '@/theme/themeController';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CommandPaletteProvider } from './components/layout/CommandPalette';
import { AUTH_ENABLED } from './lib/auth';

// Shared root for both entries. The entry supplies the router —
// entry-client: <AppRoot><BrowserRouter><InnerApp/></BrowserRouter></AppRoot>
// entry-server: <AppRoot><StaticRouter …><InnerApp/></StaticRouter></AppRoot>
// — so the provider tree is guaranteed identical between prerender and
// hydration.

const Themed: FC<{ children: ReactNode }> = ({ children }) => {
  const { themeStyle } = useThemeController();
  // Style-only theme name ("steel", never "dark_steel"): a scheme-bearing name
  // makes Tamagui wrap users whose scheme differs from the provider default in
  // an extra inverse <span> — a structural hydration mismatch that would force
  // a full client re-render for dark-mode visitors on prerendered pages.
  // Light/dark resolves via the t_* classes on <html> (pre-hydration script +
  // themeController); rendered markup stays scheme-agnostic (CSS variables).
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Theme name={themeStyle}>{children}</Theme>
    </TamaguiProvider>
  );
};

export const AppRoot: FC<{ children: ReactNode }> = ({ children }) => (
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <Themed>{children}</Themed>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);

// The app itself — must render INSIDE the router (auth uses router hooks).
export const InnerApp: FC = () => {
  const app = (
    <LanguageProvider>
      <CommandPaletteProvider>
        <App />
      </CommandPaletteProvider>
    </LanguageProvider>
  );

  // Auth providers mount only when configured — otherwise fully public.
  return AUTH_ENABLED ? (
    <AuthKitProvider clientId={import.meta.env.VITE_WORKOS_CLIENT_ID}>
      <AuthProvider>{app}</AuthProvider>
    </AuthKitProvider>
  ) : (
    app
  );
};
