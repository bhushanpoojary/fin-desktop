/**
 * CommandPalette — a reusable spotlight/command-palette over a SearchRegistry.
 *
 * Keyboard-first: type to fuzzy-search, ↑/↓ to navigate, ⏎ to run, esc to close. Highlights
 * matched characters. Controlled via the `open` prop.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { SearchRegistry, SearchResult, UsageTracker } from '../search';
import './CommandPalette.css';

export interface CommandPaletteProps {
  registry: SearchRegistry;
  open: boolean;
  onClose: () => void;
  placeholder?: string;
  /** Optional usage tracker: boosts recents/favorites and records picks. */
  usage?: UsageTracker;
}

const Highlight: React.FC<{ text: string; positions?: number[] }> = ({ text, positions }) => {
  if (!positions || positions.length === 0) return <>{text}</>;
  const set = new Set(positions);
  return (
    <>
      {[...text].map((ch, i) =>
        set.has(i) ? <mark key={i}>{ch}</mark> : <span key={i}>{ch}</span>,
      )}
    </>
  );
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  registry,
  open,
  onClose,
  placeholder,
  usage,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void registry.search(query, { limit: 50 }).then((r) => {
      if (!cancelled) {
        setResults(usage ? usage.rank(r) : r);
        setActive(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query, open, registry, usage]);

  if (!open) return null;

  const run = (result?: SearchResult) => {
    if (!result) return;
    usage?.record(result.id);
    void result.run?.();
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div className="cp" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cp-input"
          value={query}
          placeholder={placeholder ?? 'Search apps and commands…'}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <div className="cp-results">
          {results.map((r, i) => (
            <button
              key={`${r.providerId}:${r.id}`}
              className={`cp-item ${i === active ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(r)}
            >
              <span className="cp-title">
                <Highlight text={r.title} positions={r.matchPositions} />
              </span>
              {r.subtitle && <span className="cp-sub">{r.subtitle}</span>}
              {r.category && <span className="cp-cat">{r.category}</span>}
            </button>
          ))}
          {results.length === 0 && <div className="cp-empty">No results</div>}
        </div>
        <div className="cp-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>⏎</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
