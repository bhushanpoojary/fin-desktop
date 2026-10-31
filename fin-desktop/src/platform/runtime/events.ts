/**
 * Minimal typed event emitter for Platform lifecycle events.
 */

import type { ViewId, WindowId } from '../types';

export interface PlatformEventMap {
  'window-created': { windowId: WindowId };
  'window-closed': { windowId: WindowId };
  'view-created': { windowId: WindowId; viewId: ViewId };
  'view-closed': { windowId: WindowId; viewId: ViewId };
  'layout-changed': { windowId: WindowId };
}

export type Listener<T> = (payload: T) => void;

/** A bound emit function covering every Platform event. */
export type EmitFn = <K extends keyof PlatformEventMap>(
  type: K,
  payload: PlatformEventMap[K],
) => void;

export class Emitter<Events> {
  private readonly listeners = new Map<keyof Events, Set<Listener<unknown>>>();

  on<K extends keyof Events>(type: K, fn: Listener<Events[K]>): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(fn as Listener<unknown>);
    return () => {
      this.listeners.get(type)?.delete(fn as Listener<unknown>);
    };
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const fn of set) {
      (fn as Listener<Events[K]>)(payload);
    }
  }
}
