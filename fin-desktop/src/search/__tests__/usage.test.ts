import { describe, it, expect } from 'vitest';
import { UsageTracker } from '../usage';
import type { SearchResult } from '../searchRegistry';

function result(id: string, score = 10): SearchResult {
  return { id, title: id, providerId: 'p', score };
}

describe('UsageTracker', () => {
  it('records count and last-used time', () => {
    let clock = 1_000;
    const tracker = new UsageTracker({ now: () => clock });
    tracker.record('a');
    clock = 2_000;
    tracker.record('a');
    expect(tracker.getUsage('a')).toEqual({ count: 2, lastUsed: 2_000 });
    expect(tracker.getUsage('missing')).toBeUndefined();
  });

  it('boosts by frequency and recency buckets', () => {
    const tracker = new UsageTracker({ now: () => 0 });
    tracker.record('a'); // count 1, lastUsed 0
    expect(tracker.boost('a', 30_000)).toBe(5 + 30); // <1min
    expect(tracker.boost('a', 2 * 60_000)).toBe(5 + 20); // <1hr
    expect(tracker.boost('a', 2 * 3_600_000)).toBe(5 + 10); // <1day
    expect(tracker.boost('a', 2 * 86_400_000)).toBe(5 + 5); // <1week
    expect(tracker.boost('a', 2 * 604_800_000)).toBe(5); // older
    expect(tracker.boost('unknown', 0)).toBe(0);
  });

  it('favorites float to the top', () => {
    const tracker = new UsageTracker();
    expect(tracker.isFavorite('a')).toBe(false);
    expect(tracker.toggleFavorite('a')).toBe(true);
    expect(tracker.isFavorite('a')).toBe(true);
    expect(tracker.boost('a', 0)).toBeGreaterThanOrEqual(1000);
    expect(tracker.toggleFavorite('a')).toBe(false);
  });

  it('ranks used items above equally-scored unused ones', () => {
    const tracker = new UsageTracker({ now: () => 0 });
    tracker.record('b');
    tracker.record('b');
    const ranked = tracker.rank([result('a'), result('b')]);
    expect(ranked[0].id).toBe('b');
  });

  it('a favorite outranks a more-used non-favorite', () => {
    const tracker = new UsageTracker({ now: () => 0 });
    for (let i = 0; i < 10; i++) tracker.record('b');
    tracker.setFavorite('a', true);
    const ranked = tracker.rank([result('a'), result('b')]);
    expect(ranked[0].id).toBe('a');
  });

  it('serializes and restores state', () => {
    const tracker = new UsageTracker({ now: () => 5, favorites: ['a'] });
    tracker.record('b');
    const state = tracker.serialize();
    expect(state).toEqual({ usage: { b: { count: 1, lastUsed: 5 } }, favorites: ['a'] });

    const restored = new UsageTracker({ initial: state.usage, favorites: state.favorites, now: () => 5 });
    expect(restored.getUsage('b')).toEqual({ count: 1, lastUsed: 5 });
    expect(restored.isFavorite('a')).toBe(true);
  });
});
