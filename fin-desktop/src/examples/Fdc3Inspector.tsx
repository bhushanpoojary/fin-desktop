/**
 * Fdc3Inspector — a live devtool showing every context broadcast and intent flowing through
 * this window's FDC3 broker (via `window.fdc3.observe`). Local + remote (cross-window) events.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  createInstrument,
  createContact,
  Intents,
  type Context,
  type InteropObservedEvent,
} from '../interop/fdc3';
import './Fdc3Inspector.css';

const INSTRUMENTS = ['AAPL', 'MSFT', 'TSLA', 'NVDA'];

function summarize(context: Context): string {
  return context.name ?? context.id?.ticker ?? context.id?.email ?? context.type;
}

export const Fdc3Inspector: React.FC = () => {
  const fdc3 = typeof window !== 'undefined' ? window.fdc3 : undefined;
  const [events, setEvents] = useState<InteropObservedEvent[]>([]);
  const last = useRef<Context>(createInstrument('AAPL'));

  useEffect(() => {
    if (!fdc3) return;
    fdc3.joinUserChannel('red');
    return fdc3.observe((event) => setEvents((prev) => [event, ...prev].slice(0, 200)));
  }, [fdc3]);

  if (!fdc3) {
    return (
      <div className="insp">
        <div className="insp-empty">
          <code>window.fdc3</code> is unavailable — run the app with <code>npm run dev</code>.
        </div>
      </div>
    );
  }

  const broadcast = (ticker: string) => {
    const instrument = createInstrument(ticker);
    last.current = instrument;
    fdc3.broadcast(instrument);
  };

  const broadcasts = events.filter((e) => e.kind === 'broadcast').length;
  const intents = events.filter((e) => e.kind === 'intent').length;

  return (
    <div className="insp">
      <header className="insp-top">
        <div className="insp-brand">
          <span className="insp-dot" /> FDC3 Interop Inspector
        </div>
        <div className="insp-stats">
          <span>{events.length} events</span>
          <span>{broadcasts} broadcasts</span>
          <span>{intents} intents</span>
        </div>
        <div className="insp-actions">
          {INSTRUMENTS.map((t) => (
            <button key={t} className="insp-btn" onClick={() => broadcast(t)}>
              {t}
            </button>
          ))}
          <button className="insp-btn" onClick={() => fdc3.raiseIntent(Intents.ViewChart, last.current)}>
            ViewChart
          </button>
          <button
            className="insp-btn"
            onClick={() => fdc3.raiseIntent(Intents.ViewContact, createContact('jo@example.com', 'Jo'))}
          >
            ViewContact
          </button>
          <button className="insp-btn insp-clear" onClick={() => setEvents([])}>
            Clear
          </button>
        </div>
      </header>

      <div className="insp-hint">
        Open a second window at <code>?test=fdc3</code> and broadcast — remote events appear here.
      </div>

      <div className="insp-table">
        <div className="insp-row insp-head">
          <span>Time</span>
          <span>Kind</span>
          <span>Origin</span>
          <span>Channel / Intent</span>
          <span>Context</span>
          <span>Source</span>
          <span>Delivered</span>
        </div>
        {events.map((e, i) => (
          <div className="insp-row" key={i}>
            <span className="insp-time">{new Date(e.timestamp).toLocaleTimeString()}</span>
            <span className={`insp-kind insp-kind-${e.kind}`}>{e.kind}</span>
            <span className={`insp-origin insp-origin-${e.origin}`}>{e.origin}</span>
            <span>{e.channelId ?? e.intent ?? '—'}</span>
            <span>
              <span className="insp-ctx">{summarize(e.context)}</span>
              <span className="insp-ctx-type">{e.context.type}</span>
            </span>
            <span>{e.source?.appId ?? '—'}</span>
            <span>{e.kind === 'intent' ? (e.deliveredTo ?? 0) : '—'}</span>
          </div>
        ))}
        {events.length === 0 && <div className="insp-row insp-muted">no events yet — broadcast something</div>}
      </div>
    </div>
  );
};

export default Fdc3Inspector;
