/**
 * DockingManager - Window Docking Engine
 * 
 * Provides magnetic snapping and docking behavior for workspace windows.
 * This is a pure computation module - no DOM manipulation or React state.
 * 
 * Features:
 * - Edge snapping (workspace boundaries)
 * - Window-to-window snapping
 * - Docking preview calculations
 * - Magnetic alignment with configurable threshold
 */

export interface WindowLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive?: boolean;
}

export interface DockingResult {
  x: number;
  y: number;
  width: number;
  height: number;
  dockTargetId?: string; // id of window we docked to (if any)
  dockPosition?: 'left' | 'right' | 'top' | 'bottom' | 'center';
}

export interface WorkspaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Edge detection result for workspace boundaries
 */
interface EdgeProximity {
  edge: 'left' | 'right' | 'top' | 'bottom' | null;
  distance: number;
}

/**
 * Window-to-window docking opportunity
 */
interface WindowDockOpportunity {
  targetId: string;
  position: 'left' | 'right' | 'top' | 'bottom' | 'center';
  x: number;
  y: number;
  width: number;
  height: number;
  score: number; // lower is better (distance-based)
}

/**
 * Compute docking preview for a dragging window
 * 
 * @param draggingWindow - The window currently being dragged
 * @param otherWindows - All other windows in the workspace
 * @param workspaceRect - The workspace container bounds
 * @param snapThreshold - Distance in pixels to trigger snapping (default: 16)
 * @returns DockingResult if docking should occur, null otherwise
 */
export function computeDockingPreview(
  draggingWindow: WindowLayout,
  otherWindows: WindowLayout[],
  workspaceRect: WorkspaceRect,
  snapThreshold: number = 16
): DockingResult | null {
  // First check workspace edge snapping (higher priority)
  const edgeResult = checkWorkspaceEdgeSnap(draggingWindow, workspaceRect, snapThreshold);
  if (edgeResult) {
    return edgeResult;
  }

  // Then check window-to-window snapping
  const windowResult = checkWindowSnap(draggingWindow, otherWindows, workspaceRect, snapThreshold);
  if (windowResult) {
    return windowResult;
  }

  return null;
}

/**
 * Check if the dragging window should snap to workspace edges
 */
function checkWorkspaceEdgeSnap(
  window: WindowLayout,
  workspace: WorkspaceRect,
  threshold: number
): DockingResult | null {
  const proximity = getWorkspaceEdgeProximity(window, workspace);

  if (proximity.edge && proximity.distance <= threshold) {
    return createEdgeDockResult(proximity.edge, workspace);
  }

  return null;
}

/**
 * Get the closest workspace edge and distance
 */
function getWorkspaceEdgeProximity(
  window: WindowLayout,
  workspace: WorkspaceRect
): EdgeProximity {
  const distances = {
    left: Math.abs(window.x - workspace.x),
    right: Math.abs((window.x + window.width) - (workspace.x + workspace.width)),
    top: Math.abs(window.y - workspace.y),
    bottom: Math.abs((window.y + window.height) - (workspace.y + workspace.height)),
  };

  // Find minimum distance
  let minEdge: 'left' | 'right' | 'top' | 'bottom' | null = null;
  let minDistance = Infinity;

  for (const [edge, distance] of Object.entries(distances)) {
    if (distance < minDistance) {
      minDistance = distance;
      minEdge = edge as 'left' | 'right' | 'top' | 'bottom';
    }
  }

  return { edge: minEdge, distance: minDistance };
}

/**
 * Create docking result for workspace edge snap
 */
function createEdgeDockResult(
  edge: 'left' | 'right' | 'top' | 'bottom',
  workspace: WorkspaceRect
): DockingResult {
  const halfWidth = Math.floor(workspace.width / 2);
  const halfHeight = Math.floor(workspace.height / 2);

  switch (edge) {
    case 'left':
      return {
        x: workspace.x,
        y: workspace.y,
        width: halfWidth,
        height: workspace.height,
        dockPosition: 'left',
      };

    case 'right':
      return {
        x: workspace.x + halfWidth,
        y: workspace.y,
        width: workspace.width - halfWidth,
        height: workspace.height,
        dockPosition: 'right',
      };

    case 'top':
      return {
        x: workspace.x,
        y: workspace.y,
        width: workspace.width,
        height: halfHeight,
        dockPosition: 'top',
      };

    case 'bottom':
      return {
        x: workspace.x,
        y: workspace.y + halfHeight,
        width: workspace.width,
        height: workspace.height - halfHeight,
        dockPosition: 'bottom',
      };
  }
}

