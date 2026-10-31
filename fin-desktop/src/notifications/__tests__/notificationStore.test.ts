import { describe, it, expect, vi } from 'vitest';
import { NotificationStore, NotificationPriority } from '../notificationStore';
import type { OsNotificationSink, RichNotification } from '../notificationStore';

function store(overrides = {}) {
  let n = 0;
  let t = 1000;
  return new NotificationStore({ idFactory: () => `x${n++}`, now: () => (t += 10), ...overrides });
}

describe('NotificationStore', () => {
  it('posts with sensible defaults and stores history', () => {
    const s = store();
    const n = s.post({ title: 'Hello', body: 'world' });
    expect(n.type).toBe('info');
    expect(n.priority).toBe(NotificationPriority.Normal);
    expect(n.read).toBe(false);
    expect(s.all()).toHaveLength(1);
    expect(s.get(n.id)?.title).toBe('Hello');
  });

  it('delivers via onToast, or falls back to the OS sink', () => {
    const onToast = vi.fn();
    const withToast = store({ onToast });
    withToast.post({ title: 'A' });
    expect(onToast).toHaveBeenCalledTimes(1);

    const osSink: OsNotificationSink = { notify: vi.fn() };
    const withOs = store({ osSink });
    withOs.post({ title: 'B' });
    expect(osSink.notify).toHaveBeenCalledTimes(1);
  });

  it('suppresses delivery under DND except for critical', () => {
    const onToast = vi.fn();
    const s = store({ onToast, dnd: true });
    s.post({ title: 'normal' });
    expect(onToast).not.toHaveBeenCalled();
    s.post({ title: 'urgent', priority: NotificationPriority.Critical });
    expect(onToast).toHaveBeenCalledTimes(1);
    // Suppressed notifications are still retained in history.
    expect(s.all()).toHaveLength(2);
  });

  it('filters by group, priority, unread, and query', () => {
    const s = store();
    s.post({ title: 'Trade filled', group: 'Trading', priority: NotificationPriority.High });
    s.post({ title: 'News alert', group: 'Research', priority: NotificationPriority.Low });
    const read = s.post({ title: 'Risk breach', group: 'Trading', priority: NotificationPriority.Critical });
    s.markRead(read.id);

    expect(s.list({ group: 'Trading' })).toHaveLength(2);
    expect(s.list({ minPriority: NotificationPriority.High })).toHaveLength(2);
    expect(s.list({ unreadOnly: true }).map((n) => n.title)).toEqual(['News alert', 'Trade filled']);
    expect(s.list({ query: 'news' })).toHaveLength(1);
  });

  it('lists newest-first and groups notifications', () => {
    const s = store();
    s.post({ title: 'first', group: 'A' });
    s.post({ title: 'second', group: 'B' });
    s.post({ title: 'third', group: 'A' });
    expect(s.list().map((n) => n.title)).toEqual(['third', 'second', 'first']);
    const groups = s.grouped();
    expect(groups.get('A')?.map((n) => n.title)).toEqual(['third', 'first']);
    expect(groups.get('B')).toHaveLength(1);
    expect(s.groups()).toEqual(['A', 'B']);
  });

  it('tracks a badge count of unread, non-dismissed items', () => {
    const s = store();
    const a = s.post({ title: 'a' });
    s.post({ title: 'b' });
    expect(s.badgeCount()).toBe(2);
    s.markRead(a.id);
    expect(s.badgeCount()).toBe(1);
    s.markAllRead();
    expect(s.badgeCount()).toBe(0);
  });

  it('dismisses and clears', () => {
    const s = store();
    const a = s.post({ title: 'a' });
    s.post({ title: 'b' });
    s.dismiss(a.id);
    expect(s.list()).toHaveLength(1);
    expect(s.all()).toHaveLength(2); // dismissed stays in raw history
    s.clear();
    expect(s.all()).toHaveLength(0);
  });

  it('clamps progress updates to 0–100', () => {
    const s = store();
    const n = s.post({ title: 'Download', progress: 0 });
    s.updateProgress(n.id, 150);
    expect(s.get(n.id)?.progress).toBe(100);
    s.updateProgress(n.id, -10);
    expect(s.get(n.id)?.progress).toBe(0);
  });

  it('acting returns an FDC3 route and marks read', () => {
    const s = store();
    const n = s.post({
      title: 'View chart',
      route: { intent: 'ViewChart', context: { ticker: 'AAPL' } },
      buttons: [{ id: 'open', label: 'Open', intent: { name: 'ViewInstrument', context: { id: 'AAPL' } } }],
    });
    expect(s.act(n.id)).toEqual({ intent: 'ViewChart', context: { ticker: 'AAPL' } });
    expect(s.isRead(n.id)).toBe(true);
    expect(s.act(n.id, 'open')).toEqual({ intent: 'ViewInstrument', context: { id: 'AAPL' } });
    expect(s.act(n.id, 'missing')).toBeUndefined();
  });

  it('notifies onChange for mutations', () => {
    const onChange = vi.fn();
    const s = store({ onChange });
    const n = s.post({ title: 'a' });
    s.markRead(n.id);
    s.setDnd(true);
    s.setDnd(true); // no-op
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('serializes and restores history + DND', () => {
    const s = store({ dnd: true });
    s.post({ title: 'kept' });
    const state = s.serialize();
    expect(state.dnd).toBe(true);
    expect(state.items).toHaveLength(1);

    const restored = NotificationStore.deserialize(state);
    expect(restored.isDnd()).toBe(true);
    expect(restored.all()).toHaveLength(1);
  });

  it('caps retained history', () => {
    const s = store({ maxHistory: 3 });
    const titles: RichNotification[] = [];
    for (let i = 0; i < 5; i++) titles.push(s.post({ title: `n${i}` }));
    expect(s.all().map((n) => n.title)).toEqual(['n2', 'n3', 'n4']);
  });
});
