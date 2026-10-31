/**
 * DemoLauncher — a small floating button (bottom-right) mounted on every page so the demos are
 * reachable from anywhere, including the Electron workspace and the notification shell. Expands to
 * a grouped, searchable list and highlights the current demo.
 */

import React, { useMemo, useState } from 'react';
import { DEMOS, DEMO_CATEGORIES, findDemo, gotoDemo } from './demoRegistry';
import './DemoLauncher.css';

export const DemoLauncher: React.FC<{ current?: string | null }> = ({ current }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const activeDemo = findDemo(current);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEMOS;
    return DEMOS.filter((d) => `${d.title} ${d.description} ${d.id}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="demo-launcher-root">
      {open && (
        <div className="demo-launcher-panel" role="dialog" aria-label="Demo launcher">
          <div className="demo-launcher-head">
            <span className="demo-launcher-title">✦ FinDesktop Demos</span>
            <button className="demo-launcher-x" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>
          <input className="demo-launcher-search" placeholder="Search demos…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          <div className="demo-launcher-nav">
            <button className={`demo-launcher-item home ${!activeDemo ? 'active' : ''}`} onClick={() => gotoDemo('home')}>
              <span className="demo-launcher-icon">⌂</span>
              <span className="demo-launcher-item-text">
                <span className="demo-launcher-item-title">Workspace (Home)</span>
                <span className="demo-launcher-item-desc">The default app shell</span>
              </span>
            </button>
            <button className={`demo-launcher-item ${current === 'demos' ? 'active' : ''}`} onClick={() => gotoDemo('demos')}>
              <span className="demo-launcher-icon">🗂️</span>
              <span className="demo-launcher-item-text">
                <span className="demo-launcher-item-title">All Demos (Gallery)</span>
                <span className="demo-launcher-item-desc">Full-page index</span>
              </span>
            </button>
          </div>
          <div className="demo-launcher-body">
            {DEMO_CATEGORIES.map((category) => {
              const items = filtered.filter((d) => d.category === category);
              if (items.length === 0) return null;
              return (
                <div key={category} className="demo-launcher-cat">
                  <h4>{category}</h4>
                  {items.map((demo) => (
                    <button key={demo.id} className={`demo-launcher-item ${current === demo.id ? 'active' : ''}`} onClick={() => gotoDemo(demo.id)}>
                      <span className="demo-launcher-icon">{demo.icon}</span>
                      <span className="demo-launcher-item-text">
                        <span className="demo-launcher-item-title">{demo.title}</span>
                        <span className="demo-launcher-item-desc">{demo.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <button className={`demo-launcher-fab ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)} title="Browse demos">
        {open ? '×' : '✦'}
        {!open && activeDemo && <span className="demo-launcher-fab-label">{activeDemo.title}</span>}
      </button>
    </div>
  );
};

export default DemoLauncher;
