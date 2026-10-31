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
  AppIdentifier,
  Channel,
  DisplayMetadata,
  IntentHandler,
  IntentResolution,
  IntentResult,
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
  /** Launches an app and returns its instanceId (FDC3 `open`). */
  launcher?: (appId: string, context?: Context) => string;
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
  private instanceSeq = 0;
  private readonly instances = new Map<string, Set<string>>();
  private readonly openContexts = new Map<string, Context>();
  private readonly launcher?: (appId: string, context?: Context) => string;

  constructor(options: InteropBrokerOptions = {}) {
    this.directory = options.directory ?? new AppDirectory();
    this.createId = options.createId ?? (() => `private-${++this.privateSeq}`);
    this.now = options.now ?? Date.now;
    this.launcher = options.launcher;
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

  /** Register a running instance of an app (used for `findInstances`). */
  registerInstance(appId: string, instanceId: string): void {
    let set = this.instances.get(appId);
    if (!set) {
      set = new Set();
      this.instances.set(appId, set);
    }
    set.add(instanceId);
  }

  /** FDC3 2.0 `findInstances` — running instances of an app. */
  findInstances(appId: string): AppIdentifier[] {
    return [...(this.instances.get(appId) ?? [])].map((instanceId) => ({ appId, instanceId }));
  }

  /** FDC3 2.0 `open` — launch an app (via the injected launcher), optionally with a context. */
  open(appId: string, context?: Context): AppIdentifier {
    if (!this.directory.getApp(appId)) throw new Error(`No app '${appId}' in the directory`);
    if (!this.launcher) throw new Error('no launcher configured for fdc3.open');
    const instanceId = this.launcher(appId, context);
    this.registerInstance(appId, instanceId);
    if (context) this.openContexts.set(instanceId, context);
    return { appId, instanceId };
  }

  /** A freshly-opened app retrieves the context it was launched with (one-shot). */
  consumeOpenContext(instanceId: string): Context | undefined {
    const context = this.openContexts.get(instanceId);
    this.openContexts.delete(instanceId);
    return context;
  }

  nextInstanceId(): string {
    return `inst-${++this.instanceSeq}`;
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

  raiseIntent(intent: string, context: Context, source: { appId?: string } = {}, target?: AppIdentifier): IntentResolution {
    const { deliveredTo, result } = this.deliverIntent(intent, context, source, target);
    this.transport?.send({ kind: 'intent', intent, context, source });
    this.notify({ kind: 'intent', intent, context, source, deliveredTo, origin: 'local', timestamp: this.now() });
    return { intent, source: target ?? source, deliveredTo, getResult: () => result };
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

  private deliverIntent(intent: string, context: Context, source: { appId?: string }, target?: AppIdentifier): { deliveredTo: number; result: Promise<IntentResult> } {
    const set = this.intentListeners.get(intent);
    let deliveredTo = 0;
    // The result is taken from the first (resolved) handler, per FDC3's single-target model.
    let result: Promise<IntentResult> = Promise.resolve(undefined);
    if (set) {
      for (const entry of set) {
        if (target?.appId && entry.appId !== target.appId) continue; // targeted delivery
        const handlerResult = entry.handler(context, { source });
        if (deliveredTo === 0) result = Promise.resolve(handlerResult);
        deliveredTo += 1;
      }
    }
    return { deliveredTo, result };
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
        const { deliveredTo } = this.deliverIntent(message.intent, message.context, message.source ?? {});
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
