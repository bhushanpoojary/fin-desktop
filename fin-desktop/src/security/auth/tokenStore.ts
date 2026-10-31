/**
 * Secure token storage + management.
 *
 * Replaces plaintext credential storage with a pluggable secure store (OS keychain in
 * production via Electron `safeStorage` / keytar) and a token manager that transparently
 * refreshes expiring tokens with single-flight de-duplication. Pure and unit-testable.
 */

export interface TokenSet {
  accessToken: string;
  tokenType?: string;
  refreshToken?: string;
  /** Epoch milliseconds at which the access token expires. */
  expiresAt?: number;
  scope?: string;
  idToken?: string;
}

/** Whether the access token is expired (or within `skewMs` of expiry). */
export function isExpired(tokens: TokenSet, now: number = Date.now(), skewMs = 30_000): boolean {
  if (tokens.expiresAt === undefined) return false;
  return now >= tokens.expiresAt - skewMs;
}

export function expiresInMs(tokens: TokenSet, now: number = Date.now()): number | undefined {
  return tokens.expiresAt === undefined ? undefined : Math.max(0, tokens.expiresAt - now);
}

/** Secure key/value store for tokens. Production impl: OS keychain; here: in-memory. */
export interface SecureTokenStore {
  save(key: string, tokens: TokenSet): Promise<void>;
  load(key: string): Promise<TokenSet | null>;
  clear(key: string): Promise<void>;
}

/** In-memory store for tests and development only (NOT persistent, NOT for production). */
export class InMemoryTokenStore implements SecureTokenStore {
  private readonly data = new Map<string, TokenSet>();

  async save(key: string, tokens: TokenSet): Promise<void> {
    this.data.set(key, { ...tokens });
  }

  async load(key: string): Promise<TokenSet | null> {
    const tokens = this.data.get(key);
    return tokens ? { ...tokens } : null;
  }

  async clear(key: string): Promise<void> {
    this.data.delete(key);
  }
}

export type RefreshFn = (refreshToken: string) => Promise<TokenSet>;

export interface TokenManagerOptions {
  store: SecureTokenStore;
  key: string;
  refresh: RefreshFn;
  now?: () => number;
  skewMs?: number;
}

export class TokenManager {
  private readonly store: SecureTokenStore;
  private readonly key: string;
  private readonly refresh: RefreshFn;
  private readonly now: () => number;
  private readonly skewMs: number;
  private inflight: Promise<TokenSet> | null = null;

  constructor(options: TokenManagerOptions) {
    this.store = options.store;
    this.key = options.key;
    this.refresh = options.refresh;
    this.now = options.now ?? Date.now;
    this.skewMs = options.skewMs ?? 30_000;
  }

  async setTokens(tokens: TokenSet): Promise<void> {
    await this.store.save(this.key, tokens);
  }

  async getTokens(): Promise<TokenSet | null> {
    return this.store.load(this.key);
  }

  async clear(): Promise<void> {
    await this.store.clear(this.key);
  }

  /** Return a valid access token, refreshing transparently if it has expired. */
  async getAccessToken(): Promise<string> {
    const current = await this.store.load(this.key);
    if (!current) throw new Error('No tokens stored');
    if (!isExpired(current, this.now(), this.skewMs)) return current.accessToken;
    if (!current.refreshToken) throw new Error('Access token expired and no refresh token');
    const refreshed = await this.refreshOnce(current.refreshToken);
    return refreshed.accessToken;
  }

  /** Single-flight refresh: concurrent callers share one in-flight refresh. */
  private refreshOnce(refreshToken: string): Promise<TokenSet> {
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      try {
        const next = await this.refresh(refreshToken);
        // Keep the existing refresh token if the response omits a new one.
        const merged: TokenSet = { ...next, refreshToken: next.refreshToken ?? refreshToken };
        await this.store.save(this.key, merged);
        return merged;
      } finally {
        this.inflight = null;
      }
    })();
    return this.inflight;
  }
}
