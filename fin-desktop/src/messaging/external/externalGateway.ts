/**
 * External gateway — bridges remote (non-Electron) clients into the in-process InterAppBus and
 * ChannelBus over a `DuplexConnection`.
 *
 * Each accepted connection must `hello` (optionally authenticated) before it can publish/subscribe/
 * send on the bus or `dispatch` RPC to a channel provider. Bus deliveries addressed to the client's
 * identity are forwarded back down the wire. Disconnecting cleans up all subscriptions and channel
 * clients.
 */

import type { InterAppBus, BusSubscription } from '../interAppBus';
import type { ChannelBus, ChannelClient } from '../channels';
import { decodeWire, encodeWire } from './duplex';
import type { ClientWireMessage, DuplexConnection, WireIdentity } from './duplex';

export interface GatewayOptions {
  /** Return false to reject a connection's `hello`. Omit to accept all. */
  authenticate?: (hello: { id: WireIdentity; token?: string }) => boolean;
}

export class ExternalGateway {
  private readonly bus: InterAppBus;
  private readonly channels: ChannelBus;
  private readonly options: GatewayOptions;
  private connectionCount = 0;

  constructor(bus: InterAppBus, channels: ChannelBus, options: GatewayOptions = {}) {
    this.bus = bus;
    this.channels = channels;
    this.options = options;
  }

  getConnectionCount(): number {
    return this.connectionCount;
  }

  /** Begin serving a newly-accepted connection. */
  accept(conn: DuplexConnection): void {
    let identity: WireIdentity | null = null;
    const subs: BusSubscription[] = [];
    const channelClients = new Map<string, ChannelClient>();
    let counted = false;

    const cleanup = (): void => {
      if (identity) this.bus.unsubscribeAll(identity);
      subs.forEach((s) => s.unsubscribe());
      channelClients.forEach((c) => c.disconnect());
      channelClients.clear();
      if (counted) {
        this.connectionCount -= 1;
        counted = false;
      }
      offMessage();
      offClose();
    };

    const handleDispatch = async (msg: Extract<ClientWireMessage, { t: 'dispatch' }>, id: WireIdentity): Promise<void> => {
      try {
        let client = channelClients.get(msg.channel);
        if (!client) {
          if (!this.channels.hasProvider(msg.channel)) throw new Error(`no provider for channel "${msg.channel}"`);
          client = await this.channels.connect(msg.channel, id);
          channelClients.set(msg.channel, client);
        }
        const value = await client.dispatch(msg.action, msg.payload);
        conn.send(encodeWire({ t: 'result', rid: msg.rid, ok: true, value }));
      } catch (error) {
        conn.send(encodeWire({ t: 'result', rid: msg.rid, ok: false, error: (error as Error).message }));
      }
    };

    const offMessage = conn.onMessage((data) => {
      const msg = decodeWire(data);
      if (!msg) return;

      if (msg.t === 'hello') {
        if (identity) return;
        if (this.options.authenticate && !this.options.authenticate({ id: msg.id, token: msg.token })) {
          conn.send(encodeWire({ t: 'denied', reason: 'authentication failed' }));
          conn.close();
          return;
        }
        identity = msg.id;
        this.connectionCount += 1;
        counted = true;
        conn.send(encodeWire({ t: 'welcome', id: identity }));
        return;
      }

      if (!identity) return; // must say hello first

      switch (msg.t) {
        case 'subscribe': {
          const source = msg.sourceUuid ? { uuid: msg.sourceUuid } : undefined;
          subs.push(
            this.bus.subscribe(identity, source, msg.topic, (message, sender, topic) => {
              conn.send(encodeWire({ t: 'message', topic, message, sender }));
            }),
          );
          break;
        }
        case 'publish':
          this.bus.publish(msg.topic, msg.message, identity);
          break;
        case 'send':
          this.bus.send({ uuid: msg.targetUuid }, msg.topic, msg.message, identity);
          break;
        case 'dispatch':
          void handleDispatch(msg, identity);
          break;
        case 'bye':
          cleanup();
          conn.close();
          break;
      }
    });

    const offClose = conn.onClose(cleanup);
  }
}
