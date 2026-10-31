/**
 * Health check / self-diagnostics — a runner that executes named checks and aggregates a report.
 *
 * Pure and framework-agnostic: each `DiagnosticCheck` returns ok/warn/fail (thrown errors become
 * fail); the runner rolls them up into a `DiagnosticsReport` whose overall status is the worst
 * result. Powers a `--diagnostics` command (text output) and an in-app health panel.
 */

import { compareSemver } from '../update/semver';

export type DiagnosticStatus = 'ok' | 'warn' | 'fail';

export interface DiagnosticResult {
  status: DiagnosticStatus;
  message?: string;
  detail?: Record<string, unknown>;
}

export interface DiagnosticCheck {
  id: string;
  label: string;
  run: () => DiagnosticResult | Promise<DiagnosticResult>;
}

export interface DiagnosticEntry extends DiagnosticResult {
  id: string;
  label: string;
  durationMs: number;
}

export interface DiagnosticsReport {
  status: DiagnosticStatus;
  summary: { ok: number; warn: number; fail: number };
  results: DiagnosticEntry[];
  timestamp: number;
}

const SEVERITY: Record<DiagnosticStatus, number> = { ok: 0, warn: 1, fail: 2 };

function worst(a: DiagnosticStatus, b: DiagnosticStatus): DiagnosticStatus {
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

export interface DiagnosticsRunnerOptions {
  now?: () => number;
}

export class DiagnosticsRunner {
  private readonly checks: DiagnosticCheck[] = [];
  private readonly now: () => number;

  constructor(options: DiagnosticsRunnerOptions = {}) {
    this.now = options.now ?? Date.now;
  }

  register(check: DiagnosticCheck): this {
    this.checks.push(check);
    return this;
  }

  /** Run every check (in order) and aggregate a report. A thrown check becomes a `fail`. */
  async run(): Promise<DiagnosticsReport> {
    const results: DiagnosticEntry[] = [];
    let status: DiagnosticStatus = 'ok';
    const summary = { ok: 0, warn: 0, fail: 0 };

    for (const check of this.checks) {
      const start = this.now();
      let result: DiagnosticResult;
      try {
        result = await check.run();
      } catch (error) {
        result = { status: 'fail', message: (error as Error).message };
      }
      const entry: DiagnosticEntry = { id: check.id, label: check.label, durationMs: this.now() - start, ...result };
      results.push(entry);
      summary[result.status] += 1;
      status = worst(status, result.status);
    }

    return { status, summary, results, timestamp: this.now() };
  }
}

// ---- Reusable check builders ----

/** Fail if the runtime version is below `min`. */
export function runtimeVersionCheck(current: string, min: string): DiagnosticCheck {
  return {
    id: 'runtime-version',
    label: 'Runtime version',
    run: () =>
      compareSemver(current, min) >= 0
        ? { status: 'ok', message: `v${current}` }
        : { status: 'fail', message: `v${current} is below the minimum v${min}` },
  };
}

/** Warn when an optional capability is not granted; ok when it is. */
export function permissionCheck(name: string, granted: boolean): DiagnosticCheck {
  return {
    id: `permission-${name}`,
    label: `Permission: ${name}`,
    run: () => (granted ? { status: 'ok' } : { status: 'warn', message: `${name} not granted` }),
  };
}

/** Fail when a connectivity probe rejects or returns false. */
export function connectivityCheck(name: string, probe: () => boolean | Promise<boolean>): DiagnosticCheck {
  return {
    id: `connectivity-${name}`,
    label: `Connectivity: ${name}`,
    run: async () => {
      const ok = await probe();
      return ok ? { status: 'ok', message: 'reachable' } : { status: 'fail', message: `${name} unreachable` };
    },
  };
}

/** Render a report as plain text (for a `--diagnostics` CLI). */
export function formatReport(report: DiagnosticsReport): string {
  const icon: Record<DiagnosticStatus, string> = { ok: '✓', warn: '!', fail: '✗' };
  const lines = report.results.map((r) => `  ${icon[r.status]} ${r.label}${r.message ? ` — ${r.message}` : ''}`);
  const head = `Diagnostics: ${report.status.toUpperCase()} (ok ${report.summary.ok}, warn ${report.summary.warn}, fail ${report.summary.fail})`;
  return [head, ...lines].join('\n');
}
