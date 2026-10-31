import { describe, it, expect } from 'vitest';
import { matchDomain, parseHost, isUrlAllowed } from '../domainAllowList';

describe('matchDomain', () => {
  it('matches exact hosts (case-insensitive)', () => {
    expect(matchDomain('example.com', 'example.com')).toBe(true);
    expect(matchDomain('EXAMPLE.com', 'example.COM')).toBe(true);
    expect(matchDomain('other.com', 'example.com')).toBe(false);
  });

  it('matches wildcard *', () => {
    expect(matchDomain('anything.net', '*')).toBe(true);
  });

  it('matches *.domain for the apex and subdomains only', () => {
    expect(matchDomain('example.com', '*.example.com')).toBe(true);
    expect(matchDomain('api.example.com', '*.example.com')).toBe(true);
    expect(matchDomain('a.b.example.com', '*.example.com')).toBe(true);
    expect(matchDomain('notexample.com', '*.example.com')).toBe(false);
    expect(matchDomain('example.com.evil.com', '*.example.com')).toBe(false);
  });
});

describe('parseHost', () => {
  it('extracts the hostname', () => {
    expect(parseHost('https://api.example.com/path?q=1')).toBe('api.example.com');
  });

  it('returns null for an invalid URL', () => {
    expect(parseHost('not a url')).toBeNull();
  });
});

describe('isUrlAllowed', () => {
  it('allows everything when no lists are given', () => {
    expect(isUrlAllowed('https://x.com', {})).toBe(true);
  });

  it('enforces an allow-list', () => {
    const list = { allow: ['*.example.com'] };
    expect(isUrlAllowed('https://api.example.com', list)).toBe(true);
    expect(isUrlAllowed('https://evil.com', list)).toBe(false);
  });

  it('deny wins over allow', () => {
    const list = { allow: ['*.example.com'], deny: ['bad.example.com'] };
    expect(isUrlAllowed('https://good.example.com', list)).toBe(true);
    expect(isUrlAllowed('https://bad.example.com', list)).toBe(false);
  });

  it('rejects unparseable URLs', () => {
    expect(isUrlAllowed('nope', { allow: ['*'] })).toBe(false);
  });
});
