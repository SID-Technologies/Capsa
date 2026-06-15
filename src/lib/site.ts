// The display name shown in the top bar, page titles, and footer.
// Override per deploy with VITE_SITE_NAME (e.g. "Acme Docs").
export const SITE_NAME = (import.meta.env.VITE_SITE_NAME as string | undefined) || 'Capsa';

// Repo link for the top-bar + footer GitHub icons. Defaults to the Capsa repo
// so it always renders; point it at your own repo with VITE_GITHUB_URL.
export const GITHUB_URL =
  (import.meta.env.VITE_GITHUB_URL as string | undefined) || 'https://github.com/SID-Technologies/Capsa';
