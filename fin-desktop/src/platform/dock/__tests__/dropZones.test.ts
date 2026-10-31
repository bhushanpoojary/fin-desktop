import { describe, it, expect } from 'vitest';
import { computeDropTarget, dropRegionToSplitDirection } from '../dropZones';
import type { Rect } from '../../types';

const target: Rect = { x: 0, y: 0, width: 400, height: 400 };

describe('computeDropTarget', () => {
  it('returns null when the pointer is outside the target', () => {
    expect(computeDropTarget({ x: 500, y: 500 }, target)).toBeNull();
  });

  it('detects the left edge and previews the left half', () => {
    const result = computeDropTarget({ x: 20, y: 200 }, target);
    expect(result?.region).toBe('left');
    expect(result?.preview).toEqual({ x: 0, y: 0, width: 200, height: 400 });
  });

  it('detects the right edge and previews the right half', () => {
    const result = computeDropTarget({ x: 390, y: 200 }, target);
    expect(result?.region).toBe('right');
    expect(result?.preview).toEqual({ x: 200, y: 0, width: 200, height: 400 });
  });

  it('detects the top edge and previews the top half', () => {
    const result = computeDropTarget({ x: 200, y: 10 }, target);
    expect(result?.region).toBe('top');
    expect(result?.preview).toEqual({ x: 0, y: 0, width: 400, height: 200 });
  });

  it('detects the bottom edge and previews the bottom half', () => {
    const result = computeDropTarget({ x: 200, y: 390 }, target);
    expect(result?.region).toBe('bottom');
    expect(result?.preview).toEqual({ x: 0, y: 200, width: 400, height: 200 });
  });

  it('returns center (tabify) near the middle, previewing the full target', () => {
    const result = computeDropTarget({ x: 200, y: 200 }, target);
    expect(result?.region).toBe('center');
    expect(result?.preview).toEqual(target);
  });

  it('respects a non-zero target origin', () => {
    const offset: Rect = { x: 100, y: 50, width: 400, height: 400 };
    const result = computeDropTarget({ x: 110, y: 250 }, offset, 0.25);
    expect(result?.region).toBe('left');
    expect(result?.preview).toEqual({ x: 100, y: 50, width: 200, height: 400 });
  });

  it('widens edge bands with a larger edgeFraction', () => {
    // At relX=0.35 the default 0.25 band is center, but a 0.4 band makes it left.
    expect(computeDropTarget({ x: 140, y: 200 }, target, 0.25)?.region).toBe('center');
    expect(computeDropTarget({ x: 140, y: 200 }, target, 0.4)?.region).toBe('left');
  });
});

describe('dropRegionToSplitDirection', () => {
  it('maps edge regions to split directions', () => {
    expect(dropRegionToSplitDirection('left')).toBe('left');
    expect(dropRegionToSplitDirection('right')).toBe('right');
    expect(dropRegionToSplitDirection('top')).toBe('up');
    expect(dropRegionToSplitDirection('bottom')).toBe('down');
  });

  it('maps center to null (tabify, no split)', () => {
    expect(dropRegionToSplitDirection('center')).toBeNull();
  });
});
