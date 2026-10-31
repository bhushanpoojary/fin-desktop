/**
 * Crash reporting — capture process crash reports, redact sensitive metadata, and upload them to
 * an opt-in collector (electron `crashReporter` / minidump pipeline).
 *
 * Pure and framework-agnostic: reports are always stored locally (bounded ring buffer); uploading
 * only happens when enabled (privacy opt-in) and an `CrashUploader` is provided. Metadata keys in
 * `redactKeys` are masked before storage or upload.
 */

export type CrashProcess = 'main' | 'renderer' | 'gpu' | 'utility' | 'extension' | string;

export interface CrashReport {
  id: string;
  process: CrashProcess;
  reason: string;
  fatal: boolean;
  timestamp: number;
  stack?: string;
  metadata?: Record<string, unknown>;
}

export type CrashInput = Omit<CrashReport, 'id' | 'timestamp' | 'fatal'> & {
  id?: string;
  fatal?: boolean;
};

export interface CrashUploader {
  upload(report: CrashReport): void | Promise<void>;
}

export interface CrashReporterOptions {
  now?: () => number;
  idFactory?: () => string;
  uploader?: CrashUploader;
  /** Metadata keys to mask before storing/uploading. */
  redactKeys?: string[];
  /** Upload is opt-in; reports are always stored locally regardless. */
  enabled?: boolean;
  maxStored?: number;
}

let counter = 0;
function defaultId(): string {
  counter += 1;
  return `crash-${counter}`;
}

export class CrashReporter {
  private reports: CrashReport[] = [];
  private enabled: boolean;
  private readonly now: () => number;
  private readonly newId: () => string;
  private readonly uploader?: CrashUploader;
  private readonly redactKeys: Set<string>;
  private readonly maxStored: number;

  constructor(options: CrashReporterOptions = {}) {
    this.now = options.now ?? Date.now;
    this.newId = options.idFactory ?? defaultId;
    this.uploader = options.uploader;
    this.redactKeys = new Set(options.redactKeys ?? []);
    this.enabled = options.enabled ?? false;
    this.maxStored = options.maxStored ?? 50;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  private redact(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata) return undefined;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      out[key] = this.redactKeys.has(key) ? '[redacted]' : value;
    }
    return out;
  }

  /** Capture a crash: always stored locally; uploaded only when enabled + an uploader is set. */
  report(input: CrashInput): CrashReport {
    const report: CrashReport = {
      ...input,
      id: input.id ?? this.newId(),
      fatal: input.fatal ?? true,
      timestamp: this.now(),
      metadata: this.redact(input.metadata),
    };
    this.reports.push(report);
    if (this.reports.length > this.maxStored) this.reports = this.reports.slice(this.reports.length - this.maxStored);
    if (this.enabled && this.uploader) void this.uploader.upload(report);
    return { ...report };
  }

  list(): CrashReport[] {
    return this.reports.map((r) => ({ ...r }));
  }

  count(): number {
    return this.reports.length;
  }

  clear(): void {
    this.reports = [];
  }
}
