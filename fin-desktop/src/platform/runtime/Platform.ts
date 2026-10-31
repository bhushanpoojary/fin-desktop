/**
 * Platform — owns the set of PlatformWindows and the platform-wide snapshot.
 *
 * This is the top-level runtime object the Electron main process instantiates with a
 * concrete `PlatformHost`. Save/restore of workspaces is implemented here via the pure
 * snapshot model.
 */

import type { Rect, WindowId } from '../types';
import {
  createSnapshot,
  type PlatformSnapshot,
} from '../snapshot/snapshot';
import type { PlatformHost } from './PlatformHost';
import {
  PlatformWindow,
  createCounterIdFactory,
  type ContentInset,
  type IdFactory,
} from './PlatformWindow';
import { Emitter, type EmitFn, type PlatformEventMap } from './events';

export interface CreateWindowOptions {
  id?: WindowId;
  gap?: number;
  contentInset?: Partial<ContentInset>;
}

export interface PlatformOptions {
  createId?: IdFactory;
  gap?: number;
  contentInset?: Partial<ContentInset>;
}

export class Platform {
  private readonly windows = new Map<WindowId, PlatformWindow>();
  private readonly emitter = new Emitter<PlatformEventMap>();

  private readonly host: PlatformHost;
  private readonly createId: IdFactory;
  private readonly defaults: Pick<PlatformOptions, 'gap' | 'contentInset'>;

  constructor(host: PlatformHost, options: PlatformOptions = {}) {
    this.host = host;
    this.createId = options.createId ?? createCounterIdFactory();
    this.defaults = { gap: options.gap, contentInset: options.contentInset };
  }

  on<K extends keyof PlatformEventMap>(
    type: K,
    fn: (payload: PlatformEventMap[K]) => void,
  ): () => void {
    return this.emitter.on(type, fn);
  }

  createWindow(bounds: Rect, options: CreateWindowOptions = {}): PlatformWindow {
    const id = options.id ?? this.createId('window');
    this.host.createWindowHost?.(id, bounds);

    const window = new PlatformWindow({
      id,
      bounds,
      host: this.host,
      createId: this.createId,
      emit: this.emitter.emit.bind(this.emitter) as EmitFn,
      gap: options.gap ?? this.defaults.gap,
      contentInset: options.contentInset ?? this.defaults.contentInset,
    });

    this.windows.set(id, window);
    this.emitter.emit('window-created', { windowId: id });
    return window;
  }

  getWindow(id: WindowId): PlatformWindow | null {
    return this.windows.get(id) ?? null;
  }

  listWindows(): PlatformWindow[] {
    return [...this.windows.values()];
  }

  closeWindow(id: WindowId): void {
    const window = this.windows.get(id);
    if (!window) return;
    window.destroy();
    this.host.destroyWindowHost?.(id);
    this.windows.delete(id);
    this.emitter.emit('window-closed', { windowId: id });
  }

  getSnapshot(): PlatformSnapshot {
    return createSnapshot(this.listWindows().map((w) => w.getSnapshot()));
  }

  /** Tear down all current windows and rebuild platform state from a snapshot. */
  applySnapshot(snapshot: PlatformSnapshot): void {
    for (const id of [...this.windows.keys()]) this.closeWindow(id);
    for (const win of snapshot.windows) {
      const window = this.createWindow(win.bounds, { id: win.id });
      window.applyLayout(win.layout, win.views);
    }
  }
}
