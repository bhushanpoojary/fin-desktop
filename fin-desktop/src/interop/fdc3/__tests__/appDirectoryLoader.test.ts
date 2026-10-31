import { describe, it, expect, vi } from 'vitest';
import {
  parseAppDirectoryPayload,
  loadAppDirectory,
  mergeApps,
  AppDirectoryLoader,
  type FetchLike,
  type FetchResponseLike,
} from '../appDirectoryLoader';
import type { AppDirectoryApp } from '../appDirectory';

const appA: AppDirectoryApp = { appId: 'a', name: 'Alpha' };
const appB: AppDirectoryApp = { appId: 'b', name: 'Bravo' };

function response(payload: unknown, ok = true, status = 200): FetchResponseLike {
  return { ok, status, json: () => Promise.resolve(payload) };
}

function fakeFetch(map: Record<string, FetchResponseLike>): FetchLike {
  return (url: string) => {
    const res = map[url];
    if (!res) return Promise.reject(new Error(`no stub for ${url}`));
    return Promise.resolve(res);
  };
}

describe('parseAppDirectoryPayload', () => {
  it('accepts a bare array', () => {
    expect(parseAppDirectoryPayload([appA, appB])).toEqual([appA, appB]);
  });

  it('accepts an { applications: [...] } response', () => {
    expect(parseAppDirectoryPayload({ applications: [appA] })).toEqual([appA]);
  });

  it('drops malformed records', () => {
    expect(parseAppDirectoryPayload([appA, { name: 'no id' }, { appId: 'c' }, 42])).toEqual([appA]);
  });

  it('throws on a non-list payload', () => {
    expect(() => parseAppDirectoryPayload({ foo: 'bar' })).toThrow(/must be an array/);
  });
});

describe('loadAppDirectory', () => {
  it('fetches and parses', async () => {
    const fetch = fakeFetch({ 'https://d/apps': response([appA]) });
    await expect(loadAppDirectory('https://d/apps', fetch)).resolves.toEqual([appA]);
  });

  it('throws on a non-ok response', async () => {
    const fetch = fakeFetch({ 'https://d/apps': response(null, false, 503) });
    await expect(loadAppDirectory('https://d/apps', fetch)).rejects.toThrow(/503/);
  });
});

describe('mergeApps', () => {
  it('de-duplicates by appId with later winning', () => {
    const merged = mergeApps([appA, appB], [{ appId: 'a', name: 'Alpha v2' }]);
    expect(merged).toHaveLength(2);
    expect(merged.find((a) => a.appId === 'a')?.name).toBe('Alpha v2');
  });
});

describe('AppDirectoryLoader', () => {
  it('loads and merges multiple sources', async () => {
    const fetch = fakeFetch({
      s1: response([appA]),
      s2: response({ applications: [appB] }),
    });
    const loader = new AppDirectoryLoader({ sources: ['s1', 's2'], fetch });
    const dir = await loader.load();
    expect(dir.getApps().map((a) => a.appId).sort()).toEqual(['a', 'b']);
  });

  it('serves from cache within the TTL, then refreshes after it expires', async () => {
    const fetchFn = vi.fn((url: string) =>
      Promise.resolve(response(url === 's1' ? [appA] : [appB])),
    );
    let clock = 1000;
    const loader = new AppDirectoryLoader({
      sources: ['s1'],
      fetch: fetchFn,
      ttlMs: 500,
      now: () => clock,
    });

    await loader.load();
    await loader.load(); // within TTL → cached
    expect(fetchFn).toHaveBeenCalledTimes(1);

    clock += 600; // TTL expired
    await loader.load();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('refresh() always re-fetches', async () => {
    const fetchFn = vi.fn(() => Promise.resolve(response([appA])));
    const loader = new AppDirectoryLoader({ sources: ['s1'], fetch: fetchFn, ttlMs: 10_000, now: () => 0 });
    await loader.load();
    await loader.refresh();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
