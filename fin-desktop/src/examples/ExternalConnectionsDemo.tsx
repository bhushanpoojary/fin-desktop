/**
 * ExternalConnectionsDemo — simulates a remote (non-Electron) client connecting to the platform
 * gateway over an in-memory duplex pair (standing in for a WebSocket / named pipe). Shows the
 * hello handshake, cross-boundary pub/sub, and channel RPC from the "remote" client to an
 * in-process provider. Route: ?test=external.
 */

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { InterAppBus, ChannelBus, ExternalGateway, ExternalClient, createDuplexPair } from '../messaging';
import type { AppIdentity } from '../messaging';
import './ExternalConnectionsDemo.css';

const INTERNAL: AppIdentity = { uuid: 'internal', name: 'In-process app' };

export const ExternalConnectionsDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  const platform = useMemo(() => {
    const bus = new InterAppBus();
    const channels = new ChannelBus();
    const gateway = new ExternalGateway(bus, channels, { authenticate: ({ token }) => token === 'let-me-in' });
    const provider = channels.createProvider('market-data');
    let tick = 0;
    provider.register<{ ticker: string }, { ticker: string; price: number }>('quote', ({ ticker }) => {
      tick += 1;
      // Deterministic pseudo-price so the handler stays pure.
      const base = [...ticker].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      return { ticker, price: Math.round((base + tick * 1.5) * 100) / 100 };
    });
    return { bus, channels, gateway };
  }, []);

  const clientRef = useRef<ExternalClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState('let-me-in');
  const [error, setError] = useState<string | null>(null);
  const [remoteLog, setRemoteLog] = useState<string[]>([]);
  const [internalLog, setInternalLog] = useState<string[]>([]);
  const [rpc, setRpc] = useState<string>('');

  // In-process subscriber for the "orders" topic coming from the remote client.
  useEffect(() => {
    const sub = platform.bus.subscribe(INTERNAL, undefined, 'orders', (msg, from) => {
      setInternalLog((l) => [`${from.name}: ${JSON.stringify(msg)}`, ...l].slice(0, 6));
    });
    return () => sub.unsubscribe();
  }, [platform]);

  const pushRemote = (line: string) => setRemoteLog((l) => [line, ...l].slice(0, 6));

  const connect = async () => {
    setError(null);
    const [serverSide, clientSide] = createDuplexPair();
    platform.gateway.accept(serverSide);
    const client = new ExternalClient(clientSide);
    try {
      await client.connect({ uuid: 'bot', name: 'Python Bot' }, token);
      client.subscribe('quotes', (msg, from) => pushRemote(`${from.name} ▸ quotes: ${JSON.stringify(msg)}`));
      clientRef.current = client;
      setConnected(true);
      forceRender();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const disconnect = () => {
    clientRef.current?.disconnect();
    clientRef.current = null;
    setConnected(false);
    forceRender();
  };

  const remotePublishOrder = () => clientRef.current?.publish('orders', { side: 'BUY', qty: 100, ticker: 'AAPL' });
  const internalBroadcastQuote = () => platform.bus.publish('quotes', { ticker: 'AAPL', px: 192.4 }, INTERNAL);
  const remoteRpc = async () => {
    const result = await clientRef.current?.dispatch<{ ticker: string }, { ticker: string; price: number }>('market-data', 'quote', { ticker: 'AAPL' });
    if (result) setRpc(`quote(AAPL) → $${result.price}`);
  };

  return (
    <div className="ext">
      <header className="ext-head">
        <h1>External Connections</h1>
        <p>A remote client (Node/Python/.NET) bridged into the platform bus over a duplex transport.</p>
      </header>

      <div className="ext-grid">
        <section className="ext-panel">
          <h2>
            Remote client <span className={`ext-dot ${connected ? 'on' : ''}`} />
          </h2>
          {!connected ? (
            <>
              <label className="ext-field">
                Token
                <input value={token} onChange={(e) => setToken(e.target.value)} />
              </label>
              <button className="ext-btn primary" onClick={connect}>
                connect()
              </button>
              {error && <div className="ext-error">{error}</div>}
              <p className="ext-hint">Try an incorrect token to see the gateway reject the handshake.</p>
            </>
          ) : (
            <>
              <div className="ext-actions">
                <button className="ext-btn" onClick={remotePublishOrder}>
                  publish("orders")
                </button>
                <button className="ext-btn" onClick={remoteRpc}>
                  dispatch("market-data","quote")
                </button>
                <button className="ext-btn ghost" onClick={disconnect}>
                  disconnect()
                </button>
              </div>
              <div className="ext-result">{rpc || 'RPC results appear here.'}</div>
              <h3>Received (subscribed to "quotes")</h3>
              <ul className="ext-log">
                {remoteLog.length === 0 ? <li className="muted">—</li> : remoteLog.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </>
          )}
        </section>

        <section className="ext-panel">
          <h2>In-process platform</h2>
          <div className="ext-actions">
            <button className="ext-btn" onClick={internalBroadcastQuote} disabled={!connected}>
              publish("quotes") → remote
            </button>
          </div>
          <div className="ext-meta">Gateway connections: {platform.gateway.getConnectionCount()}</div>
          <h3>Received (subscribed to "orders")</h3>
          <ul className="ext-log">
            {internalLog.length === 0 ? <li className="muted">—</li> : internalLog.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ExternalConnectionsDemo;
