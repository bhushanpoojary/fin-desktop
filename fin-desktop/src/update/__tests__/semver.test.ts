import { describe, it, expect } from 'vitest';
import { parseSemver, compareSemver, isNewer, isPrerelease } from '../semver';

describe('semver', () => {
  it('parses major.minor.patch with optional prerelease', () => {
    expect(parseSemver('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: [] });
    expect(parseSemver('v2.0.0-beta.1')).toEqual({ major: 2, minor: 0, patch: 0, prerelease: ['beta', '1'] });
    expect(parseSemver('1.2.3+build.5')?.prerelease).toEqual([]);
    expect(parseSemver('not-a-version')).toBeNull();
  });

  it('orders releases by precedence', () => {
    expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
    expect(compareSemver('1.2.0', '1.1.9')).toBe(1);
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
  });

  it('sorts prereleases below their release and by identifiers', () => {
    expect(compareSemver('1.0.0-alpha', '1.0.0')).toBe(-1);
    expect(compareSemver('1.0.0-alpha', '1.0.0-beta')).toBe(-1);
    expect(compareSemver('1.0.0-alpha.1', '1.0.0-alpha.2')).toBe(-1);
    expect(compareSemver('1.0.0-alpha.1', '1.0.0-alpha')).toBe(1); // more identifiers
    expect(compareSemver('1.0.0-1', '1.0.0-alpha')).toBe(-1); // numeric < alphanumeric
  });

  it('exposes helpers', () => {
    expect(isNewer('2.0.0', '1.9.9')).toBe(true);
    expect(isNewer('1.0.0', '1.0.0')).toBe(false);
    expect(isPrerelease('1.0.0-rc.1')).toBe(true);
    expect(isPrerelease('1.0.0')).toBe(false);
  });
});
