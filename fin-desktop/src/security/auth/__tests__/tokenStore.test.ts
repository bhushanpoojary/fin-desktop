import { describe, it, expect, vi } from 'vitest';
import {
  isExpired,
  expiresInMs,
  InMemoryTokenStore,
  TokenManager,
  type TokenSet,
} from '../tokenStore';

const base: TokenSet = { accessToken: 'at', refreshToken: 'rt', expiresAt: 10_000 };

describe('isExpired / expiresInMs', () => {
  it('is never expired without an expiry', () => {
    expect(isExpired({ accessToken: 'x' }, 9_999_999)).toBe(false);
  });

  it('respects the skew window', () => {
    expect(isExpired(base, 9_000, 1_000)).toBe(true); // within 1s skew of 10_000
    expect(isExpired(base, 8_000, 1_000)).toBe(false);
  });

  it('computes remaining time', () => {
    expect(expiresInMs(base, 4_000)).toBe(6_000);
    expect(expiresInMs(base, 20_000)).toBe(0);
    expect(expiresInMs({ accessToken: 'x' })).toBeUndefined();
  });
});

describe('InMemoryTokenStore', () => {
  it('saves, loads (by value), and clears', async () => {
    const store = new InMemoryTokenStore();
    await store.save('user', base);
    const loaded = await store.load('user');
    expect(loaded).toEqual(base);
    expect(loaded).not.toBe(base); // copy, not reference
    await store.clear('user');
    expect(await store.load('user')).toBeNull();
  });
});

describe('TokenManager', () => {
  function setup(now: number, refresh = vi.fn()) {
    const store = new InMemoryTokenStore();
    const manager = new TokenManager({ store, key: 'user', refresh, now: () => now, skewMs: 1_000 });
    return { store, manager, refresh };
  }

  it('returns the current token when still valid', async () => {
    const { manager } = setup(5_000);
    await manager.setTokens(base);
    expect(await manager.getAccessToken()).toBe('at');
  });

  it('refreshes when expired and persists the new tokens', async () => {
    const refresh = vi.fn().mockResolvedValue({ accessToken: 'at2', expiresAt: 100_000 });
    const { manager, store } = setup(9_999, refresh);
    await manager.setTokens(base);

    expect(await manager.getAccessToken()).toBe('at2');
    expect(refresh).toHaveBeenCalledWith('rt');
    // New token stored, old refresh token preserved.
    expect(await store.load('user')).toMatchObject({ accessToken: 'at2', refreshToken: 'rt' });
  });

  it('de-duplicates concurrent refreshes (single-flight)', async () => {
    let resolveRefresh: (t: TokenSet) => void = () => {};
    const refresh = vi.fn(
      () => new Promise<TokenSet>((resolve) => { resolveRefresh = resolve; }),
    );
    const { manager } = setup(9_999, refresh);
    await manager.setTokens(base);

    const p1 = manager.getAccessToken();
    const p2 = manager.getAccessToken();

    // Wait until the (single) refresh has actually been invoked, then resolve it.
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    resolveRefresh({ accessToken: 'at2', expiresAt: 100_000 });

    expect(await p1).toBe('at2');
    expect(await p2).toBe('at2');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('throws when there are no tokens', async () => {
    const { manager } = setup(0);
    await expect(manager.getAccessToken()).rejects.toThrow(/No tokens/);
  });

  it('throws when expired without a refresh token', async () => {
    const { manager } = setup(9_999);
    await manager.setTokens({ accessToken: 'at', expiresAt: 10_000 });
    await expect(manager.getAccessToken()).rejects.toThrow(/no refresh token/);
  });
});
