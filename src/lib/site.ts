// The display name shown in the top bar, page titles, and footer.
// Override per deploy with VITE_SITE_NAME (e.g. "Acme Docs").
export const SITE_NAME = (import.meta.env.VITE_SITE_NAME as string | undefined) || 'Capsa';
