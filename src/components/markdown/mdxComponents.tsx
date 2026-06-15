import type { ReactNode } from 'react';
import { Paragraph, H1, H2, H3, H4, H5, H6, YStack, Separator, useTheme } from 'tamagui';
import { Link } from '@phosphor-icons/react';

import CodeBlock from './CodeBlock';
import CodeTabs from './CodeTabs';
import Callout from './Callout';
import ApiMethod from './ApiMethod';
import SeeAlso from './SeeAlso';

// Shared component map for MDX content, rendered via <MDXProvider>.
// Ported from the old markdown renderer (now deleted) so existing docs
// look identical. CodeBlock (1.1) and Callout (1.2) plug in here.

type Props = { children?: ReactNode; [key: string]: unknown };

// Inline `code` — theme-resolved colors (Tamagui applies tokens at runtime,
// so var(--…) wouldn't resolve here).
function InlineCode({ children }: { children?: ReactNode }) {
  const theme = useTheme();
  const bg = (theme.color3?.get?.() as string | undefined) ?? 'rgba(127,127,127,0.12)';
  const fg = (theme.color12?.get?.() as string | undefined) ?? 'inherit';
  const border = (theme.borderColor?.get?.() as string | undefined) ?? 'transparent';
  return (
    <code
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 12,
        backgroundColor: bg,
        color: fg,
        border: `1px solid ${border}`,
        padding: '1px 5px',
        borderRadius: 4,
      }}
    >
      {children}
    </code>
  );
}

// Hover anchor next to a heading: copies the section deep-link and scrolls.
// SVG-only (no text) so DocPage's textContent-based TOC stays clean.
function HeadingAnchor({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <a
      href={`#${id}`}
      className="sid-heading-anchor"
      aria-label="Copy link to this section"
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `#${id}`);
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard?.writeText(url).catch(() => {});
      }}
    >
      <Link size={15} />
    </a>
  );
}

export const mdxComponents = {
  // Wrap all doc content in the max-width column the old renderer provided.
  wrapper: ({ children }: Props) => (
    <YStack gap="$3" maxWidth={800}>
      {children}
    </YStack>
  ),

  // Headings — id comes from rehype-slug (compile time); the DOM-based TOC reads it.
  // h2/h3 get a hover copy-link anchor (the levels shown in the TOC).
  h1: ({ children, id }: Props) => (
    <H1 id={id as string} fontWeight="700" marginBottom="$2" marginTop="$6">
      {children}
    </H1>
  ),
  h2: ({ children, id }: Props) => (
    <H2
      id={id as string}
      className="sid-heading"
      position="relative"
      fontWeight="600"
      marginBottom="$2"
      marginTop="$5"
    >
      {children}
      <HeadingAnchor id={id as string} />
    </H2>
  ),
  h3: ({ children, id }: Props) => (
    <H3
      id={id as string}
      className="sid-heading"
      position="relative"
      fontWeight="600"
      marginBottom="$2"
      marginTop="$4"
    >
      {children}
      <HeadingAnchor id={id as string} />
    </H3>
  ),
  h4: ({ children, id }: Props) => (
    <H4 id={id as string} fontWeight="600" marginBottom="$1" marginTop="$3">
      {children}
    </H4>
  ),
  h5: ({ children, id }: Props) => (
    <H5 id={id as string} fontWeight="600" marginBottom="$1" marginTop="$3">
      {children}
    </H5>
  ),
  h6: ({ children, id }: Props) => (
    <H6 id={id as string} fontWeight="600" marginBottom="$1" marginTop="$3">
      {children}
    </H6>
  ),

  p: ({ children }: Props) => (
    <Paragraph size="$5" lineHeight="$6" marginBottom="$2">
      {children}
    </Paragraph>
  ),

  hr: () => <Separator marginVertical="$4" />,

  blockquote: ({ children }: Props) => (
    <YStack
      borderLeftWidth={3}
      borderLeftColor="$borderColor"
      paddingLeft="$4"
      marginVertical="$2"
      opacity={0.85}
    >
      {children}
    </YStack>
  ),

  // Lists — real HTML elements so nesting works.
  ul: ({ children }: Props) => (
    <ul
      style={{
        paddingLeft: 24,
        marginBottom: 8,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }: Props) => (
    <ol
      style={{
        paddingLeft: 24,
        marginBottom: 8,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }: Props) => <li style={{ marginBottom: 4 }}>{children}</li>,

  // Code: block (<pre>) gets the CodeBlock chrome; inline code stays inline.
  pre: (props: Props) => <CodeBlock {...props} />,
  code: ({ children, className }: Props) => {
    if (!className) return <InlineCode>{children}</InlineCode>;
    return (
      <code
        className={className as string}
        style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', whiteSpace: 'pre' }}
      >
        {children}
      </code>
    );
  },

  // Tables — wrapped in a horizontal scroller so wide tables don't squish on
  // mobile; a right-edge fade (CSS .sid-table-wrap::after) hints at overflow.
  table: ({ children }: Props) => (
    <YStack
      marginVertical="$3"
      borderRadius="$md"
      overflow="hidden"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <div className="sid-table-wrap" style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {children}
        </table>
      </div>
    </YStack>
  ),
  thead: ({ children }: Props) => <thead>{children}</thead>,
  tbody: ({ children }: Props) => <tbody>{children}</tbody>,
  tr: ({ children }: Props) => <tr>{children}</tr>,
  th: ({ children }: Props) => (
    <th
      style={{
        padding: '8px 12px',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: 14,
        borderBottom: '1px solid var(--borderColor, #333)',
        backgroundColor: 'var(--backgroundHover, rgba(255,255,255,0.05))',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }: Props) => (
    <td style={{ padding: '8px 12px', fontSize: 14, borderBottom: '1px solid var(--borderColor, #222)' }}>
      {children}
    </td>
  ),

  a: ({ children, href }: Props) => (
    <a
      href={href as string}
      style={{ color: 'var(--blue10, #3b82f6)', textDecoration: 'underline', cursor: 'pointer' }}
      target={(href as string)?.startsWith('http') ? '_blank' : undefined}
      rel={(href as string)?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),

  img: ({ src, alt }: Props) => (
    <img
      src={src as string}
      alt={(alt as string) || ''}
      style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, marginTop: 8, marginBottom: 8 }}
    />
  ),

  del: ({ children }: Props) => (
    <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{children}</span>
  ),

  input: ({ checked }: Props) => (
    <input
      type="checkbox"
      checked={checked as boolean}
      readOnly
      style={{ marginRight: 8, verticalAlign: 'middle' }}
    />
  ),

  strong: ({ children }: Props) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  em: ({ children }: Props) => <em>{children}</em>,

  // Admonitions — emitted by remark-directive-callouts as <callout kind="...">.
  callout: Callout,

  // Authoring components usable directly in .mdx (capitalized → resolved here).
  CodeTabs,
  ApiMethod,
  SeeAlso,
};

export default mdxComponents;
