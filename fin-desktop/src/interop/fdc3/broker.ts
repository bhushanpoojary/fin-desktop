/**
 * FDC3 2.0 Interop broker.
 *
 * The shared hub for a set of DesktopAgents: owns the channel registry (user / app / private)
 * and routes raised intents to registered intent listeners. In-process and pure; a transport
 * can later bridge brokers across windows/processes.
 */

import { AppDirectory } from './appDirectory';
import { ChannelImpl } from './channel';
import type { Context } from './context';
import type { Transport, InteropMessage } from './fdc3Transport';
import type {
  Channel,
  DisplayMetadata,
  IntentHandler,
  IntentResolution,
  Listener,
} from './types';

/** FDC3-recommended user channel palette. */
const DEFAULT_USER_CHANNELS: { id: string; displayMetadata: DisplayMetadata }[] = [
  { id: 'red', displayMetadata: { name: 'Red', color: '#d32f2f' } },
  { id: 'orange', displayMetadata: { name: 'Orange', color: '#ef6c00' } },
  { id: 'yellow', displayMetadata: { name: 'Yellow', color: '#fbc02d' } },
  { id: 'green', displayMetadata: { name: 'Green', color: '#388e3c' } },
  { id: 'cyan', displayMetadata: { name: 'Cyan', color: '#0097a7' } },
  { id: 'blue', displayMetadata: { name: 'Blue', color: '#1976d2' } },
  { id: 'magenta', displayMetadata: { name: 'Magenta', color: '#c2185b' } },
  { id: 'purple', displayMetadata: { name: 'Purple', color: '#7b1fa2' } },
];

interface IntentEntry {
  appId?: string;
  handler: IntentHandler;
}

/** An observed interop event, for the inspector / devtools. */
export interface InteropObservedEvent {
  kind: 'broadcast' | 'intent';
  channelId?: string;
  intent?: string;
  context: Context;
  source?: { appId?: string };
  deliveredTo?: number;
  origin: 'local' | 'remote';
  timestamp: number;
}

export type InteropObserver = (event: InteropObservedEvent) => void;

export interface InteropBrokerOptions {
  userChannels?: { id: string; displayMetadata?: DisplayMetadata }[];
  directory?: AppDirectory;
  createId?: () => string;
  /** Optional transport to sync broadcasts + intents with brokers in other windows. */
  transport?: Transport;
  now?: () => number;
}

export class InteropBroker {
  private readonly userChannels: ChannelImpl[];
  private readonly byId = new Map<string, ChannelImpl>();
  private readonly appChannels = new Map<string, ChannelImpl>();
  private readonly intentListeners = new Map<string, Set<IntentEntry>>();
  private readonly directory: AppDirectory;
  private readonly createId: () => string;
  private readonly transport?: Transport;
  private readonly disposeTransport?: () => void;
  private readonly id = `broker-${Math.random().toString(36).slice(2, 10)}`;
  private readonly now: () => number;
  private readonly observers = new Set<InteropObserver>();
  private privateSeq = 0;

  constructor(options: InteropBrokerOptions = {}) {
    this.directory = options.directory ?? new AppDirectory();
    this.createId = options.createId ?? (() => `private-${++this.privateSeq}`);
    this.now = options.now ?? Date.now;
    const defs = options.userChannels ?? DEFAULT_USER_CHANNELS;
    this.userChannels = defs.map((d) => new ChannelImpl(d.id, 'user', d.displayMetadata));
    for (const ch of this.userChannels) this.byId.set(ch.id, ch);
    this.transport = options.transport;
    this.disposeTransport = options.transport?.subscribe((m) => this.applyRemote(m));
  }

  /** Observe every broadcast/intent flowing through this broker (for the inspector). */
  observe(observer: InteropObserver): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notify(event: InteropObservedEvent): void {
    for (const observer of this.observers) observer(event);
  }

  getDirectory(): AppDirectory {
    return this.directory;
  }

  getUserChannels(): Channel[] {
    return [...this.userChannels];
  }

  getChannel(id: string): ChannelImpl | undefined {
    return this.byId.get(id);
  }

  getOrCreateChannel(id: string): ChannelImpl {
    let channel = this.appChannels.get(id);
    if (!channel) {
      channel = new ChannelImpl(id, 'app');
      this.appChannels.set(id, channel);
      this.byId.set(id, channel);
    }
    return channel;
  }

  createPrivateChannel(): ChannelImpl {
    const channel = new ChannelImpl(this.createId(), 'private');
    this.byId.set(channel.id, channel);
    return channel;
  }

  addIntentListener(intent: string, handler: IntentHandler, appId?: string): Listener {
    let set = this.intentListeners.get(intent);
    if (!set) {
      set = new Set();
      this.intentListeners.set(intent, set);
    }
    const entry: IntentEntry = { appId, handler };
    set.add(entry);
    return {
      unsubscribe: () => {
        this.intentListeners.get(intent)?.delete(entry);
      },
    };
  }

  raiseIntent(intent: string, context: Context, source: { appId?: string } = {}): IntentResolution {
    const deliveredTo = this.deliverIntent(intent, context, source);
    this.transport?.send({ kind: 'intent', intent, context, source });
    this.notify({ kind: 'intent', intent, context, source, deliveredTo, origin: 'local', timestamp: this.now() });
    return { intent, source, deliveredTo };
  }

  /** Broadcast a context on a channel locally and propagate it over the transport. */
  broadcast(channelId: string, context: Context, source: { appId?: string } = {}): void {
    this.getChannel(channelId)?.broadcast(context);
    this.transport?.send({ kind: 'broadcast', channelId, context, source });
    this.notify({ kind: 'broadcast', channelId, context, source, origin: 'local', timestamp: this.now() });
  }

  /** Stop listening to the transport. */
  dispose(): void {
    this.disposeTransport?.();
  }

  /** Ask peer brokers for the current context of a channel (replay-on-join). */
  requestChannelState(channelId: string): void {
    this.transport?.send({ kind: 'request-state', channelId, requesterId: this.id });
  }

  private deliverIntent(intent: string, context: Context, source: { appId?: string }): number {
    const set = this.intentListeners.get(intent);
    let deliveredTo = 0;
    if (set) {
      for (const entry of set) {
        entry.handler(context, { source });
        deliveredTo += 1;
      }
    }
    return deliveredTo;
  }

  /** Apply a message received from another broker (no re-propagation, so no loops). */
  private applyRemote(message: InteropMessage): void {
    switch (message.kind) {
      case 'broadcast':
        this.getChannel(message.channelId)?.broadcast(message.context);
        this.notify({
          kind: 'broadcast',
          channelId: message.channelId,
          context: message.context,
          source: message.source,
          origin: 'remote',
          timestamp: this.now(),
        });
        break;
      case 'intent': {
        const deliveredTo = this.deliverIntent(message.intent, message.context, message.source ?? {});
        this.notify({
          kind: 'intent',
          intent: message.intent,
          context: message.context,
          source: message.source,
          deliveredTo,
          origin: 'remote',
          timestamp: this.now(),
        });
        break;
      }
      case 'request-state': {
        if (message.requesterId === this.id) break;
        const context = this.getChannel(message.channelId)?.getCurrentContext();
        if (context) {
          this.transport?.send({
            kind: 'state',
            channelId: message.channelId,
            context,
            requesterId: message.requesterId,
          });
        }
        break;
      }
      case 'state':
        // Only the requester applies the replayed context.
        if (message.requesterId === this.id) {
          this.getChannel(message.channelId)?.broadcast(message.context);
        }
        break;
    }
  }
}
