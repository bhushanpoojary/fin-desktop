/**
 * Duplex connection boundary + wire protocol for external (non-Electron) clients.
 *
 * `DuplexConnection` is the injectable transport seam a real WebSocket or named pipe implements;
 * `createDuplexPair()` provides an in-memory pair for tests and single-process demos. The wire is a
 * small, validated JSON message union so Node / Python / .NET / Java clients can speak the same
 * protocol.
 */

/** A bidirectional string channel (WebSocket / named pipe / in-memory pair). */
export interface DuplexConnection {
  send(data: string): void;
  onMessage(handler: (data: string) => void): () => void;
  onClose(handler: () => void): () => void;
  close(): void;
}

/** Two linked in-memory connections: data sent on one arrives at the other. */
export function createDuplexPair(): [DuplexConnection, DuplexConnection] {
  const aMsg = new Set<(d: string) => void>();
  const bMsg = new Set<(d: string) => void>();
  const aClose = new Set<() => void>();
  const bClose = new Set<() => void>();
  let open = true;

  function closeAll(): void {
    if (!open) return;
    open = false;
    aClose.forEach((h) => h());
    bClose.forEach((h) => h());
  }

  const a: DuplexConnection = {
    send: (data) => {
      if (open) bMsg.forEach((h) => h(data));
    },
    onMessage: (handler) => {
      aMsg.add(handler);
      return () => aMsg.delete(handler);
    },
    onClose: (handler) => {
      aClose.add(handler);
      return () => aClose.delete(handler);
    },
    close: closeAll,
  };
  const b: DuplexConnection = {
    send: (data) => {
      if (open) aMsg.forEach((h) => h(data));
    },
    onMessage: (handler) => {
      bMsg.add(handler);
      return () => bMsg.delete(handler);
    },
    onClose: (handler) => {
      bClose.add(handler);
      return () => bClose.delete(handler);
    },
    close: closeAll,
  };
  return [a, b];
}

export interface WireIdentity {
  uuid: string;
  name?: string;
}

/** Client → gateway. */
export type ClientWireMessage =
  | { t: 'hello'; id: WireIdentity; token?: string }
  | { t: 'subscribe'; topic: string; sourceUuid?: string }
  | { t: 'publish'; topic: string; message: unknown }
  | { t: 'send'; targetUuid: string; topic: string; message: unknown }
  | { t: 'dispatch'; rid: number; channel: string; action: string; payload: unknown }
  | { t: 'bye' };

/** Gateway → client. */
export type ServerWireMessage =
  | { t: 'welcome'; id: WireIdentity }
  | { t: 'denied'; reason: string }
  | { t: 'message'; topic: string; message: unknown; sender: WireIdentity }
  | { t: 'result'; rid: number; ok: true; value: unknown }
  | { t: 'result'; rid: number; ok: false; error: string };

export type WireMessage = ClientWireMessage | ServerWireMessage;

export function encodeWire(message: WireMessage): string {
  return JSON.stringify(message);
}

/** Parse + minimally validate a wire frame. Returns `null` for malformed input. */
export function decodeWire(data: string): WireMessage | null {
  try {
    const value = JSON.parse(data);
    if (value && typeof value === 'object' && typeof (value as { t: unknown }).t === 'string') {
      return value as WireMessage;
    }
    return null;
  } catch {
    return null;
  }
}
