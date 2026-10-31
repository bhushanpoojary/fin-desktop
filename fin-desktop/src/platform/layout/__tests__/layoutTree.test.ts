import { describe, it, expect } from 'vitest';
import {
  createRoot,
  addView,
  removeView,
  moveView,
  splitStack,
  setActiveView,
  findStack,
  findStackOfView,
  listViewIds,
  listStacks,
  computeLayout,
  normalizeSizes,
  makeStack,
  makeSplit,
} from '../layoutTree';
import type { LayoutNode } from '../layoutTree';
import type { Rect } from '../../types';

const container: Rect = { x: 0, y: 0, width: 1000, height: 800 };

describe('normalizeSizes', () => {
  it('returns equal fractions when sizes are missing', () => {
    expect(normalizeSizes(undefined, 4)).toEqual([0.25, 0.25, 0.25, 0.25]);
  });

  it('scales arbitrary positive sizes to sum to 1', () => {
    expect(normalizeSizes([1, 3], 2)).toEqual([0.25, 0.75]);
  });

  it('falls back to equal split for invalid sizes', () => {
    expect(normalizeSizes([0, 0], 2)).toEqual([0.5, 0.5]);
    expect(normalizeSizes([1], 2)).toEqual([0.5, 0.5]);
  });
});

describe('layout tree operations', () => {
  it('creates a root stack with one view', () => {
    const root = createRoot('s1', 'v1');
    expect(root.type).toBe('stack');
    expect(root.viewIds).toEqual(['v1']);
    expect(root.activeViewId).toBe('v1');
  });

  it('adds views to a stack and tracks the active view', () => {
    let root: LayoutNode = createRoot('s1', 'v1');
    root = addView(root, 's1', 'v2');
    const stack = findStack(root, 's1');
    expect(stack?.viewIds).toEqual(['v1', 'v2']);
    expect(stack?.activeViewId).toBe('v2');
  });

  it('does not duplicate an existing view but activates it', () => {
    let root: LayoutNode = createRoot('s1', 'v1');
    root = addView(root, 's1', 'v2');
    root = addView(root, 's1', 'v1');
    const stack = findStack(root, 's1');
    expect(stack?.viewIds).toEqual(['v1', 'v2']);
    expect(stack?.activeViewId).toBe('v1');
  });

  it('splits a stack into a row and keeps both sides', () => {
    let root: LayoutNode = createRoot('s1', 'v1');
    root = splitStack(root, 's1', 'right', 'v2', { splitId: 'split1', stackId: 's2' });
    expect(root.type).toBe('split');
    if (root.type !== 'split') throw new Error('expected split');
    expect(root.orientation).toBe('row');
    expect(root.children.map((c) => c.id)).toEqual(['s1', 's2']);
    expect(root.sizes).toEqual([0.5, 0.5]);
    expect(listViewIds(root)).toEqual(['v1', 'v2']);
  });

  it('places the new stack before the target when splitting left/up', () => {
    let root: LayoutNode = createRoot('s1', 'v1');
    root = splitStack(root, 's1', 'left', 'v2', { splitId: 'split1', stackId: 's2' });
    if (root.type !== 'split') throw new Error('expected split');
    expect(root.children.map((c) => c.id)).toEqual(['s2', 's1']);
    expect(root.orientation).toBe('row');
  });

  it('removes a view and collapses an emptied split back to a stack', () => {
    let root: LayoutNode = createRoot('s1', 'v1');
    root = splitStack(root, 's1', 'right', 'v2', { splitId: 'split1', stackId: 's2' });
    const collapsed = removeView(root, 'v2');
    expect(collapsed).not.toBeNull();
    expect(collapsed?.type).toBe('stack');
    expect(collapsed?.id).toBe('s1');
  });

  it('returns null when the last view is removed', () => {
    const root = createRoot('s1', 'v1');
    expect(removeView(root, 'v1')).toBeNull();
  });

  it('moves a view between stacks', () => {
    let root: LayoutNode = createRoot('s1', 'v1');
    root = splitStack(root, 's1', 'right', 'v2', { splitId: 'split1', stackId: 's2' });
    const moved = moveView(root, 'v1', 's2');
    expect(moved).not.toBeNull();
    // s1 is now empty and collapsed; only s2 remains, holding both views.
    expect(moved?.type).toBe('stack');
    expect(findStackOfView(moved, 'v1')?.id).toBe('s2');
    expect(findStackOfView(moved, 'v2')?.id).toBe('s2');
  });

  it('sets the active view in the correct stack', () => {
    let root: LayoutNode = createRoot('s1', 'v1');
    root = splitStack(root, 's1', 'down', 'v2', { splitId: 'split1', stackId: 's2' });
    root = setActiveView(root, 'v1');
    expect(findStack(root, 's1')?.activeViewId).toBe('v1');
  });

  it('redistributes sizes when a child is pruned from a 3-way split', () => {
    const root = makeSplit(
      'split1',
      'row',
      [makeStack('a', ['v1']), makeStack('b', ['v2']), makeStack('c', ['v3'])],
      [0.2, 0.3, 0.5],
    );
    const pruned = removeView(root, 'v2');
    if (!pruned || pruned.type !== 'split') throw new Error('expected split');
    expect(pruned.children.map((c) => c.id)).toEqual(['a', 'c']);
    // 0.2 and 0.5 renormalize to sum 1.
    expect(pruned.sizes[0]).toBeCloseTo(0.2 / 0.7);
    expect(pruned.sizes[1]).toBeCloseTo(0.5 / 0.7);
  });

  it('lists stacks and view ids depth-first', () => {
    const root = makeSplit(
      'split1',
      'column',
      [makeStack('a', ['v1', 'v2']), makeStack('b', ['v3'])],
    );
    expect(listStacks(root).map((s) => s.id)).toEqual(['a', 'b']);
    expect(listViewIds(root)).toEqual(['v1', 'v2', 'v3']);
  });
});

