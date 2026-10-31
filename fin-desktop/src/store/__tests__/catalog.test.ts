import { describe, it, expect, vi } from 'vitest';
import { AppCatalog } from '../catalog';
import type { CatalogApp } from '../catalog';

function app(appId: string, extra: Partial<CatalogApp> = {}): CatalogApp {
  return { appId, name: appId, ...extra };
}

const CATALOG: CatalogApp[] = [
  app('chart', { name: 'Price Chart', description: 'Live market chart', categories: ['Markets'], tags: ['graph', 'chart'], featured: true }),
  app('news', { name: 'Market News', description: 'Headlines and alerts', categories: ['Research'], tags: ['headlines'] }),
  app('blotter', { name: 'Trade Blotter', description: 'Fills and positions', categories: ['Trading'], tags: ['trades'] }),
  app('risk', { name: 'Risk Monitor', description: 'Enterprise risk', categories: ['Trading'], tags: ['risk'], private: true }),
];

describe('AppCatalog', () => {
  it('lists public apps and hides private ones by default', () => {
    const catalog = new AppCatalog(CATALOG);
    expect(catalog.getApps().map((a) => a.appId)).toEqual(['chart', 'news', 'blotter']);
    expect(catalog.getApps(true).map((a) => a.appId)).toContain('risk');
  });

  it('derives categories, tags, and featured (respecting privacy)', () => {
    const catalog = new AppCatalog(CATALOG);
    expect(catalog.categories()).toEqual(['Markets', 'Research', 'Trading']);
    expect(catalog.tags()).toEqual(['chart', 'graph', 'headlines', 'trades']);
    expect(catalog.featured().map((a) => a.appId)).toEqual(['chart']);
    expect(catalog.categories(true)).toContain('Trading');
    expect(catalog.tags(true)).toContain('risk');
  });

  it('filters by category', () => {
    const catalog = new AppCatalog(CATALOG);
    expect(catalog.byCategory('Trading').map((a) => a.appId)).toEqual(['blotter']);
    expect(catalog.byCategory('Trading', true).map((a) => a.appId)).toEqual(['blotter', 'risk']);
  });

  it('empty search returns the filtered catalog alphabetically by name', () => {
    const catalog = new AppCatalog(CATALOG);
    expect(catalog.search('').map((a) => a.appId)).toEqual(['news', 'chart', 'blotter']);
    expect(catalog.search('', { category: 'Markets' }).map((a) => a.appId)).toEqual(['chart']);
  });

  it('fuzzy searches name/description/tags and narrows by filter', () => {
    const catalog = new AppCatalog(CATALOG);
    expect(catalog.search('chart')[0].appId).toBe('chart');
    expect(catalog.search('headlines').map((a) => a.appId)).toEqual(['news']);
    expect(catalog.search('trade', { category: 'Trading' }).map((a) => a.appId)).toEqual(['blotter']);
    expect(catalog.search('risk').map((a) => a.appId)).toEqual([]); // private hidden
    expect(catalog.search('risk', { includePrivate: true }).map((a) => a.appId)).toEqual(['risk']);
  });

  it('installs and uninstalls', () => {
    const catalog = new AppCatalog(CATALOG);
    expect(catalog.install('chart')).toBe(true);
    expect(catalog.install('chart')).toBe(false); // already installed
    expect(catalog.install('nope')).toBe(false); // unknown
    expect(catalog.isInstalled('chart')).toBe(true);
    expect(catalog.installedApps().map((a) => a.appId)).toEqual(['chart']);
    expect(catalog.uninstall('chart')).toBe(true);
    expect(catalog.isInstalled('chart')).toBe(false);
  });

  it('pin installs first; uninstall unpins', () => {
    const catalog = new AppCatalog(CATALOG);
    expect(catalog.pin('news')).toBe(true);
    expect(catalog.isInstalled('news')).toBe(true);
    expect(catalog.isPinned('news')).toBe(true);
    expect(catalog.pinnedApps().map((a) => a.appId)).toEqual(['news']);
    catalog.uninstall('news');
    expect(catalog.isPinned('news')).toBe(false);
  });

  it('notifies onChange on install/pin mutations', () => {
    const onChange = vi.fn();
    const catalog = new AppCatalog(CATALOG, { onChange });
    catalog.install('chart');
    catalog.install('chart'); // no-op
    catalog.pin('news');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('serializes and deserializes install/pin state', () => {
    const catalog = new AppCatalog(CATALOG);
    catalog.install('chart');
    catalog.pin('news');
    const state = catalog.serialize();
    expect(state).toEqual({ installed: ['chart', 'news'], pinned: ['news'] });

    const restored = AppCatalog.deserialize(CATALOG, state);
    expect(restored.isInstalled('chart')).toBe(true);
    expect(restored.isPinned('news')).toBe(true);
  });
});
