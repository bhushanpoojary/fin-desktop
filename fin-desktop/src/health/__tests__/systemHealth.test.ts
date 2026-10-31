import { describe, it, expect } from 'vitest';
import { HealthMonitor, classify, formatBytes, DEFAULT_THRESHOLDS } from '../systemHealth';
import type { ProcessSample } from '../systemHealth';

const MB = 1024 * 1024;

function sample(id: string, cpuPercent: number, memoryMB: number): ProcessSample {
  return { id, label: id, kind: 'renderer', cpuPercent, memoryBytes: memoryMB * MB };
}

describe('classify', () => {
  it('flags critical on memory or cpu threshold', () => {
    expect(classify(sample('a', 90, 100), DEFAULT_THRESHOLDS)).toBe('critical');
    expect(classify(sample('a', 10, 700), DEFAULT_THRESHOLDS)).toBe('critical');
  });
  it('flags warn in the middle band', () => {
    expect(classify(sample('a', 65, 100), DEFAULT_THRESHOLDS)).toBe('warn');
    expect(classify(sample('a', 10, 350), DEFAULT_THRESHOLDS)).toBe('warn');
  });
  it('is ok below thresholds', () => {
    expect(classify(sample('a', 10, 100), DEFAULT_THRESHOLDS)).toBe('ok');
  });
});

describe('formatBytes', () => {
  it('renders human-readable sizes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2 * 1024)).toBe('2.0 KB');
    expect(formatBytes(5 * MB)).toBe('5.0 MB');
    expect(formatBytes(3 * 1024 * MB)).toBe('3.0 GB');
  });
});

describe('HealthMonitor', () => {
  it('captures a snapshot with totals and overall status', () => {
    const monitor = new HealthMonitor({ now: () => 100 });
    const snap = monitor.capture([sample('main', 5, 80), sample('r1', 65, 120)]);
    expect(snap.totals).toEqual({ cpuPercent: 70, memoryBytes: 200 * MB, count: 2 });
    expect(snap.status).toBe('warn');
    expect(snap.timestamp).toBe(100);
  });

  it('overall status is the worst process status', () => {
    const monitor = new HealthMonitor();
    expect(monitor.capture([sample('a', 10, 100), sample('b', 95, 100)]).status).toBe('critical');
  });

  it('keeps a bounded history and exposes the latest', () => {
    const monitor = new HealthMonitor({ historySize: 2, now: (() => { let t = 0; return () => (t += 1); })() });
    monitor.capture([sample('a', 1, 1)]);
    monitor.capture([sample('a', 2, 1)]);
    monitor.capture([sample('a', 3, 1)]);
    expect(monitor.history()).toHaveLength(2);
    expect(monitor.latest()?.totals.cpuPercent).toBe(3);
  });

  it('ranks the top consumers', () => {
    const monitor = new HealthMonitor();
    monitor.capture([sample('a', 10, 50), sample('b', 80, 20), sample('c', 5, 300)]);
    expect(monitor.top(2, 'memory').map((p) => p.id)).toEqual(['c', 'a']);
    expect(monitor.top(1, 'cpu').map((p) => p.id)).toEqual(['b']);
  });

  it('returns no top consumers before any capture', () => {
    expect(new HealthMonitor().top(3)).toEqual([]);
  });
});
