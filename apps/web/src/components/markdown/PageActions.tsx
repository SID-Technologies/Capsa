import { useEffect, useRef, useState } from 'react';
import {
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconMarkdown,
  IconBrandOpenai,
  IconSparkles,
} from '@tabler/icons-react';

import { track } from '../../lib/analytics';

// Mintlify-style content-layer dropdown: copy the page as Markdown, view the
// raw .md, or open it in an LLM. Zero backend, zero token cost — the user's own
// assistant does the work. Per-page markdown is emitted to /md/<slug>.md by the
// search-index build plugin.

export default function PageActions({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mdUrl = `/md/${slug}.md`;
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/docs/${slug}` : '';
  const prompt = `Read ${pageUrl} and help me with my questions about it.`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const copyPage = async () => {
    try {
      const md = await fetch(mdUrl).then((r) => (r.ok ? r.text() : ''));
      await navigator.clipboard.writeText(md || pageUrl);
      setCopied(true);
      track('docs_copy_page', { slug });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
    setOpen(false);
  };

  return (
    <div className="sid-pageactions" ref={ref}>
      <button type="button" className="sid-pageactions-btn sid-pageactions-main" onClick={copyPage}>
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        {copied ? 'Copied' : 'Copy page'}
      </button>
      <button
        type="button"
        className="sid-pageactions-btn sid-pageactions-caret"
        aria-label="More actions"
        onClick={() => setOpen((o) => !o)}
      >
        <IconChevronDown size={14} />
      </button>

      {open && (
        <div className="sid-pageactions-menu" role="menu">
          <button type="button" className="sid-pageactions-item" onClick={copyPage}>
            <span>
              <IconCopy size={15} />
            </span>{' '}
            Copy page as Markdown
          </button>
          <a
            className="sid-pageactions-item"
            href={mdUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span>
              <IconMarkdown size={15} />
            </span>{' '}
            View as Markdown
          </a>
          <a
            className="sid-pageactions-item"
            href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              track('docs_open_in_llm', { slug, llm: 'chatgpt' });
              setOpen(false);
            }}
          >
            <span>
              <IconBrandOpenai size={15} />
            </span>{' '}
            Open in ChatGPT
          </a>
          <a
            className="sid-pageactions-item"
            href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              track('docs_open_in_llm', { slug, llm: 'claude' });
              setOpen(false);
            }}
          >
            <span>
              <IconSparkles size={15} />
            </span>{' '}
            Open in Claude
          </a>
        </div>
      )}
    </div>
  );
}
