import { describe, it, expect } from 'vitest';
import {
  unionBounds,
  groupBounds,
  moveGroup,
  tearOut,
  addToGroup,
  type BoundsMap,
} from '../windowGroup';
import type { Rect } from '../../types';

describe('unionBounds', () => {
  it('returns null for no rects', () => {
    expect(unionBounds([])).toBeNull();
  });

  it('computes the bounding box of several rects', () => {
    const rects: Rect[] = [
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 200, y: 50, width: 100, height: 100 },
    ];
    expect(unionBounds(rects)).toEqual({ x: 0, y: 0, width: 300, height: 150 });
  });
});

describe('groupBounds', () => {
  const bounds: BoundsMap = {
    a: { x: 0, y: 0, width: 100, height: 100 },
    b: { x: 100, y: 0, width: 100, height: 100 },
    c: { x: 500, y: 500, width: 100, height: 100 },
  };

  it('bounds only the named members', () => {
    expect(groupBounds(['a', 'b'], bounds)).toEqual({ x: 0, y: 0, width: 200, height: 100 });
  });

  it('ignores members missing from the map', () => {
    expect(groupBounds(['a', 'missing'], bounds)).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });
});

describe('moveGroup', () => {
  const bounds: BoundsMap = {
    a: { x: 0, y: 0, width: 100, height: 100 },
    b: { x: 100, y: 0, width: 100, height: 100 },
    c: { x: 500, y: 500, width: 100, height: 100 },
  };

  it('translates only group members, preserving sizes', () => {
    const next = moveGroup(bounds, ['a', 'b'], 10, 20);
    expect(next.a).toEqual({ x: 10, y: 20, width: 100, height: 100 });
    expect(next.b).toEqual({ x: 110, y: 20, width: 100, height: 100 });
    expect(next.c).toEqual(bounds.c);
  });

  it('does not mutate the input map', () => {
    moveGroup(bounds, ['a'], 5, 5);
    expect(bounds.a).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });
});

describe('tearOut / addToGroup', () => {
  it('removes a window from the group', () => {
    expect(tearOut(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });

  it('adds a window when absent', () => {
    expect(addToGroup(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
  });

  it('does not duplicate an existing member', () => {
    expect(addToGroup(['a', 'b'], 'b')).toEqual(['a', 'b']);
  });
});
