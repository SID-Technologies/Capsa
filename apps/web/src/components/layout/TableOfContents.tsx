import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { YStack, Paragraph, useTheme } from 'tamagui';
import type { TocEntry } from '../../lib/markdown';

interface TableOfContentsProps {
  headings: TocEntry[];
}

const TableOfContents: FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const theme = useTheme();

  // Tamagui exposes theme tokens at runtime (not as CSS vars), so resolve the
  // colors here rather than referencing var(--…) in inline styles.
  const muted = theme.color10?.get() as string | undefined;
  const strong = theme.color12?.get() as string | undefined;
  const accent = theme.accent?.get() as string | undefined;
  const border = theme.borderColor?.get() as string | undefined;

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const firstVisible = headings.find((h) => visible.has(h.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Rendered inside the fixed (non-scrolling) TOC column — no sticky needed.
  return (
    <YStack paddingVertical="$7" paddingLeft="$5" paddingRight="$3">
      {headings.length > 0 && (
        <>
          <Paragraph
            fontFamily="$body"
            fontSize={11}
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing={0.5}
            marginBottom="$3"
            color="$color10"
          >
            On this page
          </Paragraph>
          <YStack gap={2}>
            {headings.map((heading) => {
              const isActive = heading.id === activeId;
              return (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="sid-toc-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      window.history.pushState(null, '', `#${heading.id}`);
                    }
                  }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: isActive ? accent : muted,
                    fontWeight: isActive ? 600 : 400,
                    paddingLeft: 10 + (heading.level - 2) * 12,
                    paddingTop: 4,
                    paddingBottom: 4,
                    display: 'block',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    borderLeft: `2px solid ${isActive ? accent : border}`,
                    marginLeft: -1,
                    // CSS hover (.sid-toc-link:hover) brightens to this:
                    ['--toc-hover' as string]: strong,
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  {heading.text}
                </a>
              );
            })}
          </YStack>
        </>
      )}
    </YStack>
  );
};

export default TableOfContents;