/**
 * Check if the dragging window should snap to another window
 */
function checkWindowSnap(
  draggingWindow: WindowLayout,
  otherWindows: WindowLayout[],
  workspace: WorkspaceRect,
  threshold: number
): DockingResult | null {
  const opportunities: WindowDockOpportunity[] = [];

  for (const target of otherWindows) {
    // Skip if it's the same window
    if (target.id === draggingWindow.id) {
      continue;
    }

    // Check all docking positions for this target window
    const leftSnap = checkLeftDock(draggingWindow, target, workspace, threshold);
    const rightSnap = checkRightDock(draggingWindow, target, workspace, threshold);
    const topSnap = checkTopDock(draggingWindow, target, workspace, threshold);
    const bottomSnap = checkBottomDock(draggingWindow, target, workspace, threshold);
    const centerSnap = checkCenterDock(draggingWindow, target, threshold);

    if (leftSnap) opportunities.push(leftSnap);
    if (rightSnap) opportunities.push(rightSnap);
    if (topSnap) opportunities.push(topSnap);
    if (bottomSnap) opportunities.push(bottomSnap);
    if (centerSnap) opportunities.push(centerSnap);
  }

  // Return the best opportunity (lowest score/closest)
  if (opportunities.length > 0) {
    const best = opportunities.reduce((prev, curr) => 
      curr.score < prev.score ? curr : prev
    );

    return {
      x: best.x,
      y: best.y,
      width: best.width,
      height: best.height,
      dockTargetId: best.targetId,
      dockPosition: best.position,
    };
  }

  return null;
}

/**
 * Check if dragging window can dock to the left of target
 */
function checkLeftDock(
  dragging: WindowLayout,
  target: WindowLayout,
  workspace: WorkspaceRect,
  threshold: number
): WindowDockOpportunity | null {
  const draggingRight = dragging.x + dragging.width;
  const targetLeft = target.x;
  const distance = Math.abs(draggingRight - targetLeft);

  // Check if we're close to the left edge of target
  if (distance > threshold) {
    return null;
  }

  // Check if windows are vertically aligned (overlapping Y ranges)
  const draggingTop = dragging.y;
  const draggingBottom = dragging.y + dragging.height;
  const targetTop = target.y;
  const targetBottom = target.y + target.height;

  const hasVerticalOverlap = 
    (draggingTop < targetBottom && draggingBottom > targetTop);

  if (!hasVerticalOverlap) {
    return null;
  }

  // Calculate docked position: align to left of target, match its height
  return {
    targetId: target.id,
    position: 'left',
    x: Math.max(workspace.x, target.x - dragging.width),
    y: target.y,
    width: dragging.width,
    height: target.height,
    score: distance,
  };
}

/**
 * Check if dragging window can dock to the right of target
 */
function checkRightDock(
  dragging: WindowLayout,
  target: WindowLayout,
  workspace: WorkspaceRect,
  threshold: number
): WindowDockOpportunity | null {
  const draggingLeft = dragging.x;
  const targetRight = target.x + target.width;
  const distance = Math.abs(draggingLeft - targetRight);

  if (distance > threshold) {
    return null;
  }

  const draggingTop = dragging.y;
  const draggingBottom = dragging.y + dragging.height;
  const targetTop = target.y;
  const targetBottom = target.y + target.height;

  const hasVerticalOverlap = 
    (draggingTop < targetBottom && draggingBottom > targetTop);

  if (!hasVerticalOverlap) {
    return null;
  }

  const maxX = workspace.x + workspace.width;
  return {
    targetId: target.id,
    position: 'right',
    x: Math.min(targetRight, maxX - dragging.width),
    y: target.y,
    width: dragging.width,
    height: target.height,
    score: distance,
  };
}

/**
 * Check if dragging window can dock to the top of target
 */
