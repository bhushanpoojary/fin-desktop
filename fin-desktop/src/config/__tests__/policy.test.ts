import { describe, it, expect } from 'vitest';
import { PolicyStore } from '../policy';

describe('PolicyStore', () => {
  it('enforces locked values over user values', () => {
    const policy = new PolicyStore({ locked: { updateChannel: 'stable' } });
    expect(policy.isLocked('updateChannel')).toBe(true);
    expect(policy.resolve('updateChannel', 'beta')).toBe('stable');
  });

  it('falls back user > default > fallback for unlocked keys', () => {
    const policy = new PolicyStore({ defaults: { theme: 'dark' } });
    expect(policy.resolve('theme', 'light')).toBe('light'); // user wins
    expect(policy.resolve('theme')).toBe('dark'); // default
    expect(policy.resolve('missing', undefined, 'fb')).toBe('fb');
  });

  it('lists locked keys', () => {
    const policy = new PolicyStore({ locked: { a: 1, b: 2 } });
    expect(policy.lockedKeys().sort()).toEqual(['a', 'b']);
  });

  it('apply merges defaults < user < locked', () => {
    const policy = new PolicyStore({ locked: { telemetry: true }, defaults: { theme: 'dark', telemetry: false } });
    expect(policy.apply({ theme: 'light', telemetry: false })).toEqual({ theme: 'light', telemetry: true });
  });

  it('is empty-safe', () => {
    const policy = new PolicyStore();
    expect(policy.lockedKeys()).toEqual([]);
    expect(policy.apply()).toEqual({});
    expect(policy.resolve('x', 'y')).toBe('y');
  });
});
