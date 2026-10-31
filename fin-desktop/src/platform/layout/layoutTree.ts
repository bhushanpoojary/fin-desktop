/**
 * Layout tree engine.
 *
 * A window's content is a tree of `split` nodes (horizontal `row` / vertical `column`)
 * whose leaves are `stack` nodes. A stack is a tabbed group of Views. This mirrors the
 * model used by golden-layout / OpenFin layouts.
 *
 * All operations are pure and immutable: they return a new tree and never mutate the input.
 * Callers supply ids for newly created nodes so the engine stays deterministic and testable.
 */

import type { Rect, ViewId } from '../types';

export type Orientation = 'row' | 'column';
export type SplitDirection = 'left' | 'right' | 'up' | 'down';

/** A tabbed group of Views. Leaf of the layout tree. */
export interface StackNode {
  type: 'stack';
  id: string;
  viewIds: ViewId[];
  activeViewId: ViewId | null;
}

/** A horizontal or vertical split containing child nodes with relative sizes. */
export interface SplitNode {
  type: 'split';
  id: string;
  orientation: Orientation;
  children: LayoutNode[];
  /** Relative fractions, one per child, normalized to sum to 1. */
  sizes: number[];
}

export type LayoutNode = StackNode | SplitNode;

/** Normalize a sizes array to `count` entries summing to 1 (equal split when missing/invalid). */
export function normalizeSizes(sizes: number[] | undefined, count: number): number[] {
  if (count <= 0) return [];
  if (!sizes || sizes.length !== count) {
    return new Array(count).fill(1 / count);
  }
  const positive = sizes.map((s) => (Number.isFinite(s) && s > 0 ? s : 0));
  const sum = positive.reduce((a, b) => a + b, 0);
  if (sum <= 0) return new Array(count).fill(1 / count);
  return positive.map((s) => s / sum);
}

export function makeStack(
  id: string,
  viewIds: ViewId[] = [],
  activeViewId?: ViewId | null,
): StackNode {
  const views = [...viewIds];
  const active =
    activeViewId !== undefined
      ? activeViewId
      : views.length > 0
        ? views[views.length - 1]
        : null;
  return { type: 'stack', id, viewIds: views, activeViewId: active };
}

export function makeSplit(
  id: string,
  orientation: Orientation,
  children: LayoutNode[],
  sizes?: number[],
): SplitNode {
  return {
    type: 'split',
    id,
    orientation,
    children,
    sizes: normalizeSizes(sizes, children.length),
  };
}

/** Create a root layout from a single View. */
export function createRoot(stackId: string, viewId?: ViewId): StackNode {
  return makeStack(stackId, viewId ? [viewId] : []);
}

/** All stacks in the tree (depth-first). */
export function listStacks(node: LayoutNode | null): StackNode[] {
  if (!node) return [];
  if (node.type === 'stack') return [node];
  return node.children.flatMap(listStacks);
}

/** All view ids in the tree (depth-first, stack order). */
export function listViewIds(node: LayoutNode | null): ViewId[] {
  return listStacks(node).flatMap((s) => s.viewIds);
}

export function findStack(node: LayoutNode | null, stackId: string): StackNode | null {
  return listStacks(node).find((s) => s.id === stackId) ?? null;
}

export function findStackOfView(node: LayoutNode | null, viewId: ViewId): StackNode | null {
  return listStacks(node).find((s) => s.viewIds.includes(viewId)) ?? null;
}

/** Replace the node with id `targetId` using `replacer`, returning a new tree. */
function replaceNode(
  node: LayoutNode,
  targetId: string,
  replacer: (n: LayoutNode) => LayoutNode,
): LayoutNode {
  if (node.id === targetId) return replacer(node);
  if (node.type === 'split') {
    return {
      ...node,
      children: node.children.map((c) => replaceNode(c, targetId, replacer)),
    };
  }
  return node;
}

/** Append a View to an existing stack and make it active. */
export function addView(root: LayoutNode, stackId: string, viewId: ViewId): LayoutNode {
  return replaceNode(root, stackId, (n) => {
    if (n.type !== 'stack') return n;
    if (n.viewIds.includes(viewId)) return { ...n, activeViewId: viewId };
    return { ...n, viewIds: [...n.viewIds, viewId], activeViewId: viewId };
  });
}

