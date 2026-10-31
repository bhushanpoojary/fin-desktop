import { describe, it, expect } from 'vitest';
import { validateManifest } from '../validateManifest';
import { isAppManifest, isPlatformManifest, type Manifest } from '../manifest';

const validApp = {
  type: 'application',
  schemaVersion: '1',
  runtime: { version: '1.4.0' },
  startupApp: {
    appId: 'blotter',
    name: 'Trade Blotter',
    url: 'https://apps.example.com/blotter',
    windowOptions: { defaultWidth: 1200, defaultHeight: 800, frame: true },
  },
  permissions: { request: ['notifications', 'fdc3'], domains: { allow: ['*.example.com'] } },
};

const validPlatform = {
  type: 'platform',
  platform: { name: 'My Platform', defaultWindowOptions: { autoShow: true } },
};

describe('validateManifest', () => {
  it('accepts a valid application manifest', () => {
    const result = validateManifest(validApp);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(isAppManifest(result.manifest)).toBe(true);
      expect((result.manifest as Extract<Manifest, { type: 'application' }>).startupApp.appId).toBe('blotter');
    }
  });

  it('accepts a valid platform manifest', () => {
    const result = validateManifest(validPlatform);
    expect(result.ok).toBe(true);
    if (result.ok) expect(isPlatformManifest(result.manifest)).toBe(true);
  });

  it('rejects a non-object', () => {
    const result = validateManifest(42);
    expect(result).toEqual({ ok: false, errors: [{ path: '', message: expect.any(String) }] });
  });

  it('rejects an unknown type', () => {
    const result = validateManifest({ type: 'widget' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].path).toBe('type');
  });

  it('reports missing startupApp fields with paths', () => {
    const result = validateManifest({ type: 'application', startupApp: { appId: 'x' } });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain('startupApp.name');
      expect(paths).toContain('startupApp.url');
    }
  });

  it('requires a platform block for platform manifests', () => {
    const result = validateManifest({ type: 'platform' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].path).toBe('platform');
  });

  it('validates window option types', () => {
    const result = validateManifest({
      type: 'application',
      startupApp: {
        appId: 'a',
        name: 'A',
        url: 'https://a',
        windowOptions: { defaultWidth: 'big', frame: 'yes' },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain('startupApp.windowOptions.defaultWidth');
      expect(paths).toContain('startupApp.windowOptions.frame');
    }
  });

  it('validates permissions shape', () => {
    const result = validateManifest({
      type: 'application',
      startupApp: { appId: 'a', name: 'A', url: 'https://a' },
      permissions: { request: ['ok', 7], domains: { allow: 'nope' } },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain('permissions.request');
      expect(paths).toContain('permissions.domains.allow');
    }
  });

  it('validates runtime.version type', () => {
    const result = validateManifest({
      type: 'application',
      startupApp: { appId: 'a', name: 'A', url: 'https://a' },
      runtime: { version: 2 },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.map((e) => e.path)).toContain('runtime.version');
  });
});
