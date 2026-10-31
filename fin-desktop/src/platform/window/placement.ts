/**
 * Window placement & monitor utilities.
 *
 * Pure geometry for smart window placement: size constraints, aspect-ratio locking,
 * centering, clamping to a monitor's work area, cascading, and multi-monitor selection.
 * The Electron runtime uses these when creating/moving windows; keeping them pure makes
 * the behaviour deterministic and unit-testable.
 */

import type { Rect } from '../types';

export interface Size {
  width: number;
  height: number;
}

export interface SizeLimits {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/** A display/monitor described by its usable work area (and optional full bounds). */
export interface Monitor {
  id?: string | number;
  workArea: Rect;
  bounds?: Rect;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/** Constrain a size to optional min/max bounds (min wins over max on conflict). */
export function constrainSize(size: Size, limits: SizeLimits = {}): Size {
  let width = size.width;
  let height = size.height;
  if (limits.maxWidth !== undefined) width = Math.min(width, limits.maxWidth);
  if (limits.maxHeight !== undefined) height = Math.min(height, limits.maxHeight);
  if (limits.minWidth !== undefined) width = Math.max(width, limits.minWidth);
  if (limits.minHeight !== undefined) height = Math.max(height, limits.minHeight);
  return { width, height };
}

/**
 * Lock a size to an aspect ratio (`width / height`), keeping width and deriving height.
 * Throws for a non-positive ratio.
 */
export function applyAspectRatio(size: Size, ratio: number): Size {
  if (ratio <= 0) throw new Error('aspect ratio must be positive');
  return { width: size.width, height: Math.round(size.width / ratio) };
}

/** Center a window of `size` within a work area. */
export function centerIn(size: Size, workArea: Rect): Rect {
  return {
    x: Math.round(workArea.x + (workArea.width - size.width) / 2),
    y: Math.round(workArea.y + (workArea.height - size.height) / 2),
    width: size.width,
    height: size.height,
  };
}

/** Shrink and reposition a rect so it fits entirely inside the work area. */
export function clampToWorkArea(rect: Rect, workArea: Rect): Rect {
  const width = Math.min(rect.width, workArea.width);
  const height = Math.min(rect.height, workArea.height);
  return {
    x: clamp(rect.x, workArea.x, workArea.x + workArea.width - width),
    y: clamp(rect.y, workArea.y, workArea.y + workArea.height - height),
    width,
    height,
  };
}

/**
 * Cascading position for the Nth window, offset diagonally and wrapped so the window
 * always stays within the work area.
 */
export function cascade(index: number, size: Size, workArea: Rect, step = 30): Rect {
  const maxX = Math.max(0, workArea.width - size.width);
  const maxY = Math.max(0, workArea.height - size.height);
  const rawOffset = Math.max(0, index) * step;
  const offsetX = maxX > 0 ? rawOffset % (maxX + 1) : 0;
  const offsetY = maxY > 0 ? rawOffset % (maxY + 1) : 0;
  return {
    x: workArea.x + offsetX,
    y: workArea.y + offsetY,
    width: size.width,
    height: size.height,
  };
}

function intersectionArea(a: Rect, b: Rect): number {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return overlapX * overlapY;
}

/** The monitor whose work area contains the point, or null if none do. */
export function pickMonitorForPoint(
  point: { x: number; y: number },
  monitors: Monitor[],
): Monitor | null {
  for (const m of monitors) {
    const w = m.workArea;
    if (
      point.x >= w.x &&
      point.x < w.x + w.width &&
      point.y >= w.y &&
      point.y < w.y + w.height
    ) {
      return m;
    }
  }
  return null;
}

/** The monitor with the largest overlap with the rect (first monitor as fallback). */
export function pickMonitorForRect(rect: Rect, monitors: Monitor[]): Monitor | null {
  if (monitors.length === 0) return null;
  let best = monitors[0];
  let bestArea = -1;
  for (const m of monitors) {
    const area = intersectionArea(rect, m.workArea);
    if (area > bestArea) {
      bestArea = area;
      best = m;
    }
  }
  return best;
}