function checkTopDock(
  dragging: WindowLayout,
  target: WindowLayout,
  workspace: WorkspaceRect,
  threshold: number
): WindowDockOpportunity | null {
  const draggingBottom = dragging.y + dragging.height;
  const targetTop = target.y;
  const distance = Math.abs(draggingBottom - targetTop);

  if (distance > threshold) {
    return null;
  }

  const draggingLeft = dragging.x;
  const draggingRight = dragging.x + dragging.width;
  const targetLeft = target.x;
  const targetRight = target.x + target.width;

  const hasHorizontalOverlap = 
    (draggingLeft < targetRight && draggingRight > targetLeft);

  if (!hasHorizontalOverlap) {
    return null;
  }

  return {
    targetId: target.id,
    position: 'top',
    x: target.x,
    y: Math.max(workspace.y, target.y - dragging.height),
    width: target.width,
    height: dragging.height,
    score: distance,
  };
}

/**
 * Check if dragging window can dock to the bottom of target
 */
function checkBottomDock(
  dragging: WindowLayout,
  target: WindowLayout,
  workspace: WorkspaceRect,
  threshold: number
): WindowDockOpportunity | null {
  const draggingTop = dragging.y;
  const targetBottom = target.y + target.height;
  const distance = Math.abs(draggingTop - targetBottom);

  if (distance > threshold) {
    return null;
  }

  const draggingLeft = dragging.x;
  const draggingRight = dragging.x + dragging.width;
  const targetLeft = target.x;
  const targetRight = target.x + target.width;

  const hasHorizontalOverlap = 
    (draggingLeft < targetRight && draggingRight > targetLeft);

  if (!hasHorizontalOverlap) {
    return null;
  }

  const maxY = workspace.y + workspace.height;
  return {
    targetId: target.id,
    position: 'bottom',
    x: target.x,
    y: Math.min(targetBottom, maxY - dragging.height),
    width: target.width,
    height: dragging.height,
    score: distance,
  };
}

/**
 * Check if dragging window can dock centered on top of target (tabbed/overlay)
 */
function checkCenterDock(
  dragging: WindowLayout,
  target: WindowLayout,
  threshold: number
): WindowDockOpportunity | null {
  // Calculate centers
  const draggingCenterX = dragging.x + dragging.width / 2;
  const draggingCenterY = dragging.y + dragging.height / 2;
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;

  // Check if centers are close
  const centerDistanceX = Math.abs(draggingCenterX - targetCenterX);
  const centerDistanceY = Math.abs(draggingCenterY - targetCenterY);
  const centerDistance = Math.sqrt(centerDistanceX ** 2 + centerDistanceY ** 2);

  if (centerDistance > threshold * 2) {
    return null;
  }

  // Check if there's significant overlap (at least 70%)
  const overlapArea = calculateOverlapArea(dragging, target);
  const draggingArea = dragging.width * dragging.height;
  const overlapPercentage = overlapArea / draggingArea;

  if (overlapPercentage < 0.7) {
    return null;
  }

  // Return centered position matching target dimensions
  return {
    targetId: target.id,
    position: 'center',
    x: target.x,
    y: target.y,
    width: target.width,
    height: target.height,
    score: centerDistance,
  };
}

/**
 * Calculate the overlapping area between two windows
 */
function calculateOverlapArea(w1: WindowLayout, w2: WindowLayout): number {
  const x1 = Math.max(w1.x, w2.x);
  const y1 = Math.max(w1.y, w2.y);
  const x2 = Math.min(w1.x + w1.width, w2.x + w2.width);
  const y2 = Math.min(w1.y + w1.height, w2.y + w2.height);

  if (x2 <= x1 || y2 <= y1) {
    return 0; // No overlap
  }

  return (x2 - x1) * (y2 - y1);
}

/**
 * Helper: Check if a point is within threshold of a value
 */
export function isNearby(value: number, target: number, threshold: number): boolean {
  return Math.abs(value - target) <= threshold;
}

/**
 * Helper: Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Helper: Calculate the distance between two rectangles
 */
export function calculateRectDistance(
  r1: Pick<WindowLayout, 'x' | 'y' | 'width' | 'height'>,
  r2: Pick<WindowLayout, 'x' | 'y' | 'width' | 'height'>
): number {
  const dx = Math.max(
    r1.x - (r2.x + r2.width),
    r2.x - (r1.x + r1.width),
    0
  );
  const dy = Math.max(
    r1.y - (r2.y + r2.height),
    r2.y - (r1.y + r1.height),
    0
  );
  return Math.sqrt(dx * dx + dy * dy);
}
