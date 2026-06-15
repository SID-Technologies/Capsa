import { Children, isValidElement, useState } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { useTheme } from 'tamagui';
import { Copy, Check } from '@phosphor-icons/react';

// Wraps a fenced code block with chrome: a language label, an optional filename
// (from a fence meta string like ```go title="main.go"), and a copy button that
// fades in on hover. Replaces the bare <pre> from the old renderer.
//
// Colors are resolved from the active theme (Tamagui applies tokens at runtime,
// not as CSS vars) so the panel/header/button track the theme + light/dark. The
// syntax-highlight CSS is now background-transparent, so this wrapper supplies
// the code surface.

export const LANG_LABELS: Record<string, string> = {
  go: 'Go',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  tsx: 'TSX',
  jsx: 'JSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  rust: 'Rust',
  java: 'Java',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  toml: 'TOML',
  md: 'Markdown',
  mdx: 'MDX',
  html: 'HTML',
  css: 'CSS',
  diff: 'Diff',
  dockerfile: 'Dockerfile',
  graphql: 'GraphQL',
  proto: 'Protobuf',
};

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement(node)) return nodeText((node.props as { children?: ReactNode }).children);
  return '';
}

export default function CodeBlock({
  children,
  hideHeader,
  ...rest
}: {
  children?: ReactNode;
  // When inside <CodeTabs> the tab bar replaces the per-block header.
  hideHeader?: boolean;
  // `data-title` lands here on the <pre>: remarkCodeTitle sets it via hProperties,
  // which mdast-util-to-hast applies to the returned <pre> element (not the child).
  'data-title'?: string;
  [key: string]: unknown;
}) {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const get = (token: string, fallback: string) =>
    (theme[token as keyof typeof theme]?.get?.() as string | undefined) ?? fallback;
  const surface = get('color2', 'rgba(127,127,127,0.06)');
  const headerBg = get('color3', 'rgba(127,127,127,0.1)');
  const border = get('borderColor', 'rgba(127,127,127,0.25)');
  const muted = get('color10', '#888');
  const btnBg = get('background', '#fff');
  const okColor = get('green10', '#16a34a');

  const codeEl = Children.toArray(children).find(isValidElement) as ReactElement | undefined;
  const className = ((codeEl?.props ?? {}) as { className?: string }).className ?? '';
  const title = rest['data-title'] as string | undefined;
  const langKey = className.match(/language-([\w-]+)/)?.[1];
  const langLabel = langKey ? (LANG_LABELS[langKey] ?? langKey.toUpperCase()) : undefined;
  const hasHeader = !hideHeader && Boolean(langLabel || title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(nodeText(children));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className="sid-codeblock"
      style={{
        position: 'relative',
        marginTop: 8,
        marginBottom: 8,
        border: `1px solid ${border}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            paddingRight: 40,
            fontSize: 11,
            fontFamily: "'Space Grotesk', sans-serif",
            color: muted,
            backgroundColor: headerBg,
            borderBottom: `1px solid ${border}`,
          }}
        >
          {title && <span style={{ fontWeight: 600 }}>{title}</span>}
          {langLabel && (
            <span style={{ marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {langLabel}
            </span>
          )}
        </div>
      )}

      <pre
        style={{
          backgroundColor: surface,
          margin: 0,
          padding: 16,
          overflowX: 'auto',
          whiteSpace: 'pre',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {children}
      </pre>

      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="sid-copy-btn"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          border: `1px solid ${border}`,
          borderRadius: 6,
          background: btnBg,
          color: copied ? okColor : muted,
          cursor: 'pointer',
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
