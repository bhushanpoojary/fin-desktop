/**
 * Telemetry — opt-in usage analytics.
 *
 * Buffers structured events, merges common properties, redacts configured PII keys, and
 * flushes to a pluggable sink (optionally auto-flushing at a batch size). Disabled telemetry
 * is a hard no-op (privacy by default). Pure and deterministic.
 */

import type { TelemetryEvent, TelemetryLevel, TelemetrySink } from './events';

function redact(value: unknown, keys: Set<string>): unknown {
  if (Array.isArray(value)) return value.map((v) => redact(v, keys));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = keys.has(key) ? '[REDACTED]' : redact(val, keys);
    }
    return out;
  }
  return value;
}

export interface TelemetryOptions {
  sink: TelemetrySink;
  /** Whether telemetry is on. Off ⇒ `track` is a no-op (privacy by default). */
  enabled?: boolean;
  now?: () => number;
  /** Property keys whose values are replaced with `[REDACTED]` (recursively). */
  redactKeys?: string[];
  /** Properties merged into every event. */
  commonProperties?: Record<string, unknown>;
  /** Auto-flush when the buffer reaches this size (0/undefined ⇒ manual flush only). */
  batchSize?: number;
}

export class Telemetry {
  private readonly sink: TelemetrySink;
  private readonly now: () => number;
  private readonly redactKeys: Set<string>;
  private readonly commonProperties: Record<string, unknown>;
  private readonly batchSize: number;
  private enabled: boolean;
  private buffer: TelemetryEvent[] = [];

  constructor(options: TelemetryOptions) {
    this.sink = options.sink;
    this.now = options.now ?? Date.now;
    this.redactKeys = new Set(options.redactKeys ?? []);
    this.commonProperties = options.commonProperties ?? {};
    this.batchSize = options.batchSize ?? 0;
    this.enabled = options.enabled ?? false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /** Record an event (no-op when disabled). */
  track(name: string, properties: Record<string, unknown> = {}, level: TelemetryLevel = 'info'): void {
    if (!this.enabled) return;
    const merged = { ...this.commonProperties, ...properties };
    const scrubbed =
      this.redactKeys.size > 0 ? (redact(merged, this.redactKeys) as Record<string, unknown>) : merged;
    this.buffer.push({ name, level, timestamp: this.now(), properties: scrubbed });
    if (this.batchSize > 0 && this.buffer.length >= this.batchSize) {
      void this.flush();
    }
  }

  /** Send buffered events to the sink and clear the buffer. */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    await this.sink.send(batch);
  }

  // --- Convenience trackers ---

  trackAppLaunch(appId: string, properties?: Record<string, unknown>): void {
    this.track('app.launch', { appId, ...properties });
  }

  trackIntent(intent: string, properties?: Record<string, unknown>): void {
    this.track('fdc3.intent', { intent, ...properties });
  }

  trackError(error: unknown, properties?: Record<string, unknown>): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    this.track('error', { message, stack, ...properties }, 'error');
  }
}
