/**
 * Snap & dock geometry.
 *
 * Pure math for magnetic window snapping and half-screen edge docking. The Electron
 * runtime calls these during window drag to compute snapped bounds; keeping the math
 * here makes it deterministic and unit-testable.
 */

import type { Rect } from '../types';

export type DockZone = 'left' | 'right' | 'maximize' | 'none';

export interface SnappedEdges {
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
}

export interface SnapResult {
  rect: Rect;
  snapped: SnappedEdges;
}

function nearestCandidate(
  value: number,
  candidates: number[],
  threshold: number,
): { value: number; delta: number } | null {
  let best: { value: number; delta: number } | null = null;
  for (const c of candidates) {
    const delta = Math.abs(value - c);
    if (delta <= threshold && (best === null || delta < best.delta)) {
      best = { value: c, delta };
    }
  }
  return best;
}

/**
 * Snap a moving window's position (size preserved) to the work area edges and to the
 * edges of other windows, when within `threshold` pixels.
 */
export function snapRect(
  moving: Rect,
  targets: Rect[],
  workArea: Rect,
  threshold: number,
): SnapResult {
  const snapped: SnappedEdges = {};

  const xCandidates = [workArea.x, workArea.x + workArea.width];
  const yCandidates = [workArea.y, workArea.y + workArea.height];
  for (const t of targets) {
    xCandidates.push(t.x, t.x + t.width);
    yCandidates.push(t.y, t.y + t.height);
  }

  // Horizontal: consider snapping the left or right edge, whichever is closest.
  let x = moving.x;
  const left = nearestCandidate(moving.x, xCandidates, threshold);
  const right = nearestCandidate(moving.x + moving.width, xCandidates, threshold);
  if (left && (!right || left.delta <= right.delta)) {
    x = left.value;
    snapped.left = true;
  } else if (right) {
    x = right.value - moving.width;
    snapped.right = true;
  }

  // Vertical: consider snapping the top or bottom edge.
  let y = moving.y;
  const top = nearestCandidate(moving.y, yCandidates, threshold);
  const bottom = nearestCandidate(moving.y + moving.height, yCandidates, threshold);
  if (top && (!bottom || top.delta <= bottom.delta)) {
    y = top.value;
    snapped.top = true;
  } else if (bottom) {
    y = bottom.value - moving.height;
    snapped.bottom = true;
  }

  return { rect: { x, y, width: moving.width, height: moving.height }, snapped };
}

/**
 * Detect an OS-style half-screen dock zone when a window is dragged near a screen edge.
 * Left edge → left half, right edge → right half, top edge → maximize.
 */
export function detectDockZone(
  moving: Rect,
  workArea: Rect,
  threshold: number,
): DockZone {
  const nearTop = moving.y - workArea.y <= threshold;
  if (nearTop) return 'maximize';

  const nearLeft = moving.x - workArea.x <= threshold;
  if (nearLeft) return 'left';

  const nearRight = workArea.x + workArea.width - (moving.x + moving.width) <= threshold;
  if (nearRight) return 'right';

  return 'none';
}

/** The target bounds for a given dock zone within the work area. */
export function dockZoneBounds(zone: DockZone, workArea: Rect): Rect {
  switch (zone) {
    case 'left':
      return {
        x: workArea.x,
        y: workArea.y,
        width: Math.round(workArea.width / 2),
        height: workArea.height,
      };
    case 'right': {
      const half = Math.round(workArea.width / 2);
      return {
        x: workArea.x + workArea.width - half,
        y: workArea.y,
        width: half,
        height: workArea.height,
      };
    }
    case 'maximize':
      return { ...workArea };
    case 'none':
      return { ...workArea };
  }
}

/** Whether two rectangles share a touching vertical or horizontal edge within `tolerance`. */
export function areAdjacent(a: Rect, b: Rect, tolerance = 2): boolean {
  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;

  const verticalOverlap = Math.min(aBottom, bBottom) - Math.max(a.y, b.y) > 0;
  const horizontalOverlap = Math.min(aRight, bRight) - Math.max(a.x, b.x) > 0;

  const touchLeftRight =
    (Math.abs(aRight - b.x) <= tolerance || Math.abs(bRight - a.x) <= tolerance) &&
    verticalOverlap;
  const touchTopBottom =
    (Math.abs(aBottom - b.y) <= tolerance || Math.abs(bBottom - a.y) <= tolerance) &&
    horizontalOverlap;

  return touchLeftRight || touchTopBottom;
}
