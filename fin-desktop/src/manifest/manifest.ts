/**
 * FinDesktop application manifest model.
 *
 * A declarative JSON description of an application or platform to launch (OpenFin-manifest
 * inspired): startup app + window options, runtime pinning, declared permissions, and — for
 * platform manifests — a saved snapshot to restore. Reuses the security + platform types.
 */

import type { ManifestPermissions } from '../security';
import type { PlatformSnapshot } from '../platform';

export type ManifestType = 'application' | 'platform';

export interface WindowOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  defaultLeft?: number;
  defaultTop?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  frame?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  alwaysOnTop?: boolean;
  autoShow?: boolean;
  backgroundColor?: string;
}

export interface RuntimeConfig {
  /** Runtime version to pin this manifest to (e.g. "1.4.0"). */
  version?: string;
}

export interface ManifestShortcut {
  name?: string;
  company?: string;
  description?: string;
  icon?: string;
}

export interface StartupApp {
  appId: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  windowOptions?: WindowOptions;
}

export interface AppManifest {
  type: 'application';
  schemaVersion?: string;
  runtime?: RuntimeConfig;
  startupApp: StartupApp;
  permissions?: ManifestPermissions;
  shortcut?: ManifestShortcut;
}

export interface PlatformManifest {
  type: 'platform';
  schemaVersion?: string;
  runtime?: RuntimeConfig;
  platform: {
    uuid?: string;
    name?: string;
    defaultWindowOptions?: WindowOptions;
    autoShow?: boolean;
  };
  /** Optional saved layout to restore on launch. */
  snapshot?: PlatformSnapshot;
  permissions?: ManifestPermissions;
  shortcut?: ManifestShortcut;
}

export type Manifest = AppManifest | PlatformManifest;

export function isAppManifest(manifest: Manifest): manifest is AppManifest {
  return manifest.type === 'application';
}

export function isPlatformManifest(manifest: Manifest): manifest is PlatformManifest {
  return manifest.type === 'platform';
}
