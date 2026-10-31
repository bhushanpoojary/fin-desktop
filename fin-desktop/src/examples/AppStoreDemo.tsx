/**
 * AppStoreDemo — browsable app catalog: featured row, category filter, fuzzy search, and
 * install / pin / launch actions backed by AppCatalog. Includes an enterprise (private) toggle.
 * Route: ?test=store.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { AppCatalog } from '../store';
import type { CatalogApp } from '../store';
import './AppStoreDemo.css';

const CATALOG: CatalogApp[] = [
  { appId: 'chart', name: 'Price Chart', description: 'Live, streaming market charts with indicators.', publisher: 'FinDesktop', version: '2.1.0', categories: ['Markets'], tags: ['chart', 'graph', 'technical'], icons: [{ src: '📈' }], featured: true },
  { appId: 'news', name: 'Market News', description: 'Real-time headlines, filings, and alerts.', publisher: 'NewsCo', version: '1.4.2', categories: ['Research'], tags: ['headlines', 'alerts'], icons: [{ src: '📰' }], featured: true },
  { appId: 'blotter', name: 'Trade Blotter', description: 'Live fills, positions, and P&L.', publisher: 'FinDesktop', version: '3.0.1', categories: ['Trading'], tags: ['trades', 'fills', 'pnl'], icons: [{ src: '🧾' }] },
  { appId: 'orders', name: 'Order Ticket', description: 'Stage and route orders to venues.', publisher: 'FinDesktop', version: '3.0.1', categories: ['Trading'], tags: ['orders', 'buy', 'sell'], icons: [{ src: '🎫' }] },
  { appId: 'watch', name: 'Watchlist', description: 'Track instruments across asset classes.', publisher: 'FinDesktop', version: '1.0.0', categories: ['Markets'], tags: ['watch', 'quotes'], icons: [{ src: '👁️' }] },
  { appId: 'research', name: 'Research Hub', description: 'Analyst reports and models.', publisher: 'ResearchLabs', version: '2.2.0', categories: ['Research'], tags: ['reports', 'models'], icons: [{ src: '📚' }], featured: true },
  { appId: 'risk', name: 'Risk Monitor', description: 'Firm-wide enterprise risk dashboards.', publisher: 'Acme Bank', version: '5.1.0', categories: ['Trading'], tags: ['risk', 'limits'], icons: [{ src: '🛡️' }], private: true },
];

function icon(app: CatalogApp): string {
  return app.icons?.[0]?.src ?? '📦';
}

export const AppStoreDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const catalog = useMemo(() => new AppCatalog(CATALOG, { onChange: forceRender }), []);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [includePrivate, setIncludePrivate] = useState(false);
  const [launched, setLaunched] = useState<string | null>(null);

  const categories = catalog.categories(includePrivate);
  const featured = catalog.featured(includePrivate);
  const results = catalog.search(query, { category: category || undefined, includePrivate });

  const card = (app: CatalogApp) => {
    const installed = catalog.isInstalled(app.appId);
    const pinned = catalog.isPinned(app.appId);
    return (
      <div key={app.appId} className="store-card">
        <div className="store-card-head">
          <span className="store-card-icon">{icon(app)}</span>
          <div>
            <div className="store-card-name">
              {app.name}
              {app.private && <span className="store-badge-private">Enterprise</span>}
            </div>
            <div className="store-card-meta">
              {app.publisher} · v{app.version}
            </div>
          </div>
        </div>
        <p className="store-card-desc">{app.description}</p>
        <div className="store-card-tags">
          {(app.tags ?? []).map((t) => (
            <span key={t} className="store-tag">
              {t}
            </span>
          ))}
        </div>
        <div className="store-card-actions">
          {installed ? (
            <>
              <button className="store-btn primary" onClick={() => setLaunched(app.name)}>
                Launch
              </button>
              <button className={`store-btn ${pinned ? 'active' : ''}`} onClick={() => (pinned ? catalog.unpin(app.appId) : catalog.pin(app.appId))}>
                {pinned ? '★ Pinned' : '☆ Pin'}
              </button>
              <button className="store-btn ghost" onClick={() => catalog.uninstall(app.appId)}>
                Uninstall
              </button>
            </>
          ) : (
            <button className="store-btn primary" onClick={() => catalog.install(app.appId)}>
              Install
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="store">
      <header className="store-head">
        <div>
          <h1>App Store</h1>
          <p className="store-sub">
            {catalog.installedApps().length} installed · {catalog.pinnedApps().length} pinned
            {launched && (
              <>
                {' '}
                · launched <strong>{launched}</strong>
              </>
            )}
          </p>
        </div>
        <div className="store-search-row">
          <input className="store-search" placeholder="Search apps…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          <label className="store-check">
            <input type="checkbox" checked={includePrivate} onChange={(e) => setIncludePrivate(e.target.checked)} />
            Enterprise catalog
          </label>
        </div>
      </header>

      <div className="store-cats">
        <button className={`store-chip ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} className={`store-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {query === '' && category === '' && featured.length > 0 && (
        <section className="store-section">
          <h2>Featured</h2>
          <div className="store-grid">{featured.map(card)}</div>
        </section>
      )}

      <section className="store-section">
        <h2>{query || category ? 'Results' : 'All apps'}</h2>
        {results.length === 0 ? (
          <p className="store-empty">No apps match your search.</p>
        ) : (
          <div className="store-grid">{results.map(card)}</div>
        )}
      </section>
    </div>
  );
};

export default AppStoreDemo;
