// Declarative navigation — the Mintlify model. Edit this to control the sidebar
// and the top section tabs. Pages are doc slugs (path under content/, no ext).
//
//   - A group can list `pages` explicitly (full control of order + nesting), or
//     use `{ auto: "<category>" }` to pull every doc in a content folder.
//   - Groups can nest (a page entry can itself be a group).
//   - `tag` shows a small badge (e.g. "NEW"); `icon` uses a name from navIcons.
//   - A tab can either own `groups` (its own sidebar) or be a single `href`.

export interface AutoPages {
  auto: string; // content category/folder, e.g. "platform-core"
}

export interface NavGroup {
  group: string;
  icon?: string;
  tag?: string;
  expanded?: boolean; // default true
  pages: Array<string | NavGroup> | AutoPages;
}

export interface NavTab {
  tab: string;
  icon?: string;
  href?: string; // route link instead of a sidebar (e.g. the API reference)
  groups?: NavGroup[];
}

export interface NavConfig {
  tabs: NavTab[];
}

export const navigation: NavConfig = {
  tabs: [
    {
      tab: 'Documentation',
      icon: 'book',
      groups: [
        { group: 'Getting Started', icon: 'play', pages: { auto: 'getting-started' } },
        { group: 'Guides', icon: 'book', pages: { auto: 'guides' } },
        { group: 'Configuration', icon: 'settings', pages: { auto: 'configuration' } },
        { group: 'Deploy', icon: 'rocket', pages: { auto: 'deploy' } },
      ],
    },
    {
      tab: 'API Reference',
      icon: 'code',
      href: '/docs/api',
    },
  ],
};
