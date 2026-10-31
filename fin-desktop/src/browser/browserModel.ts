/**
 * Multi-tab Browser model — a tabbed container that hosts Views (pages), supports a side-by-side
 * split view, per-tab navigation history, per-tab FDC3 channel membership, and save/restore of the
 * whole page-layout as a workspace snapshot.
 *
 * Pure and framework-agnostic. Tabs live in panes (1 pane normally, 2 when split); each tab owns a
 * back/forward history stack. A thin React component renders the panes/tabs and an address bar.
 */

export interface BrowserTab {
  id: string;
  title?: string;
  history: string[];
  historyIndex: number;
  /** FDC3 channel the tab is joined to (drives the colored membership indicator). */
  channelId?: string;
}

export interface BrowserPane {
  id: string;
  tabIds: string[];
  activeTabId: string | null;
}

export interface BrowserWorkspace {
  tabs: Array<{ id: string; url: string; title?: string; channelId?: string }>;
  panes: Array<{ id: string; tabIds: string[]; activeTabId: string | null }>;
  activePaneId: string;
}

export interface BrowserModelOptions {
  onChange?: () => void;
  idFactory?: () => string;
}

let counter = 0;
function defaultId(): string {
  counter += 1;
  return `b${counter}`;
}

export function deriveTitle(url: string): string {
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

export class BrowserModel {
  private readonly tabs = new Map<string, BrowserTab>();
  private panes: BrowserPane[];
  private activePaneId: string;
  private readonly onChange?: () => void;
  private readonly newId: () => string;

  constructor(options: BrowserModelOptions = {}) {
    this.onChange = options.onChange;
    this.newId = options.idFactory ?? defaultId;
    const pane: BrowserPane = { id: this.newId(), tabIds: [], activeTabId: null };
    this.panes = [pane];
    this.activePaneId = pane.id;
  }

  private emit(): void {
    this.onChange?.();
  }

  private pane(paneId?: string): BrowserPane {
    const id = paneId ?? this.activePaneId;
    const found = this.panes.find((p) => p.id === id);
    if (!found) throw new Error(`unknown pane: ${id}`);
    return found;
  }

  private paneOfTab(tabId: string): BrowserPane | undefined {
    return this.panes.find((p) => p.tabIds.includes(tabId));
  }

  getPanes(): BrowserPane[] {
    return this.panes.map((p) => ({ ...p, tabIds: [...p.tabIds] }));
  }

  getActivePaneId(): string {
    return this.activePaneId;
  }

  isSplit(): boolean {
    return this.panes.length > 1;
  }

  getTab(tabId: string): BrowserTab | undefined {
    const tab = this.tabs.get(tabId);
    return tab ? { ...tab, history: [...tab.history] } : undefined;
  }

  getTabs(paneId?: string): BrowserTab[] {
    return this.pane(paneId).tabIds.map((id) => {
      const tab = this.tabs.get(id)!;
      return { ...tab, history: [...tab.history] };
    });
  }

  currentUrl(tabId: string): string | undefined {
    const tab = this.tabs.get(tabId);
    return tab ? tab.history[tab.historyIndex] : undefined;
  }

  getActiveTabId(paneId?: string): string | null {
    return this.pane(paneId).activeTabId;
  }

  newTab(url: string, paneId?: string): string {
    const pane = this.pane(paneId);
    const id = this.newId();
    this.tabs.set(id, { id, title: deriveTitle(url), history: [url], historyIndex: 0 });
    pane.tabIds.push(id);
    pane.activeTabId = id;
    this.activePaneId = pane.id;
    this.emit();
    return id;
  }

  activateTab(tabId: string): void {
    const pane = this.paneOfTab(tabId);
    if (!pane) return;
    pane.activeTabId = tabId;
    this.activePaneId = pane.id;
    this.emit();
  }

  closeTab(tabId: string): boolean {
    const pane = this.paneOfTab(tabId);
    if (!pane) return false;
    const index = pane.tabIds.indexOf(tabId);
    pane.tabIds.splice(index, 1);
    this.tabs.delete(tabId);
    if (pane.activeTabId === tabId) {
      pane.activeTabId = pane.tabIds[index] ?? pane.tabIds[index - 1] ?? pane.tabIds[0] ?? null;
    }
    // Collapse an emptied pane (never drop the last pane).
    if (pane.tabIds.length === 0 && this.panes.length > 1) {
      this.panes = this.panes.filter((p) => p.id !== pane.id);
      if (this.activePaneId === pane.id) this.activePaneId = this.panes[0].id;
    }
    this.emit();
    return true;
  }

  navigate(url: string, tabId?: string): void {
    const id = tabId ?? this.pane().activeTabId;
    const tab = id ? this.tabs.get(id) : undefined;
    if (!tab) return;
    tab.history = tab.history.slice(0, tab.historyIndex + 1);
    tab.history.push(url);
    tab.historyIndex = tab.history.length - 1;
    tab.title = deriveTitle(url);
    this.emit();
  }

  canGoBack(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    return tab ? tab.historyIndex > 0 : false;
  }

  canGoForward(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    return tab ? tab.historyIndex < tab.history.length - 1 : false;
  }

  back(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab || tab.historyIndex === 0) return false;
    tab.historyIndex -= 1;
    this.emit();
    return true;
  }

  forward(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab || tab.historyIndex >= tab.history.length - 1) return false;
    tab.historyIndex += 1;
    this.emit();
    return true;
  }

  setChannel(tabId: string, channelId: string | undefined): void {
    const tab = this.tabs.get(tabId);
    if (!tab) return;
    tab.channelId = channelId;
    this.emit();
  }

  /** Move a tab to another pane (optionally at an index). */
  moveTab(tabId: string, toPaneId: string, index?: number): boolean {
    const from = this.paneOfTab(tabId);
    const to = this.panes.find((p) => p.id === toPaneId);
    if (!from || !to) return false;
    from.tabIds = from.tabIds.filter((id) => id !== tabId);
    const at = index === undefined ? to.tabIds.length : Math.max(0, Math.min(index, to.tabIds.length));
    to.tabIds.splice(at, 0, tabId);
    to.activeTabId = tabId;
    if (from.activeTabId === tabId) from.activeTabId = from.tabIds[0] ?? null;
    if (from.tabIds.length === 0 && this.panes.length > 1) {
      this.panes = this.panes.filter((p) => p.id !== from.id);
      if (this.activePaneId === from.id) this.activePaneId = to.id;
    }
    this.emit();
    return true;
  }

  /** Split off the active tab into a new side-by-side pane. Needs ≥2 tabs in the source pane. */
  split(): string | null {
    if (this.panes.length > 1) return null;
    const source = this.pane();
    const tabId = source.activeTabId;
    if (!tabId || source.tabIds.length < 2) return null;
    const pane: BrowserPane = { id: this.newId(), tabIds: [], activeTabId: null };
    this.panes.push(pane);
    this.moveTab(tabId, pane.id);
    return pane.id;
  }

  /** Merge the second pane back into the first. */
  unsplit(): void {
    if (this.panes.length < 2) return;
    const [first, second] = this.panes;
    first.tabIds.push(...second.tabIds);
    this.panes = [first];
    this.activePaneId = first.id;
    this.emit();
  }

  /** Snapshot the whole layout (tabs + panes + current URLs) as a saveable workspace. */
  toWorkspace(): BrowserWorkspace {
    return {
      tabs: [...this.tabs.values()].map((t) => ({
        id: t.id,
        url: t.history[t.historyIndex],
        title: t.title,
        channelId: t.channelId,
      })),
      panes: this.panes.map((p) => ({ id: p.id, tabIds: [...p.tabIds], activeTabId: p.activeTabId })),
      activePaneId: this.activePaneId,
    };
  }

  static fromWorkspace(ws: BrowserWorkspace, options: BrowserModelOptions = {}): BrowserModel {
    const model = new BrowserModel(options);
    model.tabs.clear();
    for (const t of ws.tabs) {
      model.tabs.set(t.id, { id: t.id, title: t.title ?? deriveTitle(t.url), history: [t.url], historyIndex: 0, channelId: t.channelId });
    }
    model.panes = ws.panes.map((p) => ({ id: p.id, tabIds: [...p.tabIds], activeTabId: p.activeTabId }));
    model.activePaneId = ws.activePaneId;
    return model;
  }
}
