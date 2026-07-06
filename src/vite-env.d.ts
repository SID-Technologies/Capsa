/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Auth (opt-in — absent on public deploys)
  readonly VITE_WORKOS_CLIENT_ID: string;
  readonly VITE_PLATFORM_API_URL: string;
  readonly VITE_DEV_BYPASS_AUTH?: string;
  // Branding / SEO
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_DESCRIPTION?: string;
  readonly VITE_SITE_ORG?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_GITHUB_URL?: string;
  readonly VITE_STATUS_URL?: string;
  readonly VITE_SUPPORT_URL?: string;
  // Theming
  readonly VITE_DEFAULT_THEME_STYLE?: string;
  // Multi-product scope
  readonly VITE_PRODUCT?: string;
  // Analytics
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
