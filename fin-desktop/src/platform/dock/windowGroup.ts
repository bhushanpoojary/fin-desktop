/**
 * Window grouping geometry.
 *
 * A group is a set of windows that move as a single unit (OpenFin-style docked groups).
 * These pure helpers compute the group's bounding box, translate every member by a delta,
 * and support tearing a window out of / adding one into a group.
 */

import type { Rect, WindowId } from '../types';

export type BoundsMap = Record<WindowId, Rect>;

/** The bounding box enclosing all rects, or null when there are none. */
export function unionBounds(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** The bounding box of the given group's members (members missing from the map are ignored). */
export function groupBounds(windowIds: WindowId[], bounds: BoundsMap): Rect | null {
  const rects = windowIds.map((id) => bounds[id]).filter((r): r is Rect => r !== undefined);
  return unionBounds(rects);
}

function translate(rect: Rect, dx: number, dy: number): Rect {
  return { x: rect.x + dx, y: rect.y + dy, width: rect.width, height: rect.height };
}

/**
 * Translate every member of the group by (dx, dy), returning a new bounds map.
 * Windows not in the group are left unchanged.
 */
export function moveGroup(
  bounds: BoundsMap,
  windowIds: WindowId[],
  dx: number,
  dy: number,
): BoundsMap {
  const members = new Set(windowIds);
  const next: BoundsMap = {};
  for (const [id, rect] of Object.entries(bounds)) {
    next[id] = members.has(id) ? translate(rect, dx, dy) : rect;
  }
  return next;
}

/** Remove a window from a group (tear-out), returning a new member list. */
export function tearOut(windowIds: WindowId[], windowId: WindowId): WindowId[] {
  return windowIds.filter((id) => id !== windowId);
}

/** Add a window to a group if not already a member, returning a new member list. */
export function addToGroup(windowIds: WindowId[], windowId: WindowId): WindowId[] {
  return windowIds.includes(windowId) ? windowIds : [...windowIds, windowId];
}
