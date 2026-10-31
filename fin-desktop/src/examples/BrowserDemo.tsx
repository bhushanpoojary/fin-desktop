/**
 * BrowserDemo — a multi-tab browser container: tabs, an address bar with back/forward, split view,
 * per-tab FDC3 channel membership, and save/restore of the page-layout as a workspace snapshot.
 * Pages are rendered as a lightweight placeholder (no real WebContentsView in this demo). Route:
 * ?test=browser.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { BrowserModel } from '../browser';
import type { BrowserPane, BrowserWorkspace } from '../browser';
import './BrowserDemo.css';

const CHANNELS: Array<{ id: string; color: string }> = [
  { id: 'red', color: '#e2574c' },
  { id: 'blue', color: '#4f8cff' },
  { id: 'green', color: '#3fb27f' },
  { id: 'yellow', color: '#e3b23c' },
];

function channelColor(id?: string): string | undefined {
  return CHANNELS.find((c) => c.id === id)?.color;
}

export const BrowserDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const browser = useMemo(() => {
    const b = new BrowserModel({ onChange: forceRender });
    b.newTab('https://fdc3.finos.org');
    b.newTab('https://github.com/finos');
    return b;
  }, []);
  const [saved, setSaved] = useState<BrowserWorkspace | null>(null);
  const [addr, setAddr] = useState('');

  const panes = browser.getPanes();

  const submitAddr = (e: React.FormEvent) => {
    e.preventDefault();
    const url = addr.trim();
    if (!url) return;
    browser.navigate(/^https?:\/\//.test(url) ? url : `https://${url}`);
    setAddr('');
  };

  const renderTabStrip = (pane: BrowserPane) => (
    <div className="br-tabs">
      {pane.tabIds.map((tabId) => {
        const tab = browser.getTab(tabId)!;
        const active = pane.activeTabId === tabId;
        const color = channelColor(tab.channelId);
        return (
          <div key={tabId} className={`br-tab ${active ? 'active' : ''}`} onClick={() => browser.activateTab(tabId)}>
            {color && <span className="br-tab-chan" style={{ background: color }} />}
            <span className="br-tab-title">{tab.title}</span>
            <button
              className="br-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                browser.closeTab(tabId);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
      <button className="br-tab-new" onClick={() => browser.newTab('https://example.com')}>
        +
      </button>
    </div>
  );

  const renderPane = (pane: BrowserPane) => {
    const tabId = pane.activeTabId;
    const tab = tabId ? browser.getTab(tabId) : undefined;
    const url = tabId ? browser.currentUrl(tabId) : undefined;
    return (
      <div className="br-pane" key={pane.id} onFocus={() => tabId && browser.activateTab(tabId)}>
        {renderTabStrip(pane)}
        {tab && tabId ? (
          <>
            <div className="br-addr">
              <button className="br-nav" disabled={!browser.canGoBack(tabId)} onClick={() => browser.back(tabId)}>
                ←
              </button>
              <button className="br-nav" disabled={!browser.canGoForward(tabId)} onClick={() => browser.forward(tabId)}>
                →
              </button>
              <div className="br-url">{url}</div>
              <select
                className="br-chan-select"
                value={tab.channelId ?? ''}
                onChange={(e) => browser.setChannel(tabId, e.target.value || undefined)}
                title="FDC3 channel"
                style={{ borderColor: channelColor(tab.channelId) ?? '#2a3344' }}
              >
                <option value="">No channel</option>
                {CHANNELS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="br-page">
              <div className="br-page-card">
                <div className="br-page-host">{tab.title}</div>
                <div className="br-page-url">{url}</div>
                {tab.channelId && (
                  <div className="br-page-chan" style={{ color: channelColor(tab.channelId) }}>
                    ● joined “{tab.channelId}” channel
                  </div>
                )}
                <p className="br-page-note">Page content (View) would render here.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="br-page br-empty">No tabs</div>
        )}
      </div>
    );
  };

  return (
    <div className="br">
      <header className="br-toolbar">
        <h1>Browser</h1>
        <form className="br-addr-global" onSubmit={submitAddr}>
          <input placeholder="Enter URL and press Enter to open in active tab…" value={addr} onChange={(e) => setAddr(e.target.value)} />
        </form>
        <div className="br-actions">
          {browser.isSplit() ? (
            <button className="br-action" onClick={() => browser.unsplit()}>
              Unsplit
            </button>
          ) : (
            <button className="br-action" onClick={() => browser.split()} title="Split the active tab into a second pane">
              Split view
            </button>
          )}
          <button className="br-action" onClick={() => setSaved(browser.toWorkspace())}>
            Save layout
          </button>
          <span className="br-saved">{saved ? `Saved ${saved.tabs.length} tabs` : ''}</span>
        </div>
      </header>
      <div className="br-panes">{panes.map(renderPane)}</div>
    </div>
  );
};

export default BrowserDemo;
