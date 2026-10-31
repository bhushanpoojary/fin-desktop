import { describe, it, expect } from 'vitest';
import { PermissionPolicy, type ManifestPermissions } from '../permissionPolicy';
import { Capabilities } from '../permissions';

const manifest: ManifestPermissions = {
  request: [Capabilities.Notifications, Capabilities.ClipboardWrite, Capabilities.FileSystemRead],
  domains: { allow: ['*.example.com'] },
};

describe('PermissionPolicy.resolve', () => {
  it('denies capabilities not declared in the manifest', () => {
    const policy = new PermissionPolicy({ default: 'granted' });
    expect(policy.resolve('app', manifest, Capabilities.ExternalProcess)).toBe('denied');
  });

  it('applies the policy default for declared capabilities', () => {
    const policy = new PermissionPolicy({ default: 'prompt' });
    expect(policy.resolve('app', manifest, Capabilities.Notifications)).toBe('prompt');
  });

  it('auto-grants capabilities in the granted list', () => {
    const policy = new PermissionPolicy({ granted: [Capabilities.Notifications] });
    expect(policy.resolve('app', manifest, Capabilities.Notifications)).toBe('granted');
  });

  it('requires a prompt for prompt-required capabilities', () => {
    const policy = new PermissionPolicy({
      default: 'granted',
      promptRequired: [Capabilities.FileSystemRead],
    });
    expect(policy.resolve('app', manifest, Capabilities.FileSystemRead)).toBe('prompt');
  });

  it('admin hard-deny wins over everything, even runtime grants', () => {
    const policy = new PermissionPolicy({ denied: [Capabilities.ClipboardWrite] });
    policy.grant('app', Capabilities.ClipboardWrite);
    expect(policy.resolve('app', manifest, Capabilities.ClipboardWrite)).toBe('denied');
  });

  it('runtime grant/deny overrides policy defaults', () => {
    const policy = new PermissionPolicy({ default: 'prompt' });
    policy.grant('app', Capabilities.Notifications);
    expect(policy.resolve('app', manifest, Capabilities.Notifications)).toBe('granted');

    policy.deny('app', Capabilities.Notifications);
    expect(policy.resolve('app', manifest, Capabilities.Notifications)).toBe('denied');
  });

  it('revoke falls back to the default', () => {
    const policy = new PermissionPolicy({ default: 'prompt' });
    policy.grant('app', Capabilities.Notifications);
    policy.revoke('app', Capabilities.Notifications);
    expect(policy.resolve('app', manifest, Capabilities.Notifications)).toBe('prompt');
  });

  it('grants are scoped per app', () => {
    const policy = new PermissionPolicy({ default: 'prompt' });
    policy.grant('appA', Capabilities.Notifications);
    expect(policy.resolve('appA', manifest, Capabilities.Notifications)).toBe('granted');
    expect(policy.resolve('appB', manifest, Capabilities.Notifications)).toBe('prompt');
  });
});

describe('PermissionPolicy.can / isDomainAllowed', () => {
  it('can() is true only when granted', () => {
    const policy = new PermissionPolicy({ default: 'prompt' });
    expect(policy.can('app', manifest, Capabilities.Notifications)).toBe(false);
    policy.grant('app', Capabilities.Notifications);
    expect(policy.can('app', manifest, Capabilities.Notifications)).toBe(true);
  });

  it('enforces the manifest domain allow-list', () => {
    const policy = new PermissionPolicy();
    expect(policy.isDomainAllowed(manifest, 'https://api.example.com')).toBe(true);
    expect(policy.isDomainAllowed(manifest, 'https://evil.com')).toBe(false);
  });

  it('treats a manifest without domains as unrestricted', () => {
    const policy = new PermissionPolicy();
    expect(policy.isDomainAllowed({ request: [] }, 'https://anywhere.com')).toBe(true);
  });
});
