/**
 * MessagingDemo — two side-by-side panels exercising the Inter-Application Bus (pub/sub + direct
 * send) and the Channels API (provider/client RPC). Left: three "apps" publish/subscribe on topics
 * and send direct messages. Right: a calculator channel where a client dispatches RPC to a provider
 * and the provider pushes results back. Route: ?test=messaging.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InterAppBus, ChannelBus } from '../messaging';
import type { AppIdentity, ChannelClient, ChannelProvider } from '../messaging';
import './MessagingDemo.css';

const APPS: AppIdentity[] = [
  { uuid: 'a', name: 'Chart' },
  { uuid: 'b', name: 'Blotter' },
  { uuid: 'c', name: 'News' },
];

interface LogLine {
  from: string;
  text: string;
}

const IabPanel: React.FC = () => {
  const bus = useMemo(() => new InterAppBus(), []);
  const [logs, setLogs] = useState<Record<string, LogLine[]>>({ a: [], b: [], c: [] });
  const [topic, setTopic] = useState('quotes');
  const [sender, setSender] = useState('a');
  const [target, setTarget] = useState('b');

  // Each app subscribes to the current topic; re-subscribe when the topic changes.
  useEffect(() => {
    const subs = APPS.map((app) =>
      bus.subscribe(app, undefined, topic, (msg, from, t) => {
        setLogs((prev) => ({
          ...prev,
          [app.uuid]: [{ from: `${from.name} ▸ ${t}`, text: String(msg) }, ...prev[app.uuid]].slice(0, 6),
        }));
      }),
    );
    return () => subs.forEach((s) => s.unsubscribe());
  }, [bus, topic]);

  const senderApp = APPS.find((a) => a.uuid === sender)!;
  const targetApp = APPS.find((a) => a.uuid === target)!;

  return (
    <section className="msg-panel">
      <h2>Inter-App Bus</h2>
      <div className="msg-row">
        <label>
          Topic
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </label>
        <label>
          From
          <select value={sender} onChange={(e) => setSender(e.target.value)}>
            {APPS.map((a) => (
              <option key={a.uuid} value={a.uuid}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="msg-row">
        <button className="msg-btn primary" onClick={() => bus.publish(topic, `broadcast @ ${new Date().toLocaleTimeString()}`, senderApp)}>
          Publish to all
        </button>
        <label>
          Direct to
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {APPS.map((a) => (
              <option key={a.uuid} value={a.uuid}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <button className="msg-btn" onClick={() => bus.send(targetApp, topic, `DM from ${senderApp.name}`, senderApp)}>
          Send
        </button>
      </div>
      <div className="msg-apps">
        {APPS.map((app) => (
          <div key={app.uuid} className="msg-app">
            <div className="msg-app-name">{app.name}</div>
            <ul className="msg-log">
              {logs[app.uuid].length === 0 ? (
                <li className="muted">—</li>
              ) : (
                logs[app.uuid].map((l, i) => (
                  <li key={i}>
                    <span className="msg-log-from">{l.from}</span>
                    {l.text}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const ChannelsPanel: React.FC = () => {
  const bus = useMemo(() => new ChannelBus(), []);
  const providerRef = useRef<ChannelProvider | null>(null);
  const clientRef = useRef<ChannelClient | null>(null);
  const [a, setA] = useState(6);
  const [b, setB] = useState(7);
  const [result, setResult] = useState<string>('');
  const [pushed, setPushed] = useState<string>('');

  useEffect(() => {
    const provider = bus.createProvider('calc');
    provider.register<{ a: number; b: number }, number>('add', ({ a, b }) => a + b);
    provider.register<{ a: number; b: number }, number>('multiply', ({ a, b }) => a * b);
    providerRef.current = provider;

    let active = true;
    void bus.connect('calc', { uuid: 'ui', name: 'UI Client' }).then((client) => {
      if (!active) return;
      client.register('notify', (text: string) => {
        setPushed(String(text));
        return 'ack';
      });
      clientRef.current = client;
    });
    return () => {
      active = false;
      clientRef.current?.disconnect();
      bus.destroyProvider('calc');
    };
  }, [bus]);

  const run = async (action: 'add' | 'multiply') => {
    const client = clientRef.current;
    if (!client) return;
    const value = await client.dispatch<{ a: number; b: number }, number>(action, { a, b });
    setResult(`${action}(${a}, ${b}) = ${value}`);
  };

  const pushFromProvider = async () => {
    await providerRef.current?.publish('notify', `provider push @ ${new Date().toLocaleTimeString()}`);
  };

  return (
    <section className="msg-panel">
      <h2>Channels (RPC)</h2>
      <div className="msg-row">
        <label>
          a
          <input type="number" value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label>
          b
          <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} />
        </label>
      </div>
      <div className="msg-row">
        <button className="msg-btn primary" onClick={() => run('add')}>
          client.dispatch("add")
        </button>
        <button className="msg-btn primary" onClick={() => run('multiply')}>
          client.dispatch("multiply")
        </button>
      </div>
      <div className="msg-result">{result || 'Dispatch an action to call the provider.'}</div>

      <div className="msg-row" style={{ marginTop: 18 }}>
        <button className="msg-btn" onClick={pushFromProvider}>
          provider.publish("notify")
        </button>
      </div>
      <div className="msg-result">{pushed ? `Client received: ${pushed}` : 'Provider → client push appears here.'}</div>
    </section>
  );
};

export const MessagingDemo: React.FC = () => (
  <div className="msg">
    <header className="msg-head">
      <h1>Messaging &amp; Integration</h1>
      <p>Inter-Application Bus (pub/sub + direct send) and Channels (provider/client RPC).</p>
    </header>
    <div className="msg-grid">
      <IabPanel />
      <ChannelsPanel />
    </div>
  </div>
);

export default MessagingDemo;
