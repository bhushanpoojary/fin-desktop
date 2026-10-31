/**
 * Dock drop-zone geometry.
 *
 * When a tab or window is dragged over a target pane, this computes which drop region the
 * pointer is in (edge → split, center → tabify) and the preview rectangle the GUI should
 * highlight. It maps directly onto the layout engine: edge regions become `splitStack`
 * directions, the center region becomes an `addView` (tabify).
 */

import type { Rect } from '../types';
import type { SplitDirection } from '../layout/layoutTree';

export type DropRegion = 'left' | 'right' | 'top' | 'bottom' | 'center';

export interface DropTarget {
  region: DropRegion;
  /** The rectangle the overlay should highlight to preview the drop. */
  preview: Rect;
}

function contains(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

/**
 * Determine the drop region + preview for a pointer over a target rect.
 * Returns null when the pointer is outside the target.
 *
 * `edgeFraction` is how deep (0–0.5) the edge bands reach; beyond them is the center
 * (tabify) region.
 */
export function computeDropTarget(
  pointer: { x: number; y: number },
  target: Rect,
  edgeFraction = 0.25,
): DropTarget | null {
  if (!contains(target, pointer.x, pointer.y)) return null;

  const relX = (pointer.x - target.x) / target.width;
  const relY = (pointer.y - target.y) / target.height;

  const distances: Record<DropRegion, number> = {
    left: relX,
    right: 1 - relX,
    top: relY,
    bottom: 1 - relY,
    center: Number.POSITIVE_INFINITY,
  };

  // Nearest edge, with a deterministic tie-order.
  const order: DropRegion[] = ['left', 'right', 'top', 'bottom'];
  let nearest: DropRegion = 'left';
  for (const region of order) {
    if (distances[region] < distances[nearest]) nearest = region;
  }

  if (distances[nearest] > edgeFraction) {
    return { region: 'center', preview: { ...target } };
  }

  return { region: nearest, preview: edgePreview(nearest, target) };
}

function edgePreview(region: DropRegion, target: Rect): Rect {
  const halfW = target.width / 2;
  const halfH = target.height / 2;
  switch (region) {
    case 'left':
      return { x: target.x, y: target.y, width: halfW, height: target.height };
    case 'right':
      return { x: target.x + halfW, y: target.y, width: halfW, height: target.height };
    case 'top':
      return { x: target.x, y: target.y, width: target.width, height: halfH };
    case 'bottom':
      return { x: target.x, y: target.y + halfH, width: target.width, height: halfH };
    case 'center':
      return { ...target };
  }
}

/** Map a drop region to a layout split direction; `center` (tabify) maps to null. */
export function dropRegionToSplitDirection(region: DropRegion): SplitDirection | null {
  switch (region) {
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    case 'top':
      return 'up';
    case 'bottom':
      return 'down';
    case 'center':
      return null;
  }
}
