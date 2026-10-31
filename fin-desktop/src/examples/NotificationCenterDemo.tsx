/**
 * NotificationCenterDemo — the upgraded notification center: a grouped, filterable history panel
 * with priority levels, a Do-Not-Disturb toggle, a badge count, rich notifications (buttons,
 * inputs, images, progress), and FDC3 intent routing on action. Route: ?test=notifications.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { NotificationStore, NotificationPriority } from '../notifications';
import type { NotificationPriority as Priority, RichNotification } from '../notifications';
import './NotificationCenterDemo.css';

const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#5a6174' },
  normal: { label: 'Normal', color: '#4f8cff' },
  high: { label: 'High', color: '#e3b23c' },
  critical: { label: 'Critical', color: '#e2574c' },
};

let seed = 0;
const SAMPLES: Array<() => Parameters<NotificationStore['post']>[0]> = [
  () => ({ title: 'Order filled', body: 'BUY 1,000 AAPL @ 192.40', type: 'success', priority: NotificationPriority.High, group: 'Trading', route: { intent: 'ViewOrder', context: { id: `ord-${seed}` } }, buttons: [{ id: 'chart', label: 'View chart', intent: { name: 'ViewChart', context: { ticker: 'AAPL' } } }] }),
  () => ({ title: 'Breaking: Fed holds rates', body: 'Markets react to the announcement.', type: 'info', priority: NotificationPriority.Normal, group: 'Research', image: '📰' }),
  () => ({ title: 'Risk limit breached', body: 'Desk VaR exceeded threshold.', type: 'error', priority: NotificationPriority.Critical, group: 'Trading', buttons: [{ id: 'ack', label: 'Acknowledge' }] }),
  () => ({ title: 'Report export', body: 'Generating end-of-day report…', type: 'info', priority: NotificationPriority.Low, group: 'System', progress: 20 }),
  () => ({ title: 'Mention from @alex', body: 'Can you check the blotter?', type: 'info', priority: NotificationPriority.Normal, group: 'Messages', inputs: [{ id: 'reply', placeholder: 'Reply…' }] }),
];

export const NotificationCenterDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const store = useMemo(() => new NotificationStore({ onChange: forceRender }), []);
  const [minPriority, setMinPriority] = useState<Priority | ''>('');
  const [query, setQuery] = useState('');
  const [routed, setRouted] = useState<string | null>(null);

  const addSample = () => {
    seed += 1;
    const factory = SAMPLES[seed % SAMPLES.length];
    const n = store.post(factory());
    if (n.progress !== undefined) {
      // Simulate a progressing task.
      let p = n.progress;
      const timer = setInterval(() => {
        p += 20;
        store.updateProgress(n.id, p);
        if (p >= 100) clearInterval(timer);
      }, 600);
    }
  };

  const filter = { minPriority: minPriority || undefined, query: query || undefined };
  const groups = store.grouped(filter);

  const act = (n: RichNotification, buttonId?: string) => {
    const route = store.act(n.id, buttonId);
    if (route) setRouted(`fdc3.raiseIntent("${route.intent}", ${JSON.stringify(route.context ?? {})})`);
  };

  const renderCard = (n: RichNotification) => {
    const meta = PRIORITY_META[n.priority];
    return (
      <div key={n.id} className={`nc-card ${n.read ? 'read' : ''}`} style={{ borderLeftColor: meta.color }}>
        <div className="nc-card-head">
          {n.image && <span className="nc-card-image">{n.image}</span>}
          <div className="nc-card-title-wrap">
            <div className="nc-card-title">
              {!n.read && <span className="nc-unread-dot" />}
              {n.title}
            </div>
            {n.body && <div className="nc-card-body">{n.body}</div>}
          </div>
          <span className="nc-prio" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>

        {n.progress !== undefined && (
          <div className="nc-progress">
            <div className="nc-progress-bar" style={{ width: `${n.progress}%` }} />
            <span className="nc-progress-label">{n.progress}%</span>
          </div>
        )}

        {n.inputs?.map((input) => (
          <input key={input.id} className="nc-input" placeholder={input.placeholder} onKeyDown={(e) => e.key === 'Enter' && act(n)} />
        ))}

        <div className="nc-card-actions">
          {n.route && (
            <button className="nc-btn primary" onClick={() => act(n)}>
              Open
            </button>
          )}
          {n.buttons?.map((b) => (
            <button key={b.id} className="nc-btn" onClick={() => act(n, b.id)}>
              {b.label}
            </button>
          ))}
          {!n.read && (
            <button className="nc-btn ghost" onClick={() => store.markRead(n.id)}>
              Mark read
            </button>
          )}
          <button className="nc-btn ghost" onClick={() => store.dismiss(n.id)}>
            Dismiss
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="nc">
      <header className="nc-head">
        <div className="nc-title">
          <h1>Notifications</h1>
          {store.badgeCount() > 0 && <span className="nc-badge">{store.badgeCount()}</span>}
        </div>
        <div className="nc-controls">
          <button className="nc-ctrl" onClick={addSample}>
            + Post sample
          </button>
          <label className={`nc-dnd ${store.isDnd() ? 'on' : ''}`}>
            <input type="checkbox" checked={store.isDnd()} onChange={(e) => store.setDnd(e.target.checked)} />
            Do Not Disturb
          </label>
          <button className="nc-ctrl" onClick={() => store.markAllRead()}>
            Mark all read
          </button>
          <button className="nc-ctrl" onClick={() => store.clear()}>
            Clear
          </button>
        </div>
      </header>

      <div className="nc-filters">
        <input className="nc-search" placeholder="Search notifications…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="nc-prio-select" value={minPriority} onChange={(e) => setMinPriority(e.target.value as Priority | '')}>
          <option value="">All priorities</option>
          <option value="normal">Normal+</option>
          <option value="high">High+</option>
          <option value="critical">Critical only</option>
        </select>
      </div>

      {routed && <div className="nc-routed">Routed → {routed}</div>}

      <div className="nc-list">
        {groups.size === 0 ? (
          <p className="nc-empty">No notifications. Post a sample to see the center in action.</p>
        ) : (
          [...groups.entries()].map(([group, items]) => (
            <section key={group} className="nc-group">
              <h2 className="nc-group-title">
                {group} <span className="nc-group-count">{items.length}</span>
              </h2>
              {items.map(renderCard)}
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenterDemo;
