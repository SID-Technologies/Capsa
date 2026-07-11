// The display name shown in the top bar, page titles, and footer.
// Override per deploy with VITE_SITE_NAME (e.g. "Acme Docs").
export const SITE_NAME = (import.meta.env.VITE_SITE_NAME as string | undefined) || 'Capsa';

// Repo link for the top-bar + footer GitHub icons. Defaults to the Capsa repo
// so it always renders; point it at your own repo with VITE_GITHUB_URL.
export const GITHUB_URL =
  (import.meta.env.VITE_GITHUB_URL as string | undefined) || 'https://github.com/SID-Technologies/Capsa';

// Branch used for "Edit this page" links (VITE_GITHUB_BRANCH to override).
export const GITHUB_BRANCH = (import.meta.env.VITE_GITHUB_BRANCH as string | undefined) || 'main';

// GitHub's /edit/ URL opens the web editor (offering a fork for non-committers).
// Doc slugs map 1:1 to files under content/.
export const docEditUrl = (slug: string): string =>
  `${GITHUB_URL.replace(/\/$/, '')}/edit/${GITHUB_BRANCH}/content/${slug}.mdx`;
