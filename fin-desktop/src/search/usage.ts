/**
 * Usage tracking for the launcher — recents, frequency, and favorites.
 *
 * Records how often/recently each item is picked and which are favorited, and boosts search
 * scores accordingly so the palette surfaces what you use most. Pure and deterministic (clock
 * is injectable); `serialize()` persists state.
 */

import type { SearchResult } from './searchRegistry';

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const WEEK = 604_800_000;

export interface UsageRecord {
  count: number;
  lastUsed: number;
}

export type UsageState = Record<string, UsageRecord>;

export interface UsageTrackerOptions {
  now?: () => number;
  initial?: UsageState;
  favorites?: string[];
}

export class UsageTracker {
  private readonly usage = new Map<string, UsageRecord>();
  private readonly favorites: Set<string>;
  private readonly now: () => number;

  constructor(options: UsageTrackerOptions = {}) {
    this.now = options.now ?? Date.now;
    this.favorites = new Set(options.favorites ?? []);
    if (options.initial) {
      for (const [id, record] of Object.entries(options.initial)) {
        this.usage.set(id, { ...record });
      }
    }
  }

  record(id: string): void {
    const existing = this.usage.get(id);
    this.usage.set(id, { count: (existing?.count ?? 0) + 1, lastUsed: this.now() });
  }

  getUsage(id: string): UsageRecord | undefined {
    const record = this.usage.get(id);
    return record ? { ...record } : undefined;
  }

  isFavorite(id: string): boolean {
    return this.favorites.has(id);
  }

  toggleFavorite(id: string): boolean {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
      return false;
    }
    this.favorites.add(id);
    return true;
  }

  setFavorite(id: string, favorite: boolean): void {
    if (favorite) this.favorites.add(id);
    else this.favorites.delete(id);
  }

  /** Additive score boost: favorites float to the top, then frequency + recency. */
  boost(id: string, now: number = this.now()): number {
    let boost = this.favorites.has(id) ? 1000 : 0;
    const record = this.usage.get(id);
    if (record) {
      boost += record.count * 5;
      const age = now - record.lastUsed;
      if (age < MINUTE) boost += 30;
      else if (age < HOUR) boost += 20;
      else if (age < DAY) boost += 10;
      else if (age < WEEK) boost += 5;
    }
    return boost;
  }

  /** Apply usage boosts to results and re-sort. */
  rank(results: SearchResult[]): SearchResult[] {
    const now = this.now();
    return results
      .map((r) => ({ ...r, score: r.score + this.boost(r.id, now) }))
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }

  serialize(): { usage: UsageState; favorites: string[] } {
    const usage: UsageState = {};
    for (const [id, record] of this.usage) usage[id] = { ...record };
    return { usage, favorites: [...this.favorites] };
  }
}
