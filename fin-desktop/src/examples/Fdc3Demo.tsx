/**
 * Fdc3Demo — a visual harness for the standards `window.fdc3` agent.
 *
 * Join a user channel, broadcast instruments, raise intents, and watch received context +
 * intents. Open a second window at `?test=fdc3` to see cross-window propagation over the bus.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  createInstrument,
  createContact,
  Intents,
  ContextTypes,
  type Channel,
  type Context,
} from '../interop/fdc3';
import './Fdc3Demo.css';

interface LogLine {
  at: string;
  text: string;
}

const INSTRUMENTS = ['AAPL', 'MSFT', 'TSLA', 'NVDA'];

function now(): string {
  return new Date().toLocaleTimeString();
}

export const Fdc3Demo: React.FC = () => {
  const fdc3 = typeof window !== 'undefined' ? window.fdc3 : undefined;

  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [contextLog, setContextLog] = useState<LogLine[]>([]);
  const [intentLog, setIntentLog] = useState<LogLine[]>([]);
  const lastInstrument = useRef<Context>(createInstrument('AAPL'));

  const logContext = (text: string) => setContextLog((l) => [{ at: now(), text }, ...l].slice(0, 30));
  const logIntent = (text: string) => setIntentLog((l) => [{ at: now(), text }, ...l].slice(0, 30));

  useEffect(() => {
    if (!fdc3) return;
    setChannels(fdc3.getUserChannels());

    const ctxListener = fdc3.addContextListener(null, (ctx) => {
      logContext(`${ctx.type} · ${ctx.name ?? JSON.stringify(ctx.id ?? {})}`);
    });

    const intentSubs = [Intents.ViewChart, Intents.ViewNews, Intents.ViewContact].map((intent) =>
      fdc3.addIntentListener(intent, (ctx, meta) => {
        logIntent(`${intent} ← ${ctx.name ?? ctx.type} (from ${meta?.source?.appId ?? 'unknown'})`);
      }),
    );

    return () => {
      ctxListener.unsubscribe();
      intentSubs.forEach((s) => s.unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fdc3]);

  if (!fdc3) {
    return (
      <div className="fd">
        <div className="fd-empty">
          <code>window.fdc3</code> is not available. Run the app with <code>npm run dev</code>.
        </div>
      </div>
    );
  }

  const join = (id: string) => {
    fdc3.joinUserChannel(id);
    setCurrentChannel(id);
    logContext(`joined channel '${id}'`);
  };

  const broadcastInstrument = (ticker: string) => {
    const instrument = createInstrument(ticker);
    lastInstrument.current = instrument;
    fdc3.broadcast(instrument);
    logContext(`broadcast ${ticker}`);
  };

  const raise = (intent: string, context: Context) => {
    const res = fdc3.raiseIntent(intent, context);
    logIntent(`raised ${intent} → deliveredTo ${res.deliveredTo}`);
  };

  const info = fdc3.getInfo();

  return (
    <div className="fd">
      <header className="fd-top">
        <div className="fd-brand">
          <span className="fd-dot" /> window.fdc3
        </div>
        <span className="fd-badge">FDC3 {info.fdc3Version} · {info.provider}</span>
        <p className="fd-hint">Open a second window at <code>?test=fdc3</code> to see cross-window flow.</p>
      </header>

      <div className="fd-body">
        <section className="fd-panel">
          <h3>User channels</h3>
          <div className="fd-channels">
            {channels.map((ch) => (
              <button
                key={ch.id}
                className={`fd-channel ${currentChannel === ch.id ? 'is-active' : ''}`}
                style={{ ['--ch' as string]: ch.displayMetadata?.color ?? '#888' }}
                onClick={() => join(ch.id)}
              >
                <span className="fd-channel-swatch" />
                {ch.displayMetadata?.name ?? ch.id}
              </button>
            ))}
          </div>

          <h3>Broadcast context</h3>
          <div className="fd-row">
            {INSTRUMENTS.map((t) => (
              <button key={t} className="fd-btn" disabled={!currentChannel} onClick={() => broadcastInstrument(t)}>
                {t}
              </button>
            ))}
          </div>
          {!currentChannel && <p className="fd-note">Join a channel to broadcast.</p>}

          <h3>Raise intent</h3>
          <div className="fd-row">
            <button className="fd-btn" onClick={() => raise(Intents.ViewChart, lastInstrument.current)}>
              ViewChart
            </button>
            <button className="fd-btn" onClick={() => raise(Intents.ViewNews, lastInstrument.current)}>
              ViewNews
            </button>
            <button
              className="fd-btn"
              onClick={() => raise(Intents.ViewContact, createContact('jo@example.com', 'Jo Trader'))}
            >
              ViewContact
            </button>
          </div>
          <p className="fd-note">Context type: {ContextTypes.Instrument}</p>
        </section>

        <section className="fd-panel">
          <h3>Received context</h3>
          <ul className="fd-log">
            {contextLog.map((l, i) => (
              <li key={i}><span className="fd-time">{l.at}</span>{l.text}</li>
            ))}
            {contextLog.length === 0 && <li className="fd-muted">nothing yet</li>}
          </ul>

          <h3>Received intents</h3>
          <ul className="fd-log">
            {intentLog.map((l, i) => (
              <li key={i}><span className="fd-time">{l.at}</span>{l.text}</li>
            ))}
            {intentLog.length === 0 && <li className="fd-muted">nothing yet</li>}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Fdc3Demo;
