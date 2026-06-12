import { Children, cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LANG_LABELS } from './CodeBlock';

// Tabbed code samples with GLOBAL language state. Authoring:
//
//   <CodeTabs>
//
//   ```go
//   client.CreateLedger(ctx, ...)
//   ```
//
//   ```typescript
//   await client.createLedger(...)
//   ```
//
//   </CodeTabs>
//
// Each fenced block becomes a tab keyed by its language. Selecting one updates
// LanguageContext, so every CodeTabs across the site follows the same choice.

interface Tab {
  lang: string;
  element: ReactElement;
}

function readLang(child: ReactElement): string {
  const codeEl = Children.toArray((child.props as { children?: ReactNode }).children).find(isValidElement) as
    | ReactElement
    | undefined;
  const className = ((codeEl?.props ?? {}) as { className?: string }).className ?? '';
  return className.match(/language-([\w-]+)/)?.[1] ?? 'text';
}

export default function CodeTabs({ children }: { children?: ReactNode }) {
  const { language, setLanguage } = useLanguage();

  const tabs: Tab[] = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({ lang: readLang(child as ReactElement), element: child as ReactElement }));

  if (tabs.length === 0) return null;

  const active = tabs.find((t) => t.lang === language) ?? tabs[0];

  return (
    <div style={{ marginTop: 8, marginBottom: 8 }}>
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 2,
          borderBottom: '1px solid var(--borderColor, #333)',
          marginBottom: 6,
        }}
      >
        {tabs.map((t) => {
          const isActive = t.lang === active.lang;
          return (
            <button
              key={t.lang}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setLanguage(t.lang)}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '6px 12px',
                fontSize: 12,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent, #3b82f6)' : 'var(--colorPress, #999)',
                borderBottom: `2px solid ${isActive ? 'var(--accent, #3b82f6)' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {LANG_LABELS[t.lang] ?? t.lang.toUpperCase()}
            </button>
          );
        })}
      </div>
      {/* Hide the active block's own header — the tab bar replaces it. */}
      {cloneElement(active.element, { hideHeader: true } as Partial<unknown>)}
    </div>
  );
}
