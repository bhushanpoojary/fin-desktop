/**
 * CommandPaletteDemo — mounts the reusable CommandPalette with a demo registry (apps +
 * commands) and a Ctrl/⌘+K toggle. Route: ?test=palette.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { SearchRegistry, createListProvider } from '../search';
import { CommandPalette } from './CommandPalette';

export const CommandPaletteDemo: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [last, setLast] = useState<string | null>(null);

  const registry = useMemo(() => {
    const act = (name: string) => () => setLast(name);
    const r = new SearchRegistry();
    r.register(
      createListProvider('apps', [
        { id: 'chart', title: 'Price Chart', subtitle: 'Live market chart', category: 'App', keywords: ['graph', 'market'], run: act('Price Chart') },
        { id: 'news', title: 'Market News', subtitle: 'Headlines & alerts', category: 'App', keywords: ['headlines'], run: act('Market News') },
        { id: 'blotter', title: 'Trade Blotter', subtitle: 'Fills & positions', category: 'App', keywords: ['trades', 'fills'], run: act('Trade Blotter') },
        { id: 'orders', title: 'Order Ticket', subtitle: 'Place an order', category: 'App', keywords: ['buy', 'sell'], run: act('Order Ticket') },
        { id: 'watch', title: 'Watchlist', subtitle: 'Tracked instruments', category: 'App', run: act('Watchlist') },
      ]),
    );
    r.register(
      createListProvider('commands', [
        { id: 'platform', title: 'Open Platform Playground', category: 'Command', keywords: ['layout', 'dock'], run: act('Platform Playground') },
        { id: 'inspector', title: 'Open FDC3 Inspector', category: 'Command', keywords: ['interop', 'debug'], run: act('FDC3 Inspector') },
        { id: 'fdc3', title: 'Open FDC3 Demo', category: 'Command', keywords: ['channels', 'intents'], run: act('FDC3 Demo') },
        { id: 'theme', title: 'Toggle Theme', category: 'Command', run: act('Toggle Theme') },
      ]),
    );
    return r;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="cpd">
      <div>
        <div className="cpd-hint">
          Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to toggle the command palette.
          {last && (
            <>
              {' '}
              Last launched: <strong>{last}</strong>
            </>
          )}
        </div>
        {!open && (
          <button className="cpd-open" onClick={() => setOpen(true)}>
            Open palette (Ctrl+K)
          </button>
        )}
      </div>
      <CommandPalette registry={registry} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default CommandPaletteDemo;
