/**
 * FDC3 2.0 Channel implementation.
 *
 * Caches the latest broadcast context (per type and overall) and replays it to new
 * listeners, per the FDC3 channel semantics. Pure and in-memory; shared ChannelImpl
 * instances let multiple DesktopAgents interop.
 */

import type { Context } from './context';
import type { Channel, ChannelType, ContextHandler, DisplayMetadata, Listener } from './types';

interface ListenerEntry {
  type: string | null;
  handler: ContextHandler;
}

export class ChannelImpl implements Channel {
  readonly id: string;
  readonly type: ChannelType;
  readonly displayMetadata?: DisplayMetadata;

  private readonly cacheByType = new Map<string, Context>();
  private last: Context | null = null;
  private readonly listeners = new Set<ListenerEntry>();

  constructor(id: string, type: ChannelType, displayMetadata?: DisplayMetadata) {
    this.id = id;
    this.type = type;
    this.displayMetadata = displayMetadata;
  }

  broadcast(context: Context): void {
    this.cacheByType.set(context.type, context);
    this.last = context;
    for (const entry of this.listeners) {
      if (entry.type === null || entry.type === context.type) {
        entry.handler(context);
      }
    }
  }

  getCurrentContext(contextType?: string): Context | null {
    if (contextType) return this.cacheByType.get(contextType) ?? null;
    return this.last;
  }

  addContextListener(contextType: string | null, handler: ContextHandler): Listener {
    const entry: ListenerEntry = { type: contextType, handler };
    this.listeners.add(entry);
    // FDC3: a new listener immediately receives the latest matching context.
    const replay = contextType ? this.cacheByType.get(contextType) : this.last;
    if (replay) handler(replay);
    return {
      unsubscribe: () => {
        this.listeners.delete(entry);
      },
    };
  }
}
