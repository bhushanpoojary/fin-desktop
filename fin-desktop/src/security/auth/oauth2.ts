/**
 * OAuth 2.0 / OIDC helpers (Authorization Code + PKCE).
 *
 * Pure functions to build authorization/token requests, derive PKCE challenges, and parse
 * responses — the production-grade auth flow building blocks. Crypto uses Web Crypto
 * (`crypto.subtle`), available in Electron renderers, browsers, and Node 18+.
 */

import type { TokenSet } from './tokenStore';

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 =
    typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

/** Generate a high-entropy PKCE code verifier (RFC 7636). */
export function generateCodeVerifier(length = 64): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes).slice(0, length);
}

/** Derive the S256 code challenge for a verifier. */
export async function deriveCodeChallenge(codeVerifier: string): Promise<string> {
  return base64UrlEncode(await sha256(codeVerifier));
}

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

export async function createPkcePair(): Promise<PkcePair> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await deriveCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge, codeChallengeMethod: 'S256' };
}

export interface AuthorizationUrlConfig {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  responseType?: string;
  extraParams?: Record<string, string>;
}

export function buildAuthorizationUrl(config: AuthorizationUrlConfig): string {
  const url = new URL(config.authorizationEndpoint);
  const params = url.searchParams;
  params.set('response_type', config.responseType ?? 'code');
  params.set('client_id', config.clientId);
  params.set('redirect_uri', config.redirectUri);
  if (config.scope) params.set('scope', config.scope);
  if (config.state) params.set('state', config.state);
  if (config.codeChallenge) {
    params.set('code_challenge', config.codeChallenge);
    params.set('code_challenge_method', config.codeChallengeMethod ?? 'S256');
  }
  for (const [key, value] of Object.entries(config.extraParams ?? {})) {
    params.set(key, value);
  }
  return url.toString();
}

export interface AuthorizationCallback {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}

export function parseAuthorizationCallback(url: string): AuthorizationCallback {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {};
  }
  const params = parsed.searchParams;
  return {
    code: params.get('code') ?? undefined,
    state: params.get('state') ?? undefined,
    error: params.get('error') ?? undefined,
    errorDescription: params.get('error_description') ?? undefined,
  };
}

export function buildTokenExchangeBody(config: {
  code: string;
  redirectUri: string;
  clientId: string;
  codeVerifier?: string;
}): string {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: config.code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
  });
  if (config.codeVerifier) params.set('code_verifier', config.codeVerifier);
  return params.toString();
}

export function buildRefreshTokenBody(config: {
  refreshToken: string;
  clientId: string;
  scope?: string;
}): string {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: config.refreshToken,
    client_id: config.clientId,
  });
  if (config.scope) params.set('scope', config.scope);
  return params.toString();
}

/** Map an OAuth token endpoint response to a TokenSet (computing `expiresAt`). */
export function parseTokenResponse(payload: unknown, now: number = Date.now()): TokenSet {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid token response');
  }
  const o = payload as Record<string, unknown>;
  if (typeof o.access_token !== 'string') {
    throw new Error('Token response missing access_token');
  }
  const expiresIn = typeof o.expires_in === 'number' ? o.expires_in : undefined;
  return {
    accessToken: o.access_token,
    tokenType: typeof o.token_type === 'string' ? o.token_type : undefined,
    refreshToken: typeof o.refresh_token === 'string' ? o.refresh_token : undefined,
    scope: typeof o.scope === 'string' ? o.scope : undefined,
    idToken: typeof o.id_token === 'string' ? o.id_token : undefined,
    expiresAt: expiresIn !== undefined ? now + expiresIn * 1000 : undefined,
  };
}
