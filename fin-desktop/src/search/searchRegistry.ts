/**
 * Search registry — the engine behind the command palette / spotlight launcher.
 *
 * Pluggable providers each return scored results; the registry aggregates and ranks them.
 * `createListProvider` turns a static list (apps, commands, workspaces) into a fuzzy-searched
 * provider. Pure and deterministic.
 */

import { fuzzyMatch } from './fuzzy';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  providerId: string;
  score: number;
  matchPositions?: number[];
  run?: () => void | Promise<void>;
  data?: unknown;
}

export interface SearchProvider {
  id: string;
  search(query: string): SearchResult[] | Promise<SearchResult[]>;
}

/** A provider whose `search` is synchronous (e.g. `createListProvider`). */
export interface SyncSearchProvider extends SearchProvider {
  search(query: string): SearchResult[];
}

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  keywords?: string[];
  run?: () => void | Promise<void>;
  data?: unknown;
}

/** Build a provider that fuzzy-searches a static (or lazily-produced) list of items. */
export function createListProvider(
  providerId: string,
  source: SearchItem[] | (() => SearchItem[]),
): SyncSearchProvider {
  return {
    id: providerId,
    search(query: string): SearchResult[] {
      const items = typeof source === 'function' ? source() : source;
      const results: SearchResult[] = [];
      for (const item of items) {
        const haystacks = [item.title, item.subtitle ?? '', ...(item.keywords ?? [])];
        let matched = query.length === 0;
        let score = 0;
        for (const hay of haystacks) {
          const m = fuzzyMatch(query, hay);
          if (m.matched) {
            matched = true;
            score = Math.max(score, m.score);
          }
        }
        if (!matched) continue;
        const titleMatch = fuzzyMatch(query, item.title);
        results.push({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          category: item.category,
          providerId,
          score,
          matchPositions: titleMatch.matched ? titleMatch.positions : [],
          run: item.run,
          data: item.data,
        });
      }
      return results;
    },
  };
}

export interface SearchOptions {
  limit?: number;
}

export class SearchRegistry {
  private readonly providers = new Map<string, SearchProvider>();

  register(provider: SearchProvider): () => void {
    this.providers.set(provider.id, provider);
    return () => this.providers.delete(provider.id);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  listProviders(): SearchProvider[] {
    return [...this.providers.values()];
  }

  /** Run a query across all providers, ranked by score (then title). */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const batches = await Promise.all([...this.providers.values()].map((p) => p.search(query)));
    const flat = batches.flat();
    flat.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return typeof options.limit === 'number' ? flat.slice(0, options.limit) : flat;
  }
}
