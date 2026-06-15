# Navigation

`src/navigation.ts` is the single source of truth for the sidebar and the top
**section tabs**. It's declarative — edit the object, not the components.

## Shape

```ts title="src/navigation.ts"
export const navigation: NavConfig = {
  tabs: [
    {
      tab: 'Documentation',
      icon: 'book',
      groups: [
        {
          group: 'Getting Started',
          icon: 'play',
          pages: ['getting-started/introduction', 'getting-started/quickstart'],
        },
        { group: 'Guides', icon: 'book', pages: { auto: 'guides' } },
      ],
    },
    { tab: 'API Reference', icon: 'code', href: '/docs/api' },
  ],
};
```

## Concepts

- **Tabs** appear in the top bar. A tab either owns `groups` (its own sidebar) or
  is a single `href` (like the API reference).
- **Groups** are collapsible sidebar sections with an `icon` and optional `tag`
  (e.g. `tag: 'NEW'`).
- **Pages** are doc slugs (the path under `content/`, no extension). List them
  explicitly for full control of order, or use **`{ auto: 'folder' }`** to pull
  every page in a content folder.
- **Nesting** — a page entry can itself be a group, for sub-sections.

:::tip
Groups that resolve to zero pages (for example, filtered out by product scoping)
are hidden automatically — no empty headers.
:::

## Icons

`icon` takes a short name mapped to a Tabler icon in `src/lib/navIcons.tsx` —
e.g. `play`, `book`, `code`, `server`, `rocket`, `settings`. Add your own by
extending that map.

## Tags

```ts
{ group: 'Beta APIs', icon: 'code', tag: 'NEW', pages: { auto: 'beta' } }
```

A `tag` renders a small accent badge next to the group label.
