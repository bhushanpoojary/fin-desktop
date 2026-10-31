import { describe, it, expect, vi } from 'vitest';
import { verifyManifestSignature, canonicalize } from '../manifestSignature';

describe('canonicalize', () => {
  it('produces stable, sorted-key JSON', () => {
    expect(canonicalize({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });
});

describe('verifyManifestSignature', () => {
  const manifest = { appId: 'chart', startupUrl: 'https://x' };

  it('returns ok when the verifier accepts the signature', () => {
    const verify = vi.fn(() => true);
    const result = verifyManifestSignature({ manifest, signature: 'sig', keyId: 'k1' }, verify);
    expect(result).toEqual({ valid: true, reason: 'ok' });
    expect(verify).toHaveBeenCalledWith(canonicalize(manifest), 'sig', 'k1');
  });

  it('rejects a bad signature', () => {
    const result = verifyManifestSignature({ manifest, signature: 'sig' }, () => false);
    expect(result).toEqual({ valid: false, reason: 'bad-signature' });
  });

  it('flags a missing signature without calling the verifier', () => {
    const verify = vi.fn(() => true);
    const result = verifyManifestSignature({ manifest, signature: '' }, verify);
    expect(result).toEqual({ valid: false, reason: 'missing-signature' });
    expect(verify).not.toHaveBeenCalled();
  });
});
