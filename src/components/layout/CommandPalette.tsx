import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { FC, ReactNode, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconCornerDownLeft } from '@tabler/icons-react';

import { useDocSearch } from '../../hooks/useDocs';

// ⌘K command palette. A global keyboard-driven search modal over the build-time
// index — the single change that makes the docs feel best-in-class. Plain CSS
// modal (no Tamagui animation driver needed).

interface CommandPaletteContextValue {
  open: () => void;
}
const Ctx = createContext<CommandPaletteContextValue>({ open: () => {} });
export const useCommandPalette = () => useContext(Ctx);

const Palette: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const { results, isSearching } = useDocSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => setActive(0), [results]);

  // Keep the highlighted row in view as you arrow through.
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (r: (typeof results)[number]) => {
    navigate(`/docs/${r.slug}${r.headingId ? `#${r.headingId}` : ''}`);
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="sid-cmdk-overlay" onClick={onClose}>
      <div className="sid-cmdk-panel" onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="sid-cmdk-input-row">
          <IconSearch size={17} />
          <input
            ref={inputRef}
            className="sid-cmdk-input"
            placeholder="Search documentation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="sid-cmdk-kbd">esc</kbd>
        </div>

        <div className="sid-cmdk-results" ref={listRef}>
          {query.trim() === '' && <div className="sid-cmdk-empty">Type to search across all docs.</div>}
          {query.trim() !== '' && !isSearching && results.length === 0 && (
            <div className="sid-cmdk-empty">No results for “{query}”.</div>
          )}
          {results.map((r, i) => (
            <div
              key={`${r.slug}-${r.headingId ?? i}`}
              data-idx={i}
              className={`sid-cmdk-item${i === active ? ' active' : ''}`}
              onMouseMove={() => setActive(i)}
              onClick={() => go(r)}
            >
              <div className="sid-cmdk-item-main">
                <span className="sid-cmdk-item-title">{r.title}</span>
                {r.headingText && <span className="sid-cmdk-item-heading">› {r.headingText}</span>}
              </div>
              <span className="sid-cmdk-item-cat">{r.category}</span>
              {i === active && <IconCornerDownLeft size={14} className="sid-cmdk-enter" />}
            </div>
          ))}
        </div>

        <div className="sid-cmdk-footer">
          <span>
            <kbd className="sid-cmdk-kbd">↑</kbd>
            <kbd className="sid-cmdk-kbd">↓</kbd> navigate
          </span>
          <span>
            <kbd className="sid-cmdk-kbd">↵</kbd> open
          </span>
        </div>
      </div>
    </div>
  );
};

export const CommandPaletteProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <Palette open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
};
