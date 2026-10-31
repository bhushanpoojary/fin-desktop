import { describe, it, expect } from 'vitest';
import {
  snapRect,
  detectDockZone,
  dockZoneBounds,
  areAdjacent,
} from '../snapGeometry';
import type { Rect } from '../../types';

const workArea: Rect = { x: 0, y: 0, width: 1920, height: 1080 };

describe('snapRect', () => {
  it('snaps the left edge to the work area when within threshold', () => {
    const moving: Rect = { x: 6, y: 300, width: 400, height: 300 };
    const result = snapRect(moving, [], workArea, 10);
    expect(result.rect.x).toBe(0);
    expect(result.snapped.left).toBe(true);
  });

  it('snaps the right edge to the work area, preserving width', () => {
    const moving: Rect = { x: 1516, y: 300, width: 400, height: 300 };
    const result = snapRect(moving, [], workArea, 10);
    expect(result.rect.x).toBe(1920 - 400);
    expect(result.rect.width).toBe(400);
    expect(result.snapped.right).toBe(true);
  });

  it('snaps to a neighbouring window edge', () => {
    const neighbour: Rect = { x: 500, y: 0, width: 300, height: 1080 };
    const moving: Rect = { x: 803, y: 100, width: 200, height: 200 };
    const result = snapRect(moving, [neighbour], workArea, 10);
    // moving.left (803) snaps to neighbour.right (800)
    expect(result.rect.x).toBe(800);
    expect(result.snapped.left).toBe(true);
  });

  it('does not snap when outside the threshold', () => {
    const moving: Rect = { x: 50, y: 300, width: 400, height: 300 };
    const result = snapRect(moving, [], workArea, 10);
    expect(result.rect).toEqual(moving);
    expect(result.snapped).toEqual({});
  });

  it('snaps top and bottom independently of horizontal', () => {
    const moving: Rect = { x: 50, y: 4, width: 400, height: 300 };
    const result = snapRect(moving, [], workArea, 10);
    expect(result.rect.y).toBe(0);
    expect(result.snapped.top).toBe(true);
    expect(result.snapped.left).toBeUndefined();
  });
});

describe('detectDockZone', () => {
  it('detects the top edge as maximize', () => {
    expect(detectDockZone({ x: 400, y: 5, width: 300, height: 300 }, workArea, 10)).toBe('maximize');
  });

  it('detects the left edge', () => {
    expect(detectDockZone({ x: 3, y: 400, width: 300, height: 300 }, workArea, 10)).toBe('left');
  });

  it('detects the right edge', () => {
    expect(detectDockZone({ x: 1617, y: 400, width: 300, height: 300 }, workArea, 10)).toBe('right');
  });

  it('returns none away from edges', () => {
    expect(detectDockZone({ x: 400, y: 400, width: 300, height: 300 }, workArea, 10)).toBe('none');
  });
});

describe('dockZoneBounds', () => {
  it('computes the left half', () => {
    expect(dockZoneBounds('left', workArea)).toEqual({ x: 0, y: 0, width: 960, height: 1080 });
  });

  it('computes the right half', () => {
    expect(dockZoneBounds('right', workArea)).toEqual({ x: 960, y: 0, width: 960, height: 1080 });
  });

  it('maximizes to the full work area', () => {
    expect(dockZoneBounds('maximize', workArea)).toEqual(workArea);
  });
});

describe('areAdjacent', () => {
  it('detects side-by-side windows sharing a vertical edge', () => {
    const a: Rect = { x: 0, y: 0, width: 500, height: 400 };
    const b: Rect = { x: 500, y: 100, width: 500, height: 400 };
    expect(areAdjacent(a, b)).toBe(true);
  });

  it('detects stacked windows sharing a horizontal edge', () => {
    const a: Rect = { x: 0, y: 0, width: 500, height: 400 };
    const b: Rect = { x: 100, y: 400, width: 500, height: 400 };
    expect(areAdjacent(a, b)).toBe(true);
  });

  it('returns false for separated windows', () => {
    const a: Rect = { x: 0, y: 0, width: 400, height: 400 };
    const b: Rect = { x: 600, y: 0, width: 400, height: 400 };
    expect(areAdjacent(a, b)).toBe(false);
  });

  it('returns false when edges touch but ranges do not overlap', () => {
    const a: Rect = { x: 0, y: 0, width: 500, height: 400 };
    const b: Rect = { x: 500, y: 500, width: 500, height: 400 };
    expect(areAdjacent(a, b)).toBe(false);
  });
});
