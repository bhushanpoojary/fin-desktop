/**
 * FDC3 version negotiation — pick the highest FDC3 version both the agent and an app support.
 *
 * Pure helper backing `fdc3.getInfo()` version reporting and a provider/app handshake.
 */

import { compareSemver } from '../../update/semver';

/** FDC3 versions this agent implements, newest first. */
export const SUPPORTED_FDC3_VERSIONS = ['2.0', '1.2'] as const;

export type Fdc3Version = (typeof SUPPORTED_FDC3_VERSIONS)[number] | string;

/** Whether this agent supports `version`. */
export function supportsFdc3(version: string, supported: readonly string[] = SUPPORTED_FDC3_VERSIONS): boolean {
  return supported.includes(version);
}

/**
 * The highest version supported by both sides, or null when there is no overlap. `requested` is the
 * set an app can speak; `supported` defaults to this agent's versions.
 */
export function negotiateFdc3Version(
  requested: readonly string[],
  supported: readonly string[] = SUPPORTED_FDC3_VERSIONS,
): string | null {
  const common = requested.filter((v) => supported.includes(v));
  if (common.length === 0) return null;
  // Compare as semver after normalizing bare "2.0" -> "2.0.0".
  const norm = (v: string) => (/^\d+\.\d+$/.test(v) ? `${v}.0` : v);
  return common.reduce((best, v) => (compareSemver(norm(v), norm(best)) > 0 ? v : best));
}
