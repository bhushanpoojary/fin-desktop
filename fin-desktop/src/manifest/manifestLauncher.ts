/**
 * Manifest launcher — spawns a window/platform from a validated manifest.
 *
 * Ties the manifest + security models together: the manifest's declared `permissions.domains`
 * becomes the Platform's `canOpenUrl` guard automatically (the app's own startup URL is always
 * permitted). Pure — operates on an injected Platform instance.
 */

import type { Platform, Rect } from '../platform';
import { isUrlAllowed, parseHost } from '../security';
import { isAppManifest, type Manifest, type WindowOptions } from './manifest';

const DEFAULT_BOUNDS: Rect = { x: 120, y: 100, width: 1200, height: 800 };

export interface LaunchResult {
  type: 'application' | 'platform';
  windowId?: string;
  viewIds: string[];
}

export interface LaunchOptions {
  bounds?: Rect;
}

export function windowBoundsFromOptions(
  options: WindowOptions | undefined,
  fallback: Rect = DEFAULT_BOUNDS,
): Rect {
  return {
    x: options?.defaultLeft ?? fallback.x,
    y: options?.defaultTop ?? fallback.y,
    width: options?.defaultWidth ?? fallback.width,
    height: options?.defaultHeight ?? fallback.height,
  };
}

/**
 * Build a URL guard from a manifest's declared domains (undefined ⇒ unrestricted).
 * The app's own startup URL host is always permitted.
 */
export function manifestGuard(
  manifest: Manifest,
  alwaysAllowUrl?: string,
): ((url: string) => boolean) | undefined {
  const domains = manifest.permissions?.domains;
  if (!domains) return undefined;
  const allowedHost = alwaysAllowUrl ? parseHost(alwaysAllowUrl) : null;
  return (url) => {
    if (allowedHost && parseHost(url) === allowedHost) return true;
    return isUrlAllowed(url, domains);
  };
}

/** Launch a manifest on the given Platform. */
export function launchManifest(
  platform: Platform,
  manifest: Manifest,
  options: LaunchOptions = {},
): LaunchResult {
  if (isAppManifest(manifest)) {
    const startup = manifest.startupApp;
    const bounds = windowBoundsFromOptions(startup.windowOptions, options.bounds);
    const win = platform.createWindow(bounds, { canOpenUrl: manifestGuard(manifest, startup.url) });
    const viewId = win.addView(startup.url);
    return { type: 'application', windowId: win.id, viewIds: [viewId] };
  }

  // Platform manifest: restore a saved snapshot if present, else open an empty window.
  if (manifest.snapshot) {
    platform.applySnapshot(manifest.snapshot);
    const win = platform.listWindows()[0];
    return {
      type: 'platform',
      windowId: win?.id,
      viewIds: win ? win.listViews().map((v) => v.id) : [],
    };
  }
  const bounds = windowBoundsFromOptions(manifest.platform.defaultWindowOptions, options.bounds);
  const win = platform.createWindow(bounds, { canOpenUrl: manifestGuard(manifest) });
  return { type: 'platform', windowId: win.id, viewIds: [] };
}
