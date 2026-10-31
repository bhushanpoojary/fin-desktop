import { describe, it, expect, vi } from 'vitest';
import { SearchRegistry, createListProvider, type SearchItem } from '../searchRegistry';

const apps: SearchItem[] = [
  { id: 'chart', title: 'Price Chart', category: 'Apps', keywords: ['graph'] },
  { id: 'news', title: 'Market News', category: 'Apps' },
  { id: 'blotter', title: 'Trade Blotter', category: 'Apps' },
];

describe('createListProvider', () => {
  it('returns all items for an empty query', () => {
    const provider = createListProvider('apps', apps);
    const results = provider.search('');
    expect(results.map((r) => r.id).sort()).toEqual(['blotter', 'chart', 'news']);
  });

  it('fuzzy-filters by title and keywords', () => {
    const provider = createListProvider('apps', apps);
    expect(provider.search('chart').map((r) => r.id)).toEqual(['chart']);
    expect(provider.search('graph').map((r) => r.id)).toEqual(['chart']); // keyword match
    expect(provider.search('zzz')).toEqual([]);
  });

  it('supports a lazy source function', () => {
    const provider = createListProvider('apps', () => apps);
    expect(provider.search('news').map((r) => r.id)).toEqual(['news']);
  });

  it('carries the run action and match positions', () => {
    const run = vi.fn();
    const provider = createListProvider('apps', [{ id: 'x', title: 'Chart', run }]);
    const [result] = provider.search('cha');
    expect(result.matchPositions).toEqual([0, 1, 2]);
    result.run?.();
    expect(run).toHaveBeenCalled();
  });
});

describe('SearchRegistry', () => {
  it('aggregates and ranks results from multiple providers', async () => {
    const registry = new SearchRegistry();
    registry.register(createListProvider('apps', apps));
    registry.register(
      createListProvider('commands', [{ id: 'cmd-chart', title: 'Open Chart Settings', category: 'Commands' }]),
    );

    const results = await registry.search('chart');
    expect(results.map((r) => r.id)).toContain('chart');
    expect(results.map((r) => r.id)).toContain('cmd-chart');
    // "Price Chart" (prefix-ish) should outrank "Open Chart Settings".
    expect(results[0].id).toBe('chart');
  });

  it('respects the limit', async () => {
    const registry = new SearchRegistry();
    registry.register(createListProvider('apps', apps));
    expect(await registry.search('', { limit: 2 })).toHaveLength(2);
  });

  it('register returns an unregister handle', async () => {
    const registry = new SearchRegistry();
    const off = registry.register(createListProvider('apps', apps));
    expect((await registry.search('news')).length).toBe(1);
    off();
    expect(await registry.search('news')).toEqual([]);
  });
});
