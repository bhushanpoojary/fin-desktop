/**
 * External client adapter — the remote (non-Electron) side of the gateway protocol.
 *
 * Wraps a `DuplexConnection` and exposes a local-feeling API (publish / subscribe / send + channel
 * `dispatch`) that mirrors the in-process IAB/Channels. `connect()` performs the `hello`/`welcome`
 * handshake; RPC `dispatch` correlates replies by request id.
 */

import { decodeWire, encodeWire } from './duplex';
import type { DuplexConnection, WireIdentity } from './duplex';

export type ExternalMessageHandler<T = unknown> = (message: T, sender: WireIdentity, topic: string) => void;

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

export class ExternalClient {
  private readonly conn: DuplexConnection;
  private readonly topicHandlers = new Map<string, Set<ExternalMessageHandler>>();
  private readonly pending = new Map<number, Pending>();
  private readonly offMessage: () => void;
  private identity: WireIdentity | null = null;
  private rid = 0;
  private connecting: { resolve: () => void; reject: (e: Error) => void } | null = null;

  constructor(conn: DuplexConnection) {
    this.conn = conn;
    this.offMessage = conn.onMessage((data) => this.receive(data));
  }

  private receive(data: string): void {
    const msg = decodeWire(data);
    if (!msg) return;
    switch (msg.t) {
      case 'welcome':
        this.identity = msg.id;
        this.connecting?.resolve();
        this.connecting = null;
        break;
      case 'denied':
        this.connecting?.reject(new Error(msg.reason));
        this.connecting = null;
        break;
      case 'message': {
        const handlers = this.topicHandlers.get(msg.topic);
        handlers?.forEach((h) => h(msg.message, msg.sender, msg.topic));
        break;
      }
      case 'result': {
        const pending = this.pending.get(msg.rid);
        if (!pending) return;
        this.pending.delete(msg.rid);
        if (msg.ok) pending.resolve(msg.value);
        else pending.reject(new Error(msg.error));
        break;
      }
    }
  }

  /** Perform the handshake. Resolves on `welcome`, rejects on `denied`. */
  connect(identity: WireIdentity, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connecting = { resolve, reject };
      this.conn.send(encodeWire({ t: 'hello', id: identity, token }));
    });
  }

  getIdentity(): WireIdentity | null {
    return this.identity;
  }

  publish<T = unknown>(topic: string, message: T): void {
    this.conn.send(encodeWire({ t: 'publish', topic, message }));
  }

  send<T = unknown>(targetUuid: string, topic: string, message: T): void {
    this.conn.send(encodeWire({ t: 'send', targetUuid, topic, message }));
  }

  /** Subscribe to a topic (optionally only from `sourceUuid`). Returns an unsubscribe function. */
  subscribe<T = unknown>(topic: string, handler: ExternalMessageHandler<T>, sourceUuid?: string): () => void {
    let handlers = this.topicHandlers.get(topic);
    if (!handlers) {
      handlers = new Set();
      this.topicHandlers.set(topic, handlers);
      this.conn.send(encodeWire({ t: 'subscribe', topic, sourceUuid }));
    }
    handlers.add(handler as ExternalMessageHandler);
    return () => {
      handlers!.delete(handler as ExternalMessageHandler);
    };
  }

  /** Client → provider RPC over a named channel. */
  dispatch<P = unknown, R = unknown>(channel: string, action: string, payload: P): Promise<R> {
    const rid = ++this.rid;
    return new Promise<R>((resolve, reject) => {
      this.pending.set(rid, { resolve: resolve as (v: unknown) => void, reject });
      this.conn.send(encodeWire({ t: 'dispatch', rid, channel, action, payload }));
    });
  }

  disconnect(): void {
    this.conn.send(encodeWire({ t: 'bye' }));
    this.pending.forEach((p) => p.reject(new Error('disconnected')));
    this.pending.clear();
    this.offMessage();
    this.conn.close();
  }
}
