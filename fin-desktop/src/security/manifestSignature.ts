/**
 * Manifest signature verification — a pure gate for code-signed manifests.
 *
 * The cryptographic check is an injectable boundary (`SignatureVerifier`) so this is testable with a
 * fake; a real adapter uses WebCrypto/Node to verify an RSA/ECDSA signature over the canonical JSON.
 */

export interface SignedManifest<T = unknown> {
  manifest: T;
  signature: string;
  keyId?: string;
}

export type SignatureVerifier = (payload: string, signature: string, keyId?: string) => boolean;

export interface VerificationResult {
  valid: boolean;
  reason: 'ok' | 'missing-signature' | 'bad-signature';
}

/** Canonical JSON used as the signed payload (stable key order). */
export function canonicalize(manifest: unknown): string {
  const sort = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sort);
    if (value && typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = sort((value as Record<string, unknown>)[k]);
          return acc;
        }, {});
    }
    return value;
  };
  return JSON.stringify(sort(manifest));
}

/** Verify a signed manifest. Returns `{ valid, reason }`; never throws. */
export function verifyManifestSignature<T>(signed: SignedManifest<T>, verify: SignatureVerifier): VerificationResult {
  if (!signed.signature) return { valid: false, reason: 'missing-signature' };
  const payload = canonicalize(signed.manifest);
  const ok = verify(payload, signed.signature, signed.keyId);
  return ok ? { valid: true, reason: 'ok' } : { valid: false, reason: 'bad-signature' };
}
