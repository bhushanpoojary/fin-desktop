/**
 * Exponential backoff for retries (update downloads, connectivity, token refresh).
 *
 * Pure and deterministic: `computeBackoff` returns the delay for an attempt (capped, with optional
 * injectable jitter); `RetryPolicy` tracks attempts and decides whether to retry. No timers here —
 * a caller awaits the returned delay.
 */

export interface BackoffOptions {
  baseMs?: number;
  factor?: number;
  maxMs?: number;
  /** 0–1 fraction of random jitter; `random` is injectable for deterministic tests. */
  jitter?: number;
  random?: () => number;
}

/** Delay (ms) for a zero-based `attempt`: min(base * factor^attempt, max), plus optional jitter. */
export function computeBackoff(attempt: number, options: BackoffOptions = {}): number {
  const base = options.baseMs ?? 200;
  const factor = options.factor ?? 2;
  const max = options.maxMs ?? 30_000;
  const n = Math.max(0, attempt);

  const raw = base * Math.pow(factor, n);
  let delay = Math.min(raw, max);

  if (options.jitter && options.jitter > 0) {
    const rand = (options.random ?? Math.random)();
    delay += delay * options.jitter * rand;
  }
  return Math.round(delay);
}

export interface RetryPolicyOptions extends BackoffOptions {
  maxAttempts?: number;
}

export class RetryPolicy {
  private attempt = 0;
  private readonly maxAttempts: number;
  private readonly options: BackoffOptions;

  constructor(options: RetryPolicyOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? 5;
    this.options = options;
  }

  getAttempt(): number {
    return this.attempt;
  }

  /** Whether another attempt is allowed. */
  canRetry(): boolean {
    return this.attempt < this.maxAttempts;
  }

  /** Record a failed attempt and return the delay before the next try, or null if exhausted. */
  nextDelay(): number | null {
    if (this.attempt >= this.maxAttempts) return null;
    const delay = computeBackoff(this.attempt, this.options);
    this.attempt += 1;
    return delay;
  }

  reset(): void {
    this.attempt = 0;
  }
}
