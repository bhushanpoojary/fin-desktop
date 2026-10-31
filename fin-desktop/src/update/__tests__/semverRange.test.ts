import { describe, it, expect } from 'vitest';
import { satisfiesMin, maxSatisfying } from '../semver';

describe('satisfiesMin', () => {
  it('accepts equal or higher versions', () => {
    expect(satisfiesMin('1.2.0', '1.0.0')).toBe(true);
    expect(satisfiesMin('1.0.0', '1.0.0')).toBe(true);
    expect(satisfiesMin('0.9.0', '1.0.0')).toBe(false);
  });

  it('rejects invalid input', () => {
    expect(satisfiesMin('nope', '1.0.0')).toBe(false);
    expect(satisfiesMin('1.0.0', 'bad')).toBe(false);
  });
});

describe('maxSatisfying', () => {
  it('returns the highest version at or above the minimum', () => {
    expect(maxSatisfying(['1.0.0', '1.2.0', '2.0.0', '0.9.0'], '1.1.0')).toBe('2.0.0');
  });

  it('returns null when none qualify', () => {
    expect(maxSatisfying(['0.1.0', '0.9.0'], '1.0.0')).toBeNull();
  });
});
