/**
 * FDC3 2.0 DesktopAgent (in-process).
 *
 * A per-entity facade over a shared InteropBroker implementing the core FDC3 DesktopAgent
 * API: user-channel membership, context broadcast/listen, intents, and discovery. Multiple
 * agents sharing one broker interop exactly like separate FDC3 apps.
 */

import type { InteropBroker } from './broker';
import type { ChannelImpl } from './channel';
import type { Context } from './context';
import type { ResolvedAppIntent } from './appDirectory';
import type {
  AppIdentifier,
  AppMetadata,
  Channel,
  ContextHandler,
  ImplementationMetadata,
  IntentHandler,
  IntentResolution,
  Listener,
} from './types';

interface ContextEntry {
  type: string | null;
  handler: ContextHandler;
  sub: Listener | null;
}

export class DesktopAgent {
  private current: ChannelImpl | null = null;
  private readonly entries = new Set<ContextEntry>();
  private readonly broker: InteropBroker;
  private readonly source: { appId?: string };
  private readonly instanceId: string;

  constructor(broker: InteropBroker, source: { appId?: string } = {}) {
    this.broker = broker;
    this.source = source;
    this.instanceId = broker.nextInstanceId();
    if (source.appId) broker.registerInstance(source.appId, this.instanceId);
  }

  getInstanceId(): string {
    return this.instanceId;
  }

  // ---- User channels ----

  getUserChannels(): Channel[] {
    return this.broker.getUserChannels();
  }

  joinUserChannel(channelId: string): void {
    const channel = this.broker.getChannel(channelId);
    if (!channel || channel.type !== 'user') {
      throw new Error(`No user channel '${channelId}'`);
    }
    this.setCurrent(channel);
  }

  getCurrentChannel(): Channel | null {
    return this.current;
  }

  leaveCurrentChannel(): void {
    this.setCurrent(null);
  }

  // ---- App / private channels ----

  getOrCreateChannel(channelId: string): Channel {
    return this.broker.getOrCreateChannel(channelId);
  }

  createPrivateChannel(): Channel {
    return this.broker.createPrivateChannel();
  }

  // ---- Context ----

  broadcast(context: Context): void {
    if (this.current) this.broker.broadcast(this.current.id, context, this.source);
  }

  addContextListener(contextType: string | null, handler: ContextHandler): Listener {
    const entry: ContextEntry = { type: contextType, handler, sub: null };
    if (this.current) entry.sub = this.current.addContextListener(contextType, handler);
    this.entries.add(entry);
    return {
      unsubscribe: () => {
        entry.sub?.unsubscribe();
        this.entries.delete(entry);
      },
    };
  }

  // ---- Intents ----

  addIntentListener(intent: string, handler: IntentHandler): Listener {
    return this.broker.addIntentListener(intent, handler, this.source.appId);
  }

  raiseIntent(intent: string, context: Context, target?: AppIdentifier): IntentResolution {
    return this.broker.raiseIntent(intent, context, this.source, target);
  }

  raiseIntentForContext(context: Context): IntentResolution {
    const [first] = this.broker.getDirectory().findIntentsByContext(context.type);
    if (!first) throw new Error(`No intent found for context '${context.type}'`);
    return this.raiseIntent(first.intent.name, context);
  }

  findIntent(intent: string, context?: Context): ResolvedAppIntent {
    return this.broker.getDirectory().findIntent(intent, context?.type);
  }

  findIntentsByContext(context: Context): ResolvedAppIntent[] {
    return this.broker.getDirectory().findIntentsByContext(context.type);
  }

  /** FDC3 2.0 `getAppMetadata` — public metadata for an app from the directory. */
  getAppMetadata(appId: string): AppMetadata {
    const metadata = this.broker.getDirectory().getAppMetadata(appId);
    if (!metadata) throw new Error(`No app '${appId}' in the directory`);
    return metadata;
  }

  /** FDC3 2.0 `open` — launch an app, optionally delivering a context on startup. */
  open(appId: string, context?: Context): AppIdentifier {
    return this.broker.open(appId, context);
  }

  /** FDC3 2.0 `findInstances` — running instances of an app. */
  findInstances(appId: string): AppIdentifier[] {
    return this.broker.findInstances(appId);
  }

  getInfo(): ImplementationMetadata {
    return {
      fdc3Version: '2.0',
      provider: 'FinDesktop',
      providerVersion: '0.1.0',
      optionalFeatures: {
        OriginatingAppMetadata: true,
        UserChannelMembershipAPIs: true,
      },
    };
  }

  /** Observe every broadcast/intent flowing through this window's broker (inspector). */
  observe(observer: Parameters<InteropBroker['observe']>[0]): () => void {
    return this.broker.observe(observer);
  }

  /** Move context listeners from the old channel to the new one (replaying cached context). */
  private setCurrent(channel: ChannelImpl | null): void {
    for (const entry of this.entries) {
      entry.sub?.unsubscribe();
      entry.sub = channel ? channel.addContextListener(entry.type, entry.handler) : null;
    }
    this.current = channel;
    // Pull the channel's current context from peer windows (replay-on-join).
    if (channel) this.broker.requestChannelState(channel.id);
  }
}
