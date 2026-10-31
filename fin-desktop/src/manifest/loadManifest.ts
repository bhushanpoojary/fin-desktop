/**
 * Manifest loading.
 *
 * Fetches a manifest from a URL and validates it. `fetch` is injected so this is pure and
 * unit-testable and works in both renderer and main process.
 */

import type { Manifest } from './manifest';
import { validateManifest } from './validateManifest';

export interface FetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type FetchLike = (url: string) => Promise<FetchResponseLike>;

/** Fetch + validate a manifest. Throws on a non-OK response or an invalid manifest. */
export async function loadManifest(url: string, fetchFn: FetchLike): Promise<Manifest> {
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Failed to load manifest ${url}: ${res.status}`);
  }
  const result = validateManifest(await res.json());
  if (!result.ok) {
    const summary = result.errors.map((e) => `${e.path || '<root>'}: ${e.message}`).join('; ');
    throw new Error(`Invalid manifest ${url}: ${summary}`);
  }
  return result.manifest;
}