/** Set the active View in whichever stack contains it. */
export function setActiveView(root: LayoutNode, viewId: ViewId): LayoutNode {
  const stack = findStackOfView(root, viewId);
  if (!stack) return root;
  return replaceNode(root, stack.id, (n) =>
    n.type === 'stack' ? { ...n, activeViewId: viewId } : n,
  );
}

/**
 * Split a stack, placing a new single-view stack beside it.
 * `left`/`right` create a row; `up`/`down` create a column.
 */
export function splitStack(
  root: LayoutNode,
  targetStackId: string,
  direction: SplitDirection,
  newViewId: ViewId,
  ids: { splitId: string; stackId: string },
): LayoutNode {
  const orientation: Orientation =
    direction === 'left' || direction === 'right' ? 'row' : 'column';
  const newStack = makeStack(ids.stackId, [newViewId]);
  const before = direction === 'left' || direction === 'up';

  return replaceNode(root, targetStackId, (n) => {
    const children = before ? [newStack, n] : [n, newStack];
    return makeSplit(ids.splitId, orientation, children, [0.5, 0.5]);
  });
}

/** Remove a View from any stack, fixing the active view, without pruning. */
function dropView(node: LayoutNode, viewId: ViewId): LayoutNode {
  if (node.type === 'stack') {
    if (!node.viewIds.includes(viewId)) return node;
    const viewIds = node.viewIds.filter((v) => v !== viewId);
    const activeViewId =
      node.activeViewId === viewId
        ? viewIds.length > 0
          ? viewIds[viewIds.length - 1]
          : null
        : node.activeViewId;
    return { ...node, viewIds, activeViewId };
  }
  return { ...node, children: node.children.map((c) => dropView(c, viewId)) };
}

/** Remove empty stacks and collapse single-child splits. Returns null if everything is gone. */
function prune(node: LayoutNode): LayoutNode | null {
  if (node.type === 'stack') {
    return node.viewIds.length > 0 ? node : null;
  }
  const kept: LayoutNode[] = [];
  const keptSizes: number[] = [];
  node.children.forEach((child, i) => {
    const pruned = prune(child);
    if (pruned) {
      kept.push(pruned);
      keptSizes.push(node.sizes[i] ?? 0);
    }
  });
  if (kept.length === 0) return null;
  if (kept.length === 1) return kept[0];
  return { ...node, children: kept, sizes: normalizeSizes(keptSizes, kept.length) };
}

/** Remove a View and tidy the tree. Returns null when the last View is removed. */
export function removeView(root: LayoutNode, viewId: ViewId): LayoutNode | null {
  return prune(dropView(root, viewId));
}

/** Move a View into another stack (removing it from its current stack). */
export function moveView(root: LayoutNode, viewId: ViewId, toStackId: string): LayoutNode | null {
  const withoutView = removeView(root, viewId);
  if (!withoutView) return null;
  if (!findStack(withoutView, toStackId)) return withoutView;
  return addView(withoutView, toStackId, viewId);
}

/**
 * Compute pixel rectangles for every stack given the window's content rect.
 * Keyed by stack id — the runtime positions each stack's active View at this rect.
 */
export function computeLayout(
  node: LayoutNode,
  rect: Rect,
  gap = 0,
): Map<string, Rect> {
  const out = new Map<string, Rect>();
  walk(node, rect);
  return out;

  function walk(n: LayoutNode, r: Rect): void {
    if (n.type === 'stack') {
      out.set(n.id, r);
      return;
    }
    const count = n.children.length;
    const isRow = n.orientation === 'row';
    const totalGap = gap * Math.max(0, count - 1);
    const available = (isRow ? r.width : r.height) - totalGap;
    const sizes = normalizeSizes(n.sizes, count);
    let offset = isRow ? r.x : r.y;
    for (let i = 0; i < count; i++) {
      const extent = available * sizes[i];
      const childRect: Rect = isRow
        ? { x: offset, y: r.y, width: extent, height: r.height }
        : { x: r.x, y: offset, width: r.width, height: extent };
      walk(n.children[i], childRect);
      offset += extent + gap;
    }
  }
}
