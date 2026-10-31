import { describe, it, expect } from 'vitest';
import { BrowserModel, deriveTitle } from '../browserModel';

function model() {
  let n = 0;
  return new BrowserModel({ idFactory: () => `t${n++}` });
}

describe('deriveTitle', () => {
  it('uses the hostname, falling back to the raw string', () => {
    expect(deriveTitle('https://example.com/path')).toBe('example.com');
    expect(deriveTitle('not a url')).toBe('not a url');
  });
});

describe('BrowserModel', () => {
  it('starts with one empty pane', () => {
    const b = model();
    expect(b.getPanes()).toHaveLength(1);
    expect(b.isSplit()).toBe(false);
    expect(b.getActiveTabId()).toBeNull();
  });

  it('opens tabs and tracks the active one', () => {
    const b = model();
    const a = b.newTab('https://a.com');
    const c = b.newTab('https://c.com');
    expect(b.getTabs().map((t) => t.id)).toEqual([a, c]);
    expect(b.getActiveTabId()).toBe(c);
    expect(b.currentUrl(a)).toBe('https://a.com');
    b.activateTab(a);
    expect(b.getActiveTabId()).toBe(a);
  });

  it('navigates with back/forward history', () => {
    const b = model();
    const t = b.newTab('https://a.com');
    b.navigate('https://b.com');
    b.navigate('https://c.com');
    expect(b.currentUrl(t)).toBe('https://c.com');
    expect(b.canGoBack(t)).toBe(true);
    expect(b.back(t)).toBe(true);
    expect(b.currentUrl(t)).toBe('https://b.com');
    expect(b.forward(t)).toBe(true);
    expect(b.currentUrl(t)).toBe('https://c.com');
    expect(b.forward(t)).toBe(false);
  });

  it('navigating after going back truncates forward history', () => {
    const b = model();
    const t = b.newTab('https://a.com');
    b.navigate('https://b.com');
    b.back(t);
    b.navigate('https://d.com');
    expect(b.canGoForward(t)).toBe(false);
    expect(b.currentUrl(t)).toBe('https://d.com');
  });

  it('closes tabs and picks a neighbouring active tab', () => {
    const b = model();
    const a = b.newTab('https://a.com');
    const c = b.newTab('https://c.com');
    b.activateTab(a);
    expect(b.closeTab(a)).toBe(true);
    expect(b.getActiveTabId()).toBe(c);
    expect(b.getTab(a)).toBeUndefined();
  });

  it('sets per-tab FDC3 channel membership', () => {
    const b = model();
    const t = b.newTab('https://a.com');
    b.setChannel(t, 'red');
    expect(b.getTab(t)?.channelId).toBe('red');
    b.setChannel(t, undefined);
    expect(b.getTab(t)?.channelId).toBeUndefined();
  });

  it('splits the active tab into a second pane and merges back', () => {
    const b = model();
    const a = b.newTab('https://a.com');
    const c = b.newTab('https://c.com'); // active
    const paneId = b.split();
    expect(paneId).not.toBeNull();
    expect(b.isSplit()).toBe(true);
    const panes = b.getPanes();
    expect(panes[0].tabIds).toEqual([a]);
    expect(panes[1].tabIds).toEqual([c]);
    b.unsplit();
    expect(b.isSplit()).toBe(false);
    expect(b.getPanes()[0].tabIds).toEqual([a, c]);
  });

  it('refuses to split with fewer than two tabs', () => {
    const b = model();
    b.newTab('https://a.com');
    expect(b.split()).toBeNull();
  });

  it('collapses an emptied split pane on close', () => {
    const b = model();
    b.newTab('https://a.com');
    const c = b.newTab('https://c.com');
    b.split(); // c moves to pane 2
    expect(b.isSplit()).toBe(true);
    b.closeTab(c);
    expect(b.isSplit()).toBe(false);
  });

  it('saves and restores a workspace snapshot', () => {
    const b = model();
    const a = b.newTab('https://a.com');
    b.newTab('https://c.com');
    b.setChannel(a, 'blue');
    b.split();
    const ws = b.toWorkspace();

    const restored = BrowserModel.fromWorkspace(ws);
    expect(restored.isSplit()).toBe(true);
    expect(restored.getTab(a)?.channelId).toBe('blue');
    expect(restored.toWorkspace()).toEqual(ws);
  });
});
