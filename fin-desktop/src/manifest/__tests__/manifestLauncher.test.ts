import { describe, it, expect } from 'vitest';
import { launchManifest, windowBoundsFromOptions, manifestGuard } from '../manifestLauncher';
import type { AppManifest, PlatformManifest } from '../manifest';
import { Platform } from '../../platform';
import type { PlatformHost } from '../../platform';
import type { Rect, ViewId, WindowId } from '../../platform';

function seqIds() {
  const counters: Record<string, number> = {};
  return (prefix: string) => `${prefix}-${(counters[prefix] = (counters[prefix] ?? 0) + 1)}`;
}

class FakeHost implements PlatformHost {
  created: { viewId: ViewId; url: string }[] = [];
  windowHosts: WindowId[] = [];
  createWindowHost(id: WindowId): void {
    this.windowHosts.push(id);
  }
  destroyWindowHost(): void {}
  setWindowHostBounds(): void {}
  createView(_windowId: WindowId, viewId: ViewId, url: string): void {
    this.created.push({ viewId, url });
  }
  destroyView(): void {}
  setViewBounds(): void {}
  setViewVisible(): void {}
}

const appManifest: AppManifest = {
  type: 'application',
  startupApp: {
    appId: 'blotter',
    name: 'Blotter',
    url: 'https://apps.example.com/blotter',
    windowOptions: { defaultWidth: 900, defaultHeight: 700, defaultLeft: 50, defaultTop: 60 },
  },
  permissions: { domains: { allow: ['*.data.example.com'] } },
};

describe('windowBoundsFromOptions', () => {
  it('maps declared window options to bounds', () => {
    expect(windowBoundsFromOptions(appManifest.startupApp.windowOptions)).toEqual({
      x: 50,
      y: 60,
      width: 900,
      height: 700,
    });
  });

  it('falls back when options are missing', () => {
    const fallback: Rect = { x: 1, y: 2, width: 3, height: 4 };
    expect(windowBoundsFromOptions(undefined, fallback)).toEqual(fallback);
  });
});

describe('manifestGuard', () => {
  it('is undefined when no domains are declared', () => {
    expect(manifestGuard({ ...appManifest, permissions: {} })).toBeUndefined();
  });

  it('always allows the startup URL host even if not in the allow-list', () => {
    const guard = manifestGuard(appManifest, appManifest.startupApp.url)!;
    expect(guard('https://apps.example.com/anything')).toBe(true);
    expect(guard('https://charts.data.example.com')).toBe(true);
    expect(guard('https://evil.com')).toBe(false);
  });
});

describe('launchManifest — application', () => {
  it('opens a window with the startup view', () => {
    const host = new FakeHost();
    const platform = new Platform(host, { createId: seqIds() });
    const result = launchManifest(platform, appManifest);

    expect(result.type).toBe('application');
    expect(result.viewIds).toHaveLength(1);
    expect(host.created.map((c) => c.url)).toEqual(['https://apps.example.com/blotter']);
    expect(platform.getWindow(result.windowId!)?.getBounds()).toEqual({
      x: 50,
      y: 60,
      width: 900,
      height: 700,
    });
  });

  it('enforces the manifest allow-list for further views', () => {
    const host = new FakeHost();
    const platform = new Platform(host, { createId: seqIds() });
    const result = launchManifest(platform, appManifest);
    const win = platform.getWindow(result.windowId!)!;

    expect(() => win.addView('https://evil.com')).toThrow(/Blocked by policy/);
    expect(() => win.addView('https://charts.data.example.com')).not.toThrow();
  });

  it('imposes no restriction when the manifest declares no domains', () => {
    const host = new FakeHost();
    const platform = new Platform(host, { createId: seqIds() });
    const manifest: AppManifest = { ...appManifest, permissions: {} };
    const result = launchManifest(platform, manifest);
    const win = platform.getWindow(result.windowId!)!;
    expect(() => win.addView('https://anywhere.com')).not.toThrow();
  });
});

describe('launchManifest — platform', () => {
  it('opens an empty window when there is no snapshot', () => {
    const host = new FakeHost();
    const platform = new Platform(host, { createId: seqIds() });
    const manifest: PlatformManifest = { type: 'platform', platform: { name: 'P' } };
    const result = launchManifest(platform, manifest);
    expect(result.type).toBe('platform');
    expect(result.viewIds).toEqual([]);
    expect(platform.getWindow(result.windowId!)).not.toBeNull();
  });

  it('restores a snapshot when present', () => {
    const host = new FakeHost();
    const platform = new Platform(host, { createId: seqIds() });
    const manifest: PlatformManifest = {
      type: 'platform',
      platform: { name: 'P' },
      snapshot: {
        version: 1,
        createdAt: 0,
        windows: [
          {
            id: 'w1',
            bounds: { x: 0, y: 0, width: 800, height: 600 },
            views: [{ id: 'v1', url: 'https://example.com' }],
            layout: { type: 'stack', id: 's1', viewIds: ['v1'], activeViewId: 'v1' },
          },
        ],
      },
    };
    const result = launchManifest(platform, manifest);
    expect(result.viewIds).toEqual(['v1']);
    expect(host.created.map((c) => c.url)).toContain('https://example.com');
  });
});