describe('computeLayout', () => {
  it('maps a single stack to the full container', () => {
    const root = createRoot('s1', 'v1');
    const rects = computeLayout(root, container);
    expect(rects.get('s1')).toEqual(container);
  });

  it('splits a row into two equal halves', () => {
    const root = makeSplit('split1', 'row', [makeStack('a', ['v1']), makeStack('b', ['v2'])]);
    const rects = computeLayout(root, container);
    expect(rects.get('a')).toEqual({ x: 0, y: 0, width: 500, height: 800 });
    expect(rects.get('b')).toEqual({ x: 500, y: 0, width: 500, height: 800 });
  });

  it('splits a column by weighted sizes', () => {
    const root = makeSplit(
      'split1',
      'column',
      [makeStack('a', ['v1']), makeStack('b', ['v2'])],
      [0.25, 0.75],
    );
    const rects = computeLayout(root, container);
    expect(rects.get('a')).toEqual({ x: 0, y: 0, width: 1000, height: 200 });
    expect(rects.get('b')).toEqual({ x: 0, y: 200, width: 1000, height: 600 });
  });

  it('accounts for gaps between children', () => {
    const root = makeSplit('split1', 'row', [makeStack('a', ['v1']), makeStack('b', ['v2'])]);
    const rects = computeLayout(root, container, 10);
    expect(rects.get('a')).toEqual({ x: 0, y: 0, width: 495, height: 800 });
    expect(rects.get('b')).toEqual({ x: 505, y: 0, width: 495, height: 800 });
  });

  it('handles nested splits', () => {
    const root = makeSplit(
      'outer',
      'row',
      [
        makeStack('a', ['v1']),
        makeSplit('inner', 'column', [makeStack('b', ['v2']), makeStack('c', ['v3'])]),
      ],
    );
    const rects = computeLayout(root, container);
    expect(rects.get('a')).toEqual({ x: 0, y: 0, width: 500, height: 800 });
    expect(rects.get('b')).toEqual({ x: 500, y: 0, width: 500, height: 400 });
    expect(rects.get('c')).toEqual({ x: 500, y: 400, width: 500, height: 400 });
  });
});
