/**
 * Channels API — request/response RPC between apps (OpenFin `Channel` parity).
 *
 * A provider creates a named channel and registers action handlers; clients connect and `dispatch`
 * actions to it (client → provider RPC). The provider can also `dispatch` to a specific client or
 * `publish` to all connected clients (provider → client RPC). In-process and fully async; a real
 * transport adapter can carry the same calls across windows/processes.
 */

export interface ChannelIdentity {
  uuid: string;
  name?: string;
}

export type ChannelAction<P = unknown, R = unknown> = (payload: P, sender: ChannelIdentity) => R | Promise<R>;

interface ClientRecord {
  identity: ChannelIdentity;
  actions: Map<string, ChannelAction>;
}

export class ChannelProvider {
  readonly channelName: string;
  readonly identity: ChannelIdentity;
  private readonly actions = new Map<string, ChannelAction>();
  private readonly clients = new Map<string, ClientRecord>();
  private readonly onConnect: Array<(client: ChannelIdentity) => void> = [];
  private readonly onDisconnect: Array<(client: ChannelIdentity) => void> = [];

  constructor(channelName: string) {
    this.channelName = channelName;
    this.identity = { uuid: `provider:${channelName}`, name: channelName };
  }

  /** Register a handler invoked when a client dispatches `action`. */
  register<P = unknown, R = unknown>(action: string, handler: ChannelAction<P, R>): this {
    this.actions.set(action, handler as ChannelAction);
    return this;
  }

  onConnection(handler: (client: ChannelIdentity) => void): void {
    this.onConnect.push(handler);
  }

  onDisconnection(handler: (client: ChannelIdentity) => void): void {
    this.onDisconnect.push(handler);
  }

  getConnections(): ChannelIdentity[] {
    return [...this.clients.values()].map((c) => c.identity);
  }

  /** Provider → one client RPC. */
  async dispatch<P = unknown, R = unknown>(target: ChannelIdentity, action: string, payload: P): Promise<R> {
    const record = this.clients.get(target.uuid);
    if (!record) throw new Error(`channel "${this.channelName}": no client ${target.uuid}`);
    const handler = record.actions.get(action);
    if (!handler) throw new Error(`client ${target.uuid} has no action "${action}"`);
    return (await handler(payload, this.identity)) as R;
  }

  /** Provider → all clients that registered `action`. Returns each result. */
  async publish<P = unknown, R = unknown>(action: string, payload: P): Promise<R[]> {
    const results: R[] = [];
    for (const record of this.clients.values()) {
      const handler = record.actions.get(action);
      if (handler) results.push((await handler(payload, this.identity)) as R);
    }
    return results;
  }

  // --- internal wiring used by ChannelBus / ChannelClient ---

  _invoke(action: string, payload: unknown, sender: ChannelIdentity): Promise<unknown> {
    const handler = this.actions.get(action);
    if (!handler) throw new Error(`channel "${this.channelName}": no action "${action}"`);
    return Promise.resolve(handler(payload, sender));
  }

  _addClient(identity: ChannelIdentity): ClientRecord {
    const record: ClientRecord = { identity, actions: new Map() };
    this.clients.set(identity.uuid, record);
    this.onConnect.forEach((h) => h(identity));
    return record;
  }

  _removeClient(uuid: string): void {
    const record = this.clients.get(uuid);
    if (!record) return;
    this.clients.delete(uuid);
    this.onDisconnect.forEach((h) => h(record.identity));
  }
}

export class ChannelClient {
  readonly identity: ChannelIdentity;
  private readonly provider: ChannelProvider;
  private readonly record: ClientRecord;
  private connected = true;

  constructor(provider: ChannelProvider, record: ClientRecord) {
    this.provider = provider;
    this.record = record;
    this.identity = record.identity;
  }

  /** Register a handler invoked when the provider dispatches/publishes `action` to this client. */
  register<P = unknown, R = unknown>(action: string, handler: ChannelAction<P, R>): this {
    this.record.actions.set(action, handler as ChannelAction);
    return this;
  }

  /** Client → provider RPC. */
  async dispatch<P = unknown, R = unknown>(action: string, payload: P): Promise<R> {
    if (!this.connected) throw new Error('channel client is disconnected');
    return (await this.provider._invoke(action, payload, this.identity)) as R;
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect(): void {
    if (!this.connected) return;
    this.connected = false;
    this.provider._removeClient(this.identity.uuid);
  }
}

export class ChannelBus {
  private readonly providers = new Map<string, ChannelProvider>();

  /** Create a provider for `channelName`. Throws if one already exists. */
  createProvider(channelName: string): ChannelProvider {
    if (this.providers.has(channelName)) {
      throw new Error(`channel "${channelName}" already has a provider`);
    }
    const provider = new ChannelProvider(channelName);
    this.providers.set(channelName, provider);
    return provider;
  }

  hasProvider(channelName: string): boolean {
    return this.providers.has(channelName);
  }

  /** Connect a client to an existing channel. Rejects if no provider exists. */
  async connect(channelName: string, identity: ChannelIdentity): Promise<ChannelClient> {
    const provider = this.providers.get(channelName);
    if (!provider) throw new Error(`no provider for channel "${channelName}"`);
    const record = provider._addClient(identity);
    return new ChannelClient(provider, record);
  }

  destroyProvider(channelName: string): void {
    this.providers.delete(channelName);
  }
}
