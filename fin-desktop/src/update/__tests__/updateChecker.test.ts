import { describe, it, expect, vi } from 'vitest';
import { checkForUpdate, rolloutBucket, UpdateController } from '../updateChecker';
import type { UpdateFeed, ReleaseInfo } from '../updateChecker';

function release(version: string, extra: Partial<ReleaseInfo> = {}): ReleaseInfo {
  return { version, channel: 'stable', url: `https://dl/${version}`, ...extra };
}

const FEED: UpdateFeed = {
  releases: [
    release('1.0.0'),
    release('1.1.0'),
    release('1.2.0'),
    release('2.0.0-beta.1', { channel: 'beta' }),
    release('2.0.0-beta.2', { channel: 'beta' }),
  ],
};

describe('checkForUpdate', () => {
  it('finds the highest newer release on the channel', () => {
    const result = checkForUpdate('1.0.0', FEED);
    expect(result.available).toBe(true);
    expect(result.release?.version).toBe('1.2.0');
    expect(result.reason).toBe('update-available');
  });

  it('reports up-to-date when nothing is newer', () => {
    const result = checkForUpdate('1.2.0', FEED);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('up-to-date');
  });

  it('respects the selected channel', () => {
    const result = checkForUpdate('1.2.0', FEED, { channel: 'beta' });
    expect(result.release?.version).toBe('2.0.0-beta.2');
  });

  it('reports no-releases for an unknown channel', () => {
    expect(checkForUpdate('1.0.0', FEED, { channel: 'nightly' }).reason).toBe('no-releases');
  });

  it('holds a release back for machines outside the rollout bucket', () => {
    const staged: UpdateFeed = { releases: [release('1.3.0', { rolloutPercentage: 0 })] };
    const result = checkForUpdate('1.2.0', staged, { machineId: 'm-1' });
    expect(result.available).toBe(false);
    expect(result.reason).toBe('held-by-rollout');
  });

  it('delivers a staged release to machines inside the bucket', () => {
    const staged: UpdateFeed = { releases: [release('1.3.0', { rolloutPercentage: 100 })] };
    expect(checkForUpdate('1.2.0', staged, { machineId: 'm-1' }).available).toBe(true);
  });

  it('mandatory releases bypass staged rollout', () => {
    const staged: UpdateFeed = { releases: [release('1.3.0', { rolloutPercentage: 0, mandatory: true })] };
    const result = checkForUpdate('1.2.0', staged, { machineId: 'm-1' });
    expect(result.available).toBe(true);
    expect(result.mandatory).toBe(true);
  });

  it('rolloutBucket is deterministic and in range', () => {
    const a = rolloutBucket('machine-x', '1.3.0');
    const b = rolloutBucket('machine-x', '1.3.0');
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(100);
  });
});

describe('UpdateController', () => {
  it('installs via the injected installer and tracks versions', () => {
    const installer = { install: vi.fn() };
    const ctrl = new UpdateController('1.0.0', installer);
    ctrl.install(release('1.1.0'));
    expect(installer.install).toHaveBeenCalled();
    expect(ctrl.getCurrentVersion()).toBe('1.1.0');
    expect(ctrl.getPreviousVersion()).toBe('1.0.0');
    expect(ctrl.canRollback()).toBe(true);
  });

  it('rolls back to the previous version once', () => {
    const ctrl = new UpdateController('1.0.0');
    ctrl.install(release('1.1.0'));
    expect(ctrl.rollback()).toBe('1.0.0');
    expect(ctrl.getCurrentVersion()).toBe('1.0.0');
    expect(ctrl.canRollback()).toBe(false);
    expect(ctrl.rollback()).toBeNull();
  });
});
