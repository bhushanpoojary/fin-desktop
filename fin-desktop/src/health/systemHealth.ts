/**
 * System health model — per-process CPU/memory monitoring (process explorer) with thresholds.
 *
 * Pure and framework-agnostic: the `ProcessSampler` boundary is implemented by Electron's
 * `app.getAppMetrics()` in production and by a fake in tests. `HealthMonitor.capture` classifies
 * each process (ok/warn/critical) against thresholds, rolls up totals and an overall status, and
 * keeps a bounded history for sparklines.
 */

export type ProcessKind = 'main' | 'renderer' | 'gpu' | 'utility' | 'extension';
export type HealthStatus = 'ok' | 'warn' | 'critical';

export interface ProcessSample {
  id: string;
  label: string;
  kind: ProcessKind;
  cpuPercent: number;
  memoryBytes: number;
  pid?: number;
}

export interface ProcessStatus extends ProcessSample {
  status: HealthStatus;
}

export interface HealthSnapshot {
  timestamp: number;
  processes: ProcessStatus[];
  totals: { cpuPercent: number; memoryBytes: number; count: number };
  status: HealthStatus;
}

export interface HealthThresholds {
  memoryWarnBytes: number;
  memoryCriticalBytes: number;
  cpuWarnPercent: number;
  cpuCriticalPercent: number;
}

export interface ProcessSampler {
  sample(): ProcessSample[];
}

export const DEFAULT_THRESHOLDS: HealthThresholds = {
  memoryWarnBytes: 300 * 1024 * 1024,
  memoryCriticalBytes: 600 * 1024 * 1024,
  cpuWarnPercent: 60,
  cpuCriticalPercent: 85,
};

const SEVERITY: Record<HealthStatus, number> = { ok: 0, warn: 1, critical: 2 };

function worst(a: HealthStatus, b: HealthStatus): HealthStatus {
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

export function classify(sample: ProcessSample, thresholds: HealthThresholds): HealthStatus {
  if (sample.memoryBytes >= thresholds.memoryCriticalBytes || sample.cpuPercent >= thresholds.cpuCriticalPercent) {
    return 'critical';
  }
  if (sample.memoryBytes >= thresholds.memoryWarnBytes || sample.cpuPercent >= thresholds.cpuWarnPercent) {
    return 'warn';
  }
  return 'ok';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

export interface HealthMonitorOptions {
  thresholds?: Partial<HealthThresholds>;
  now?: () => number;
  historySize?: number;
}

export class HealthMonitor {
  private readonly thresholds: HealthThresholds;
  private readonly now: () => number;
  private readonly historySize: number;
  private readonly snapshots: HealthSnapshot[] = [];

  constructor(options: HealthMonitorOptions = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...options.thresholds };
    this.now = options.now ?? Date.now;
    this.historySize = options.historySize ?? 60;
  }

  getThresholds(): HealthThresholds {
    return { ...this.thresholds };
  }

  /** Classify a set of samples into a snapshot and append it to history. */
  capture(samples: ProcessSample[]): HealthSnapshot {
    const processes: ProcessStatus[] = samples.map((s) => ({ ...s, status: classify(s, this.thresholds) }));
    const totals = processes.reduce(
      (acc, p) => ({
        cpuPercent: acc.cpuPercent + p.cpuPercent,
        memoryBytes: acc.memoryBytes + p.memoryBytes,
        count: acc.count + 1,
      }),
      { cpuPercent: 0, memoryBytes: 0, count: 0 },
    );
    totals.cpuPercent = Math.round(totals.cpuPercent * 10) / 10;
    const status = processes.reduce<HealthStatus>((acc, p) => worst(acc, p.status), 'ok');

    const snapshot: HealthSnapshot = { timestamp: this.now(), processes, totals, status };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.historySize) this.snapshots.shift();
    return snapshot;
  }

  latest(): HealthSnapshot | null {
    return this.snapshots[this.snapshots.length - 1] ?? null;
  }

  history(): HealthSnapshot[] {
    return [...this.snapshots];
  }

  /** The `n` processes using the most of a resource in the latest snapshot. */
  top(n: number, by: 'memory' | 'cpu' = 'memory'): ProcessStatus[] {
    const latest = this.latest();
    if (!latest) return [];
    const key = by === 'memory' ? 'memoryBytes' : 'cpuPercent';
    return [...latest.processes].sort((a, b) => b[key] - a[key]).slice(0, n);
  }
}
