import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Platform } from '../Platform';
import type { PlatformHost } from '../PlatformHost';
import type { IdFactory } from '../PlatformWindow';
import type { Rect, ViewId, WindowId } from '../../types';

/** Deterministic per-prefix ids: window-1, view-1, stack-1, split-1, … */
function seqIds(): IdFactory {
  const counters: Record<string, number> = {};
  return (prefix) => `${prefix}-${(counters[prefix] = (counters[prefix] ?? 0) + 1)}`;
}

class FakeHost implements PlatformHost {
  windowHosts: { id: WindowId; bounds: Rect }[] = [];
  destroyedWindows: WindowId[] = [];
  created: { windowId: WindowId; viewId: ViewId; url: string }[] = [];
  destroyed: ViewId[] = [];
  bounds = new Map<ViewId, Rect>();
  visible = new Map<ViewId, boolean>();

  createWindowHost(id: WindowId, bounds: Rect): void {
    this.windowHosts.push({ id, bounds });
  }
  destroyWindowHost(id: WindowId): void {
    this.destroyedWindows.push(id);
  }
  setWindowHostBounds(): void {}
  createView(windowId: WindowId, viewId: ViewId, url: string): void {
    this.created.push({ windowId, viewId, url });
  }
  destroyView(viewId: ViewId): void {
    this.destroyed.push(viewId);
    this.bounds.delete(viewId);
    this.visible.delete(viewId);
  }
  setViewBounds(viewId: ViewId, bounds: Rect): void {
    this.bounds.set(viewId, bounds);
  }
  setViewVisible(viewId: ViewId, visible: boolean): void {
    this.visible.set(viewId, visible);
  }
}

const WINDOW_BOUNDS: Rect = { x: 0, y: 0, width: 1200, height: 800 };

