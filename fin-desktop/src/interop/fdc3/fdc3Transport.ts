/**
 * FDC3 interop transport.
 *
 * Abstracts how interop messages (channel broadcasts + raised intents) travel between
 * brokers in different windows/processes. Keeping it behind an interface makes cross-window
 * FDC3 unit-testable (memory transport) and lets the Electron bus plug in unchanged.
 */

import type { Context } from './context';

export type InteropMessage =
  | { kind: 'broadcast'; channelId: string; context: Context; source?: { appId?: string } }
  | { kind: 'intent'; intent: string; context: Context; source?: { appId?: string } }
  // State sync so a window joining a channel receives its current context (replay-on-join).
  | { kind: 'request-state'; channelId: string; requesterId: string }
  | { kind: 'state'; channelId: string; context: Context; requesterId: string };

export interface Transport {
  send(message: InteropMessage): void;
  subscribe(handler: (message: InteropMessage) => void): () => void;
}

type Handler = (message: InteropMessage) => void;

/**
 * Two connected in-memory transports: a message sent on one is delivered to the other's
 * subscribers (never echoed back to the sender). For tests and single-process demos.
 */
export function createMemoryTransportPair(): [Transport, Transport] {
  const aHandlers = new Set<Handler>();
  const bHandlers = new Set<Handler>();

  const a: Transport = {
    send: (message) => bHandlers.forEach((h) => h(message)),
    subscribe: (handler) => {
      aHandlers.add(handler);
      return () => aHandlers.delete(handler);
    },
  };
  const b: Transport = {
    send: (message) => aHandlers.forEach((h) => h(message)),
    subscribe: (handler) => {
      bHandlers.add(handler);
      return () => bHandlers.delete(handler);
    },
  };
  return [a, b];
}

/** A publish/subscribe bus (e.g. the Electron preload bus) that excludes the sender. */
export interface PubSubBus {
  publish(topic: string, payload: unknown): void;
  subscribe(topic: string, handler: (payload: unknown) => void): () => void;
}

/** Adapt a pub/sub bus into a Transport (the bus must not echo to the sender). */
export function createBusTransport(bus: PubSubBus, topic = 'fdc3:interop'): Transport {
  return {
    send: (message) => bus.publish(topic, message),
    subscribe: (handler) => bus.subscribe(topic, (payload) => handler(payload as InteropMessage)),
  };
}
