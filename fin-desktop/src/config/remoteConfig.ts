/**
 * Remote config + feature flags.
 *
 * `ConfigStore` layers values (defaults < remote push < local overrides) with typed getters and
 * change notifications. `FeatureFlags` evaluates flags with allow/deny targeting and a deterministic
 * staged rollout (reusing the update rollout bucket), so a given id consistently qualifies.
 * Pure and framework-agnostic — a real remote-config client just calls `setRemote` / `setFlags`.
 */

import { rolloutBucket } from '../update/updateChecker';

export type ConfigValue = unknown;

export interface ConfigStoreOptions {
  defaults?: Record<string, ConfigValue>;
  remote?: Record<string, ConfigValue>;
  onChange?: () => void;
}

export class ConfigStore {
  private readonly defaults: Record<string, ConfigValue>;
  private remote: Record<string, ConfigValue>;
  private readonly overrides = new Map<string, ConfigValue>();
  private readonly onChange?: () => void;

  constructor(options: ConfigStoreOptions = {}) {
    this.defaults = { ...(options.defaults ?? {}) };
    this.remote = { ...(options.remote ?? {}) };
    this.onChange = options.onChange;
  }

  /** Replace the remote layer (e.g. after fetching from a config service). */
  setRemote(values: Record<string, ConfigValue>): void {
    this.remote = { ...values };
    this.onChange?.();
  }

  setOverride(key: string, value: ConfigValue): void {
    this.overrides.set(key, value);
    this.onChange?.();
  }

  clearOverride(key: string): void {
    if (this.overrides.delete(key)) this.onChange?.();
  }

  has(key: string): boolean {
    return this.overrides.has(key) || key in this.remote || key in this.defaults;
  }

  /** Resolve a key: local override > remote > default > fallback. */
  get<T = ConfigValue>(key: string, fallback?: T): T {
    if (this.overrides.has(key)) return this.overrides.get(key) as T;
    if (key in this.remote) return this.remote[key] as T;
    if (key in this.defaults) return this.defaults[key] as T;
    return fallback as T;
  }

  getString(key: string, fallback = ''): string {
    const value = this.get(key, fallback);
    return value == null ? fallback : String(value);
  }

  getNumber(key: string, fallback = 0): number {
    const value = Number(this.get(key, fallback));
    return Number.isFinite(value) ? value : fallback;
  }

  getBoolean(key: string, fallback = false): boolean {
    const value = this.get<ConfigValue>(key, fallback);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true' || value === '1';
    return !!value;
  }

  /** The effective, merged configuration. */
  getAll(): Record<string, ConfigValue> {
    const merged: Record<string, ConfigValue> = { ...this.defaults, ...this.remote };
    for (const [key, value] of this.overrides) merged[key] = value;
    return merged;
  }

  /** Where a key's effective value comes from. */
  sourceOf(key: string): 'override' | 'remote' | 'default' | 'none' {
    if (this.overrides.has(key)) return 'override';
    if (key in this.remote) return 'remote';
    if (key in this.defaults) return 'default';
    return 'none';
  }
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  /** 0–100 staged rollout among non-targeted ids (defaults to 100 when enabled). */
  rolloutPercentage?: number;
  /** Ids always granted (bypass rollout). */
  allow?: string[];
  /** Ids always denied (highest priority). */
  deny?: string[];
}

export interface FlagContext {
  id?: string;
}

export class FeatureFlags {
  private readonly flags = new Map<string, FeatureFlag>();
  private readonly onChange?: () => void;

  constructor(flags: FeatureFlag[] = [], onChange?: () => void) {
    for (const flag of flags) this.flags.set(flag.key, flag);
    this.onChange = onChange;
  }

  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    this.onChange?.();
  }

  /** Replace all flags (e.g. a remote push). */
  setFlags(flags: FeatureFlag[]): void {
    this.flags.clear();
    for (const flag of flags) this.flags.set(flag.key, flag);
    this.onChange?.();
  }

  list(): FeatureFlag[] {
    return [...this.flags.values()];
  }

  /** Evaluate a flag for an optional targeting id. */
  isEnabled(key: string, context: FlagContext = {}): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;
    const id = context.id ?? 'anonymous';
    if (flag.deny?.includes(id)) return false;
    if (flag.allow?.includes(id)) return true;
    if (!flag.enabled) return false;
    const pct = flag.rolloutPercentage ?? 100;
    if (pct >= 100) return true;
    if (pct <= 0) return false;
    return rolloutBucket(id, flag.key) < pct;
  }
}