describe('Platform runtime', () => {
  let host: FakeHost;
  let platform: Platform;

  beforeEach(() => {
    host = new FakeHost();
    platform = new Platform(host, { createId: seqIds() });
  });

  it('creates a window via the host', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    expect(win.id).toBe('window-1');
    expect(host.windowHosts).toEqual([{ id: 'window-1', bounds: WINDOW_BOUNDS }]);
  });

  it('adds the first view filling the whole content area', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    const viewId = win.addView('https://a.test');

    expect(viewId).toBe('view-1');
    expect(host.created).toContainEqual({
      windowId: 'window-1',
      viewId: 'view-1',
      url: 'https://a.test',
    });
    expect(host.bounds.get('view-1')).toEqual({ x: 0, y: 0, width: 1200, height: 800 });
    expect(host.visible.get('view-1')).toBe(true);
  });

  it('tabs a second view into the same stack (only active is visible)', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    win.addView('https://a.test');
    const second = win.addView('https://b.test');

    expect(second).toBe('view-2');
    expect(host.visible.get('view-1')).toBe(false);
    expect(host.visible.get('view-2')).toBe(true);
    expect(host.bounds.get('view-2')).toEqual({ x: 0, y: 0, width: 1200, height: 800 });
  });

  it('splits a view into two side-by-side panes', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    const first = win.addView('https://a.test');
    const second = win.splitView(first, 'right', 'https://b.test');

    expect(second).toBe('view-2');
    expect(host.bounds.get('view-1')).toEqual({ x: 0, y: 0, width: 600, height: 800 });
    expect(host.bounds.get('view-2')).toEqual({ x: 600, y: 0, width: 600, height: 800 });
    expect(host.visible.get('view-1')).toBe(true);
    expect(host.visible.get('view-2')).toBe(true);
  });

  it('closes a split pane and collapses back to full width', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    const first = win.addView('https://a.test');
    const second = win.splitView(first, 'right', 'https://b.test');

    win.closeView(second);

    expect(host.destroyed).toContain('view-2');
    expect(host.bounds.get('view-1')).toEqual({ x: 0, y: 0, width: 1200, height: 800 });
  });

  it('activates a tab, swapping visibility', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    const first = win.addView('https://a.test');
    win.addView('https://b.test');

    win.activateView(first);

    expect(host.visible.get('view-1')).toBe(true);
    expect(host.visible.get('view-2')).toBe(false);
  });

  it('repositions views when the window is resized', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    const first = win.addView('https://a.test');
    win.splitView(first, 'right', 'https://b.test');

    win.setBounds({ x: 0, y: 0, width: 2000, height: 1000 });

    expect(host.bounds.get('view-1')).toEqual({ x: 0, y: 0, width: 1000, height: 1000 });
    expect(host.bounds.get('view-2')).toEqual({ x: 1000, y: 0, width: 1000, height: 1000 });
  });

  it('honours a content inset (reserved tab-strip space)', () => {
    const win = platform.createWindow(WINDOW_BOUNDS, { contentInset: { top: 40 } });
    win.addView('https://a.test');
    expect(host.bounds.get('view-1')).toEqual({ x: 0, y: 40, width: 1200, height: 760 });
  });

  it('emits lifecycle events', () => {
    const created = vi.fn();
    const closed = vi.fn();
    platform.on('view-created', created);
    platform.on('view-closed', closed);

    const win = platform.createWindow(WINDOW_BOUNDS);
    const viewId = win.addView('https://a.test');
    win.closeView(viewId);

    expect(created).toHaveBeenCalledWith({ windowId: 'window-1', viewId: 'view-1' });
    expect(closed).toHaveBeenCalledWith({ windowId: 'window-1', viewId: 'view-1' });
  });

  it('closing a window destroys its views and native host', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    win.addView('https://a.test');
    win.addView('https://b.test');

    platform.closeWindow(win.id);

    expect(host.destroyed).toEqual(expect.arrayContaining(['view-1', 'view-2']));
    expect(host.destroyedWindows).toContain('window-1');
    expect(platform.getWindow('window-1')).toBeNull();
  });

  it('round-trips platform state through snapshot + restore', () => {
    const win = platform.createWindow(WINDOW_BOUNDS);
    const first = win.addView('https://a.test');
    win.splitView(first, 'down', 'https://b.test');

    const snapshot = platform.getSnapshot();

    // Rebuild into a fresh platform/host.
    const host2 = new FakeHost();
    const platform2 = new Platform(host2, { createId: seqIds() });
    platform2.applySnapshot(snapshot);

    const restored = platform2.getWindow('window-1');
    expect(restored).not.toBeNull();
    expect(restored?.getSnapshot()).toEqual(snapshot.windows[0]);
    // Both views were recreated natively.
    expect(host2.created.map((c) => c.url).sort()).toEqual(['https://a.test', 'https://b.test']);
  });
});

describe('Platform security guard (canOpenUrl)', () => {
  it('blocks views whose URL is rejected and allows permitted ones', () => {
    const host = new FakeHost();
    const platform = new Platform(host, {
      createId: seqIds(),
      canOpenUrl: (url) => url.startsWith('https://ok'),
    });
    const win = platform.createWindow(WINDOW_BOUNDS);

    expect(() => win.addView('https://evil.test')).toThrow(/Blocked by policy/);
    expect(host.created).toHaveLength(0);
    expect(win.getLayout()).toBeNull();

    const id = win.addView('https://ok.test');
    expect(host.created).toHaveLength(1);

    expect(() => win.splitView(id, 'right', 'https://evil.test')).toThrow(/Blocked by policy/);
    expect(host.created).toHaveLength(1);
  });

  it('can be overridden per window', () => {
    const host = new FakeHost();
    const platform = new Platform(host, { createId: seqIds(), canOpenUrl: () => false });
    const win = platform.createWindow(WINDOW_BOUNDS, { canOpenUrl: () => true });
    expect(() => win.addView('https://anything.test')).not.toThrow();
    expect(host.created).toHaveLength(1);
  });
});
