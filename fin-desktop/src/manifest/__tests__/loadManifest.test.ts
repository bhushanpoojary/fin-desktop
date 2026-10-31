import { describe, it, expect } from 'vitest';
import { loadManifest, type FetchLike, type FetchResponseLike } from '../loadManifest';

const validApp = {
  type: 'application',
  startupApp: { appId: 'a', name: 'A', url: 'https://a.example.com' },
};

function response(payload: unknown, ok = true, status = 200): FetchResponseLike {
  return { ok, status, json: () => Promise.resolve(payload) };
}

function fakeFetch(res: FetchResponseLike): FetchLike {
  return () => Promise.resolve(res);
}

describe('loadManifest', () => {
  it('fetches and validates a manifest', async () => {
    const manifest = await loadManifest('https://d/app.json', fakeFetch(response(validApp)));
    expect(manifest.type).toBe('application');
  });

  it('throws on a non-ok response', async () => {
    await expect(loadManifest('https://d/app.json', fakeFetch(response(null, false, 404)))).rejects.toThrow(
      /404/,
    );
  });

  it('throws with a readable summary on an invalid manifest', async () => {
    const bad = { type: 'application', startupApp: { appId: 'a' } };
    await expect(loadManifest('https://d/app.json', fakeFetch(response(bad)))).rejects.toThrow(
      /Invalid manifest.*startupApp\.(name|url)/,
    );
  });
});
