/**
 * Auto-update model — version channels + staged rollout, framework-agnostic.
 *
 * Pure: given the current version and an update feed, `checkForUpdate` picks the highest eligible
 * release on the chosen channel, honoring a staged rollout (a deterministic per-machine bucket so a
 * given device consistently qualifies) and mandatory updates. An `electron-updater` adapter can act
 * on the result; `UpdateController` adds install/rollback bookkeeping over an injectable installer.
 */

import { compareSemver, isNewer } from './semver';

export type UpdateChannel = 'stable' | 'beta' | 'alpha' | string;

export interface ReleaseInfo {
  version: string;
  channel: UpdateChannel;
  url: string;
  sha512?: string;
  notes?: string;
  mandatory?: boolean;
  /** 0–100; the percentage of machines the release is rolled out to (defaults to 100). */
  rolloutPercentage?: number;
  releaseDate?: string;
}

export interface UpdateFeed {
  releases: ReleaseInfo[];
}

export interface CheckOptions {
  channel?: UpdateChannel;
  /** Stable per-machine identifier used to compute the rollout bucket. */
  machineId?: string;
  /** Also accept same-or-lower rollout for mandatory releases (always true). */
}

export interface UpdateCheckResult {
  available: boolean;
  release?: ReleaseInfo;
  mandatory: boolean;
  reason: 'up-to-date' | 'update-available' | 'held-by-rollout' | 'no-releases';
}

/** Deterministic 0–99 bucket from a machine id + version (stable across checks). */
export function rolloutBucket(machineId: string, version: string): number {
  let hash = 2166136261;
  const input = `${machineId}@${version}`;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100;
}

function qualifiesForRollout(release: ReleaseInfo, machineId: string): boolean {
  const pct = release.rolloutPercentage ?? 100;
  if (pct >= 100) return true;
  if (pct <= 0) return false;
  return rolloutBucket(machineId, release.version) < pct;
}

/** Determine whether an update is available for `currentVersion` on the chosen channel. */
export function checkForUpdate(currentVersion: string, feed: UpdateFeed, options: CheckOptions = {}): UpdateCheckResult {
  const channel = options.channel ?? 'stable';
  const machineId = options.machineId ?? 'default';

  const candidates = feed.releases
    .filter((r) => r.channel === channel)
    .filter((r) => isNewer(r.version, currentVersion))
    .sort((a, b) => compareSemver(b.version, a.version));

  if (candidates.length === 0) {
    const hasAny = feed.releases.some((r) => r.channel === channel);
    return { available: false, mandatory: false, reason: hasAny ? 'up-to-date' : 'no-releases' };
  }

  // Mandatory releases bypass staged rollout.
  const eligible = candidates.find((r) => r.mandatory || qualifiesForRollout(r, machineId));
  if (!eligible) {
    return { available: false, mandatory: false, reason: 'held-by-rollout' };
  }
  return { available: true, release: eligible, mandatory: !!eligible.mandatory, reason: 'update-available' };
}

export interface Installer {
  install(release: ReleaseInfo): void;
}

/** Tracks installed/previous versions over an injectable installer, enabling rollback. */
export class UpdateController {
  private current: string;
  private previous: string | null = null;
  private readonly installer?: Installer;

  constructor(currentVersion: string, installer?: Installer) {
    this.current = currentVersion;
    this.installer = installer;
  }

  getCurrentVersion(): string {
    return this.current;
  }

  getPreviousVersion(): string | null {
    return this.previous;
  }

  canRollback(): boolean {
    return this.previous !== null;
  }

  /** Apply a release: run the installer and record the prior version for rollback. */
  install(release: ReleaseInfo): void {
    this.installer?.install(release);
    this.previous = this.current;
    this.current = release.version;
  }

  /** Revert to the previously-installed version. Returns the version rolled back to, or null. */
  rollback(): string | null {
    if (this.previous === null) return null;
    const target = this.previous;
    this.current = target;
    this.previous = null;
    return target;
  }
}
