/**
 * Platform snapshot model.
 *
 * A snapshot is a fully serializable description of platform state — every window, its
 * bounds, its hosted Views, and its layout tree. Snapshots power save/restore workspaces,
 * auto-restore of the last session, and workspace export/import.
 */

import type { Rect, ViewState, WindowId } from '../types';
import type { LayoutNode } from '../layout/layoutTree';

export const SNAPSHOT_VERSION = 1;

export interface WindowSnapshot {
  id: WindowId;
  bounds: Rect;
  views: ViewState[];
  layout: LayoutNode | null;
}

export interface PlatformSnapshot {
  version: number;
  createdAt: number;
  windows: WindowSnapshot[];
}

export function createSnapshot(
  windows: WindowSnapshot[],
  createdAt: number = Date.now(),
): PlatformSnapshot {
  return { version: SNAPSHOT_VERSION, createdAt, windows };
}

export function serializeSnapshot(snapshot: PlatformSnapshot): string {
  return JSON.stringify(snapshot);
}

function isRect(value: unknown): value is Rect {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.x === 'number' &&
    typeof r.y === 'number' &&
    typeof r.width === 'number' &&
    typeof r.height === 'number'
  );
}

export function isValidSnapshot(value: unknown): value is PlatformSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  if (typeof s.version !== 'number') return false;
  if (typeof s.createdAt !== 'number') return false;
  if (!Array.isArray(s.windows)) return false;
  return s.windows.every((w) => {
    if (typeof w !== 'object' || w === null) return false;
    const win = w as Record<string, unknown>;
    return (
      typeof win.id === 'string' &&
      isRect(win.bounds) &&
      Array.isArray(win.views) &&
      (win.layout === null || typeof win.layout === 'object')
    );
  });
}

/** Parse and validate a serialized snapshot. Throws on malformed or unsupported input. */
export function deserializeSnapshot(json: string): PlatformSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid snapshot: not valid JSON');
  }
  if (!isValidSnapshot(parsed)) {
    throw new Error('Invalid snapshot: unexpected shape');
  }
  if (parsed.version > SNAPSHOT_VERSION) {
    throw new Error(
      `Unsupported snapshot version ${parsed.version} (max supported ${SNAPSHOT_VERSION})`,
    );
  }
  return parsed;
}
