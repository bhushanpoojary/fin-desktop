import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultAuthProvider } from '../DefaultAuthProvider';
import { InMemoryTokenStore } from '../../../security';

const TOKEN_KEY = 'finDesktop.session';

describe('DefaultAuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in and stores the token in the secure store, not plaintext localStorage', async () => {
    const store = new InMemoryTokenStore();
    const auth = new DefaultAuthProvider({ tokenStore: store });

    const result = await auth.login({ username: 'jo', password: 'pw' });

    expect(result.success).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(await store.load(TOKEN_KEY)).toMatchObject({ accessToken: expect.any(String) });
    // The legacy plaintext token key must no longer be written.
    expect(localStorage.getItem('finDesktop.auth_token')).toBeNull();
  });

  it('rejects empty credentials', async () => {
    const auth = new DefaultAuthProvider();
    expect((await auth.login({ username: '', password: 'x' })).success).toBe(false);
    expect((await auth.login({ username: 'x', password: '' })).success).toBe(false);
  });

  it('logout clears the token and profile', async () => {
    const store = new InMemoryTokenStore();
    const auth = new DefaultAuthProvider({ tokenStore: store });
    await auth.login({ username: 'jo', password: 'pw' });

    await auth.logout();

    expect(auth.isAuthenticated()).toBe(false);
    expect(await store.load(TOKEN_KEY)).toBeNull();
  });

  it('restores a session on initialize when a persistent store + profile exist', async () => {
    const store = new InMemoryTokenStore();
    await new DefaultAuthProvider({ tokenStore: store }).login({ username: 'jo', password: 'pw' });

    const restored = new DefaultAuthProvider({ tokenStore: store });
    await restored.initialize();

    expect(restored.isAuthenticated()).toBe(true);
    expect(restored.getCurrentUser()?.username).toBe('jo');
  });

  it('does not restore with the secure in-memory default (no cross-instance persistence)', async () => {
    await new DefaultAuthProvider().login({ username: 'jo', password: 'pw' });

    const fresh = new DefaultAuthProvider();
    await fresh.initialize();

    expect(fresh.isAuthenticated()).toBe(false);
  });

  it('refreshes the token in the secure store', async () => {
    const store = new InMemoryTokenStore();
    const auth = new DefaultAuthProvider({ tokenStore: store });
    await auth.login({ username: 'jo', password: 'pw' });

    const before = (await store.load(TOKEN_KEY))!.accessToken;
    const refreshed = await auth.refreshToken();

    expect(refreshed).not.toBe(before);
    expect((await store.load(TOKEN_KEY))!.accessToken).toBe(refreshed);
  });
});
