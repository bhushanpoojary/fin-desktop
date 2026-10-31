/**
 * Telemetry event model + sinks.
 *
 * A structured event plus the pluggable destination (`TelemetrySink`) events are delivered to
 * — memory for tests, console for dev, or a custom remote/file sink in production.
 */

export type TelemetryLevel = 'debug' | 'info' | 'warn' | 'error';

export interface TelemetryEvent {
  name: string;
  level: TelemetryLevel;
  timestamp: number;
  properties?: Record<string, unknown>;
}

export interface TelemetrySink {
  send(events: TelemetryEvent[]): void | Promise<void>;
}

/** Collects events in memory (tests / buffering). */
export class MemorySink implements TelemetrySink {
  readonly events: TelemetryEvent[] = [];

  send(events: TelemetryEvent[]): void {
    this.events.push(...events);
  }

  clear(): void {
    this.events.length = 0;
  }
}

/** Writes events to the console (development). */
export class ConsoleSink implements TelemetrySink {
  send(events: TelemetryEvent[]): void {
    for (const event of events) {
      console.log(`[telemetry] ${event.name}`, event.properties ?? {});
    }
  }
}
