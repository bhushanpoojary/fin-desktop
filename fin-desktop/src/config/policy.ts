/**
 * Group policy / centralized config enforcement.
 *
 * Admins lock certain config keys so user settings cannot override them (Windows Group Policy /
 * MDM style). `PolicyStore.resolve` returns the locked value when present, otherwise the user's
 * value, otherwise a policy default. Pure and framework-agnostic — a real MDM/registry reader just
 * supplies the policy object.
 */

export interface GroupPolicy {
  /** Keys whose values are enforced and cannot be overridden by the user. */
  locked?: Record<string, unknown>;
  /** Fallback values applied when neither a lock nor a user value exists. */
  defaults?: Record<string, unknown>;
}

export class PolicyStore {
  private readonly locked: Record<string, unknown>;
  private readonly defaults: Record<string, unknown>;

  constructor(policy: GroupPolicy = {}) {
    this.locked = { ...(policy.locked ?? {}) };
    this.defaults = { ...(policy.defaults ?? {}) };
  }

  isLocked(key: string): boolean {
    return key in this.locked;
  }

  lockedKeys(): string[] {
    return Object.keys(this.locked);
  }

  /** Enforced value for a key: locked > user > policy default > fallback. */
  resolve<T = unknown>(key: string, userValue?: T, fallback?: T): T {
    if (key in this.locked) return this.locked[key] as T;
    if (userValue !== undefined) return userValue;
    if (key in this.defaults) return this.defaults[key] as T;
    return fallback as T;
  }

  /** Merge a user config under policy: locked keys win, defaults fill gaps. */
  apply(userConfig: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...this.defaults, ...userConfig, ...this.locked };
  }
}
