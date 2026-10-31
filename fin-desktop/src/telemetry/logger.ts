/**
 * Structured logger with levels, a pluggable sink, and child (contextual) loggers.
 */

import type { TelemetryLevel } from './events';

export interface LogRecord {
  level: TelemetryLevel;
  message: string;
  timestamp: number;
  context?: string;
  data?: Record<string, unknown>;
}

export interface LogSink {
  write(record: LogRecord): void;
}

export class MemoryLogSink implements LogSink {
  readonly records: LogRecord[] = [];
  write(record: LogRecord): void {
    this.records.push(record);
  }
  clear(): void {
    this.records.length = 0;
  }
}

const LEVEL_ORDER: Record<TelemetryLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LoggerOptions {
  sink: LogSink;
  level?: TelemetryLevel;
  context?: string;
  now?: () => number;
}

export class Logger {
  private readonly sink: LogSink;
  private level: TelemetryLevel;
  private readonly context?: string;
  private readonly now: () => number;

  constructor(options: LoggerOptions) {
    this.sink = options.sink;
    this.level = options.level ?? 'info';
    this.context = options.context;
    this.now = options.now ?? Date.now;
  }

  setLevel(level: TelemetryLevel): void {
    this.level = level;
  }

  /** A child logger that appends to the context and shares the sink. */
  child(context: string): Logger {
    return new Logger({
      sink: this.sink,
      level: this.level,
      context: this.context ? `${this.context}.${context}` : context,
      now: this.now,
    });
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }
  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  private log(level: TelemetryLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;
    this.sink.write({ level, message, timestamp: this.now(), context: this.context, data });
  }
}
