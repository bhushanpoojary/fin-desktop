import { describe, it, expect } from 'vitest';
import {
  constrainSize,
  applyAspectRatio,
  centerIn,
  clampToWorkArea,
  cascade,
  pickMonitorForPoint,
  pickMonitorForRect,
  type Monitor,
} from '../placement';
import type { Rect } from '../../types';

const workArea: Rect = { x: 0, y: 0, width: 1920, height: 1080 };

describe('constrainSize', () => {
  it('applies max then min bounds', () => {
    expect(constrainSize({ width: 2000, height: 50 }, { maxWidth: 1600, minHeight: 100 })).toEqual({
      width: 1600,
      height: 100,
    });
  });

  it('lets min win over a conflicting max', () => {
    expect(constrainSize({ width: 300, height: 300 }, { maxWidth: 200, minWidth: 250 })).toEqual({
      width: 250,
      height: 300,
    });
  });

  it('is a no-op without limits', () => {
    expect(constrainSize({ width: 400, height: 300 })).toEqual({ width: 400, height: 300 });
  });
});

describe('applyAspectRatio', () => {
  it('derives height from width for a 16:9 ratio', () => {
    expect(applyAspectRatio({ width: 1600, height: 999 }, 16 / 9)).toEqual({
      width: 1600,
      height: 900,
    });
  });

  it('throws for a non-positive ratio', () => {
    expect(() => applyAspectRatio({ width: 100, height: 100 }, 0)).toThrow(/positive/);
  });
});

describe('centerIn', () => {
  it('centers a window in the work area', () => {
    expect(centerIn({ width: 800, height: 600 }, workArea)).toEqual({
      x: 560,
      y: 240,
      width: 800,
      height: 600,
    });
  });

  it('respects a non-zero work area origin', () => {
    const wa: Rect = { x: 100, y: 50, width: 1000, height: 800 };
    expect(centerIn({ width: 400, height: 400 }, wa)).toEqual({
      x: 400,
      y: 250,
      width: 400,
      height: 400,
    });
  });
});

describe('clampToWorkArea', () => {
  it('pushes an off-screen window back inside', () => {
    const rect: Rect = { x: 1800, y: 1000, width: 400, height: 300 };
    expect(clampToWorkArea(rect, workArea)).toEqual({
      x: 1520,
      y: 780,
      width: 400,
      height: 300,
    });
  });

  it('shrinks a window larger than the work area', () => {
    const rect: Rect = { x: -50, y: -50, width: 3000, height: 2000 };
    expect(clampToWorkArea(rect, workArea)).toEqual({
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
    });
  });

  it('leaves a fitting window untouched', () => {
    const rect: Rect = { x: 100, y: 100, width: 400, height: 300 };
    expect(clampToWorkArea(rect, workArea)).toEqual(rect);
  });
});

describe('cascade', () => {
  it('offsets each window diagonally', () => {
    expect(cascade(0, { width: 800, height: 600 }, workArea, 30)).toEqual({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
    });
    expect(cascade(2, { width: 800, height: 600 }, workArea, 30)).toEqual({
      x: 60,
      y: 60,
      width: 800,
      height: 600,
    });
  });

  it('wraps so the window stays within the work area', () => {
    const size = { width: 1900, height: 1060 };
    // maxX = 20, maxY = 20 -> offset wraps modulo 21
    const result = cascade(100, size, workArea, 30);
    expect(result.x).toBeLessThanOrEqual(workArea.width - size.width);
    expect(result.y).toBeLessThanOrEqual(workArea.height - size.height);
  });
});

describe('monitor selection', () => {
  const monitors: Monitor[] = [
    { id: 'primary', workArea: { x: 0, y: 0, width: 1920, height: 1080 } },
    { id: 'secondary', workArea: { x: 1920, y: 0, width: 1920, height: 1080 } },
  ];

  it('picks the monitor containing a point', () => {
    expect(pickMonitorForPoint({ x: 2500, y: 500 }, monitors)?.id).toBe('secondary');
    expect(pickMonitorForPoint({ x: 100, y: 100 }, monitors)?.id).toBe('primary');
  });

  it('returns null when no monitor contains the point', () => {
    expect(pickMonitorForPoint({ x: 5000, y: 5000 }, monitors)).toBeNull();
  });

  it('picks the monitor with the largest overlap for a rect', () => {
    const rect: Rect = { x: 1800, y: 100, width: 400, height: 300 };
    // 120px on primary, 280px on secondary -> secondary
    expect(pickMonitorForRect(rect, monitors)?.id).toBe('secondary');
  });

  it('falls back to the first monitor when there is no overlap', () => {
    const rect: Rect = { x: 10000, y: 10000, width: 100, height: 100 };
    expect(pickMonitorForRect(rect, monitors)?.id).toBe('primary');
  });

  it('returns null with no monitors', () => {
    expect(pickMonitorForRect({ x: 0, y: 0, width: 10, height: 10 }, [])).toBeNull();
  });
});
