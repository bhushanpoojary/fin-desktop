import { describe, it, expect } from 'vitest';
import { computeBackoff, RetryPolicy } from '../backoff';

describe('computeBackoff', () => {
  it('grows exponentially from the base', () => {
    const o = { baseMs: 100, factor: 2, maxMs: 10_000 };
    expect(computeBackoff(0, o)).toBe(100);
    expect(computeBackoff(1, o)).toBe(200);
    expect(computeBackoff(2, o)).toBe(400);
    expect(computeBackoff(3, o)).toBe(800);
  });

  it('caps at maxMs', () => {
    expect(computeBackoff(10, { baseMs: 100, factor: 2, maxMs: 1000 })).toBe(1000);
  });

  it('adds deterministic jitter via injected random', () => {
    const delay = computeBackoff(0, { baseMs: 100, jitter: 0.5, random: () => 1 });
    expect(delay).toBe(150); // 100 + 100*0.5*1
  });

  it('treats negative attempts as zero', () => {
    expect(computeBackoff(-3, { baseMs: 100 })).toBe(100);
  });
});

describe('RetryPolicy', () => {
  it('returns increasing delays until exhausted', () => {
    const policy = new RetryPolicy({ maxAttempts: 3, baseMs: 100, factor: 2, maxMs: 10_000 });
    expect(policy.nextDelay()).toBe(100);
    expect(policy.nextDelay()).toBe(200);
    expect(policy.nextDelay()).toBe(400);
    expect(policy.canRetry()).toBe(false);
    expect(policy.nextDelay()).toBeNull();
  });

  it('resets attempts', () => {
    const policy = new RetryPolicy({ maxAttempts: 2, baseMs: 50 });
    policy.nextDelay();
    policy.reset();
    expect(policy.getAttempt()).toBe(0);
    expect(policy.canRetry()).toBe(true);
  });
});
