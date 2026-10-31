import { describe, it, expect, vi } from 'vitest';
import { ConfigStore, FeatureFlags } from '../remoteConfig';

describe('ConfigStore', () => {
  it('layers override > remote > default > fallback', () => {
    const store = new ConfigStore({ defaults: { theme: 'light', maxViews: 8 } });
    expect(store.get('theme')).toBe('light');
    store.setRemote({ theme: 'dark' });
    expect(store.get('theme')).toBe('dark');
    store.setOverride('theme', 'high-contrast');
    expect(store.get('theme')).toBe('high-contrast');
    expect(store.get('missing', 'fb')).toBe('fb');
  });

  it('reports the source of a key', () => {
    const store = new ConfigStore({ defaults: { a: 1 }, remote: { b: 2 } });
    store.setOverride('c', 3);
    expect(store.sourceOf('a')).toBe('default');
    expect(store.sourceOf('b')).toBe('remote');
    expect(store.sourceOf('c')).toBe('override');
    expect(store.sourceOf('x')).toBe('none');
  });

  it('coerces typed getters', () => {
    const store = new ConfigStore({ defaults: { n: '42', flag: 'true', on: 1 } });
    expect(store.getNumber('n')).toBe(42);
    expect(store.getBoolean('flag')).toBe(true);
    expect(store.getBoolean('on')).toBe(true);
    expect(store.getString('n')).toBe('42');
  });

  it('merges getAll with override precedence and notifies onChange', () => {
    const onChange = vi.fn();
    const store = new ConfigStore({ defaults: { a: 1, b: 2 }, remote: { b: 20 }, onChange });
    store.setOverride('a', 100);
    expect(store.getAll()).toEqual({ a: 100, b: 20 });
    store.clearOverride('a');
    expect(store.getAll()).toEqual({ a: 1, b: 20 });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

describe('FeatureFlags', () => {
  it('returns false for unknown flags', () => {
    expect(new FeatureFlags().isEnabled('nope')).toBe(false);
  });

  it('honors enabled state', () => {
    const flags = new FeatureFlags([{ key: 'newUi', enabled: true }, { key: 'beta', enabled: false }]);
    expect(flags.isEnabled('newUi')).toBe(true);
    expect(flags.isEnabled('beta')).toBe(false);
  });

  it('deny beats allow beats rollout', () => {
    const flags = new FeatureFlags([
      { key: 'f', enabled: true, rolloutPercentage: 0, allow: ['vip'], deny: ['banned'] },
    ]);
    expect(flags.isEnabled('f', { id: 'banned' })).toBe(false);
    expect(flags.isEnabled('f', { id: 'vip' })).toBe(true);
    expect(flags.isEnabled('f', { id: 'other' })).toBe(false); // 0% rollout
  });

  it('applies deterministic staged rollout', () => {
    const flags = new FeatureFlags([{ key: 'f', enabled: true, rolloutPercentage: 100 }]);
    expect(flags.isEnabled('f', { id: 'anyone' })).toBe(true);
    const a = flags.isEnabled('f', { id: 'machine-1' });
    const b = flags.isEnabled('f', { id: 'machine-1' });
    expect(a).toBe(b);
  });

  it('replaces flags on a remote push', () => {
    const onChange = vi.fn();
    const flags = new FeatureFlags([{ key: 'old', enabled: true }], onChange);
    flags.setFlags([{ key: 'new', enabled: true }]);
    expect(flags.isEnabled('old')).toBe(false);
    expect(flags.isEnabled('new')).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });
});
