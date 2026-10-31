// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  deriveCodeChallenge,
  createPkcePair,
  generateCodeVerifier,
  buildAuthorizationUrl,
  parseAuthorizationCallback,
  buildTokenExchangeBody,
  buildRefreshTokenBody,
  parseTokenResponse,
} from '../oauth2';

describe('PKCE', () => {
  it('derives the S256 challenge for the RFC 7636 test vector', async () => {
    // RFC 7636 Appendix B
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    expect(await deriveCodeChallenge(verifier)).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('createPkcePair produces a verifier whose challenge matches', async () => {
    const pair = await createPkcePair();
    expect(pair.codeChallengeMethod).toBe('S256');
    expect(pair.codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(await deriveCodeChallenge(pair.codeVerifier)).toBe(pair.codeChallenge);
  });

  it('generates URL-safe verifiers', () => {
    expect(generateCodeVerifier()).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

describe('buildAuthorizationUrl', () => {
  it('builds an authorization-code + PKCE URL', () => {
    const url = buildAuthorizationUrl({
      authorizationEndpoint: 'https://idp.example.com/authorize',
      clientId: 'client-123',
      redirectUri: 'findesktop://callback',
      scope: 'openid profile',
      state: 'xyz',
      codeChallenge: 'CHAL',
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('response_type')).toBe('code');
    expect(parsed.searchParams.get('client_id')).toBe('client-123');
    expect(parsed.searchParams.get('scope')).toBe('openid profile');
    expect(parsed.searchParams.get('code_challenge')).toBe('CHAL');
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
    expect(parsed.searchParams.get('state')).toBe('xyz');
  });
});

describe('parseAuthorizationCallback', () => {
  it('extracts code + state', () => {
    expect(parseAuthorizationCallback('findesktop://callback?code=abc&state=xyz')).toEqual({
      code: 'abc',
      state: 'xyz',
      error: undefined,
      errorDescription: undefined,
    });
  });

  it('extracts errors', () => {
    const cb = parseAuthorizationCallback(
      'findesktop://callback?error=access_denied&error_description=nope',
    );
    expect(cb.error).toBe('access_denied');
    expect(cb.errorDescription).toBe('nope');
  });

  it('returns empty for a malformed url', () => {
    expect(parseAuthorizationCallback('not a url')).toEqual({});
  });
});

describe('token request bodies', () => {
  it('builds the authorization-code exchange body', () => {
    const body = new URLSearchParams(
      buildTokenExchangeBody({
        code: 'abc',
        redirectUri: 'findesktop://callback',
        clientId: 'c1',
        codeVerifier: 'ver',
      }),
    );
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe('abc');
    expect(body.get('code_verifier')).toBe('ver');
  });

  it('builds the refresh-token body', () => {
    const body = new URLSearchParams(buildRefreshTokenBody({ refreshToken: 'rt', clientId: 'c1' }));
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('refresh_token')).toBe('rt');
  });
});

describe('parseTokenResponse', () => {
  it('maps a token response and computes expiresAt', () => {
    const tokens = parseTokenResponse(
      { access_token: 'at', refresh_token: 'rt', token_type: 'Bearer', expires_in: 3600, scope: 'openid' },
      1_000,
    );
    expect(tokens).toEqual({
      accessToken: 'at',
      tokenType: 'Bearer',
      refreshToken: 'rt',
      scope: 'openid',
      idToken: undefined,
      expiresAt: 1_000 + 3_600_000,
    });
  });

  it('throws when access_token is missing', () => {
    expect(() => parseTokenResponse({ token_type: 'Bearer' })).toThrow(/access_token/);
    expect(() => parseTokenResponse(null)).toThrow(/Invalid token response/);
  });
});
