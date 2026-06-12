import '@fontsource/inter';
import '@fontsource/space-grotesk';
import './highlight.css';
import './docs.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthKitProvider } from '@workos-inc/authkit-react';
import { ThemeProvider, useThemeController } from '@repo/configs/themeController';
import config from '@repo/configs/tamagui.config';
import { TamaguiProvider, Theme } from 'tamagui';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CommandPaletteProvider } from './components/layout/CommandPalette';
import { initAnalytics } from './lib/analytics';
import { AUTH_ENABLED } from './lib/auth';

initAnalytics();

function ThemedApp() {
  const { resolvedTheme } = useThemeController();

  const app = (
    <LanguageProvider>
      <CommandPaletteProvider>
        <App />
      </CommandPaletteProvider>
    </LanguageProvider>
  );

  return (
    <TamaguiProvider config={config}>
      <Theme name={resolvedTheme}>
        <BrowserRouter>
          {/* Auth providers mount only when configured — otherwise fully public. */}
          {AUTH_ENABLED ? (
            <AuthKitProvider clientId={import.meta.env.VITE_WORKOS_CLIENT_ID}>
              <AuthProvider>{app}</AuthProvider>
            </AuthKitProvider>
          ) : (
            app
          )}
        </BrowserRouter>
      </Theme>
    </TamaguiProvider>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
);
