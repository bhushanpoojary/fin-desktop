/**
 * Permission policy engine (API security).
 *
 * Resolves whether an application may use a capability by combining admin policy defaults,
 * the app's manifest-declared requests, and runtime grants/denials. Also enforces the app's
 * domain allow-list. Pure and deterministic.
 *
 * Resolution order (strongest first):
 *   1. admin hard-deny (policy `denied`)        → denied
 *   2. capability not declared in the manifest   → denied
 *   3. runtime grant/deny (user decision)        → that state
 *   4. admin auto-grant (policy `granted`)       → granted
 *   5. prompt-required (policy `promptRequired`) → prompt
 *   6. policy default (defaults to 'prompt')
 */

import type { Capability, PermissionState } from './permissions';
import { isUrlAllowed, type DomainAllowList } from './domainAllowList';

export interface ManifestPermissions {
  /** Capabilities the app declares it needs. */
  request?: Capability[];
  /** Domains the app is allowed to load/connect to. */
  domains?: DomainAllowList;
}

export interface PolicyDefaults {
  default?: PermissionState;
  /** Capabilities always denied, regardless of grants (admin lockdown). */
  denied?: Capability[];
  /** Capabilities auto-granted when declared. */
  granted?: Capability[];
  /** Capabilities that require a runtime prompt when declared. */
  promptRequired?: Capability[];
}

type GrantRecord = Map<Capability, PermissionState>;

export class PermissionPolicy {
  private readonly defaults: PolicyDefaults;
  private readonly grants = new Map<string, GrantRecord>();

  constructor(defaults: PolicyDefaults = {}) {
    this.defaults = defaults;
  }

  grant(appId: string, capability: Capability): void {
    this.set(appId, capability, 'granted');
  }

  deny(appId: string, capability: Capability): void {
    this.set(appId, capability, 'denied');
  }

  revoke(appId: string, capability: Capability): void {
    this.grants.get(appId)?.delete(capability);
  }

  getGrant(appId: string, capability: Capability): PermissionState | undefined {
    return this.grants.get(appId)?.get(capability);
  }

  /** Resolve the effective permission state for an app + capability. */
  resolve(appId: string, manifest: ManifestPermissions, capability: Capability): PermissionState {
    if (this.defaults.denied?.includes(capability)) return 'denied';
    if (!manifest.request?.includes(capability)) return 'denied';

    const runtime = this.getGrant(appId, capability);
    if (runtime) return runtime;

    if (this.defaults.granted?.includes(capability)) return 'granted';
    if (this.defaults.promptRequired?.includes(capability)) return 'prompt';
    return this.defaults.default ?? 'prompt';
  }

  /** Convenience: whether the app is allowed to use the capability right now. */
  can(appId: string, manifest: ManifestPermissions, capability: Capability): boolean {
    return this.resolve(appId, manifest, capability) === 'granted';
  }

  /** Whether the app may load/connect to a URL (no declared domains ⇒ unrestricted). */
  isDomainAllowed(manifest: ManifestPermissions, url: string): boolean {
    if (!manifest.domains) return true;
    return isUrlAllowed(url, manifest.domains);
  }

  private set(appId: string, capability: Capability, state: PermissionState): void {
    let record = this.grants.get(appId);
    if (!record) {
      record = new Map();
      this.grants.set(appId, record);
    }
    record.set(capability, state);
  }
}
