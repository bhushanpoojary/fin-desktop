/**
 * SDK testing utilities.
 *
 * Mocks so third-party app developers can unit-test FDC3 + Platform interactions without the
 * Electron container: an in-memory FDC3 agent (and connected pair), and a Platform backed by
 * an inspectable in-memory host.
 */

import {
  InteropBroker,
  DesktopAgent,
  AppDirectory,
  createMemoryTransportPair,
  type AppDirectoryApp,
} from '../interop/fdc3';
import { Platform, type PlatformHost, type PlatformOptions } from '../platform';
import type { Rect, ViewId, WindowId } from '../platform';

export interface MockFdc3Options {
  appId?: string;
  apps?: AppDirectoryApp[];
}

/** A standalone in-memory FDC3 agent for unit tests. */
export function createMockFdc3(options: MockFdc3Options = {}): DesktopAgent {
  const broker = new InteropBroker({ directory: new AppDirectory(options.apps ?? []) });
  return new DesktopAgent(broker, { appId: options.appId });
}

export interface MockFdc3PairOptions {
  apps?: AppDirectoryApp[];
  appIds?: [string, string];
}

/** Two FDC3 agents connected over a memory transport — for testing cross-app interop. */
export function createMockFdc3Pair(options: MockFdc3PairOptions = {}): [DesktopAgent, DesktopAgent] {
  const [t1, t2] = createMemoryTransportPair();
  const directory = () => new AppDirectory(options.apps ?? []);
  const broker1 = new InteropBroker({ transport: t1, directory: directory() });
  const broker2 = new InteropBroker({ transport: t2, directory: directory() });
  return [
    new DesktopAgent(broker1, { appId: options.appIds?.[0] }),
    new DesktopAgent(broker2, { appId: options.appIds?.[1] }),
  ];
}

export interface MockViewRecord {
  windowId: WindowId;
  url: string;
  bounds?: Rect;
  visible: boolean;
}

/** An inspectable in-memory PlatformHost: records windows, views, bounds, and visibility. */
export class MemoryPlatformHost implements PlatformHost {
  readonly windows = new Set<WindowId>();
  readonly views = new Map<ViewId, MockViewRecord>();

  createWindowHost(id: WindowId): void {
    this.windows.add(id);
  }
  destroyWindowHost(id: WindowId): void {
    this.windows.delete(id);
  }
  setWindowHostBounds(): void {}
  createView(windowId: WindowId, viewId: ViewId, url: string): void {
    this.views.set(viewId, { windowId, url, visible: false });
  }
  destroyView(viewId: ViewId): void {
    this.views.delete(viewId);
  }
  setViewBounds(viewId: ViewId, bounds: Rect): void {
    const view = this.views.get(viewId);
    if (view) view.bounds = bounds;
  }
  setViewVisible(viewId: ViewId, visible: boolean): void {
    const view = this.views.get(viewId);
    if (view) view.visible = visible;
  }

  /** Ids of currently visible views. */
  visibleViewIds(): ViewId[] {
    return [...this.views.entries()].filter(([, v]) => v.visible).map(([id]) => id);
  }
}

/** A Platform backed by an inspectable in-memory host, for testing app layout logic. */
export function createMockPlatform(options?: PlatformOptions): {
  platform: Platform;
  host: MemoryPlatformHost;
} {
  const host = new MemoryPlatformHost();
  const platform = new Platform(host, options);
  return { platform, host };
}
