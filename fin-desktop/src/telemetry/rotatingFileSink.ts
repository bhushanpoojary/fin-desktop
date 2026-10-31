/**
 * Rotating file log sink — a `LogSink` that writes to a file and rotates it by size, keeping a
 * bounded number of backups (`app.log`, `app.1.log`, … `app.N.log`).
 *
 * The file system is an injectable boundary (`LogFileSystem`) so rotation is unit-testable with an
 * in-memory implementation; a thin Node `fs` adapter plugs in for production. Sizes are measured in
 * UTF-8 bytes.
 */

import type { LogRecord, LogSink } from './logger';

/** Minimal synchronous file-system surface the sink needs. */
export interface LogFileSystem {
  size(path: string): number;
  append(path: string, data: string): void;
  rename(from: string, to: string): void;
  remove(path: string): void;
  exists(path: string): boolean;
}

export type LogFormatter = (record: LogRecord) => string;

export const jsonLineFormatter: LogFormatter = (record) => `${JSON.stringify(record)}\n`;

export interface RotatingFileSinkOptions {
  fs: LogFileSystem;
  path: string;
  /** Rotate once the active file would exceed this many bytes. */
  maxBytes?: number;
  /** How many rotated backups to keep (app.1.log … app.N.log). */
  maxFiles?: number;
  format?: LogFormatter;
}

/** Insert a numeric suffix before the extension: `dir/app.log` → `dir/app.2.log`. */
export function rotatedName(path: string, index: number): string {
  const slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  const dir = path.slice(0, slash + 1);
  const file = path.slice(slash + 1);
  const dot = file.lastIndexOf('.');
  if (dot <= 0) return `${path}.${index}`;
  return `${dir}${file.slice(0, dot)}.${index}${file.slice(dot)}`;
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export class RotatingFileSink implements LogSink {
  private readonly fs: LogFileSystem;
  private readonly path: string;
  private readonly maxBytes: number;
  private readonly maxFiles: number;
  private readonly format: LogFormatter;

  constructor(options: RotatingFileSinkOptions) {
    this.fs = options.fs;
    this.path = options.path;
    this.maxBytes = options.maxBytes ?? 1_000_000;
    this.maxFiles = Math.max(0, options.maxFiles ?? 5);
    this.format = options.format ?? jsonLineFormatter;
  }

  write(record: LogRecord): void {
    const line = this.format(record);
    const lineBytes = byteLength(line);
    const current = this.fs.size(this.path);
    // Rotate before appending if this line would overflow a non-empty file.
    if (current > 0 && current + lineBytes > this.maxBytes) {
      this.rotate();
    }
    this.fs.append(this.path, line);
  }

  /** Shift backups down one slot and move the active file to `.1`, dropping the oldest. */
  private rotate(): void {
    if (this.maxFiles === 0) {
      this.fs.remove(this.path);
      return;
    }
    const oldest = rotatedName(this.path, this.maxFiles);
    if (this.fs.exists(oldest)) this.fs.remove(oldest);
    for (let i = this.maxFiles - 1; i >= 1; i -= 1) {
      const from = rotatedName(this.path, i);
      if (this.fs.exists(from)) this.fs.rename(from, rotatedName(this.path, i + 1));
    }
    this.fs.rename(this.path, rotatedName(this.path, 1));
  }
}

export interface InMemoryLogFs extends LogFileSystem {
  read(path: string): string;
  list(): string[];
}

/** An in-memory `LogFileSystem` for tests and demos. */
export function createInMemoryLogFs(): InMemoryLogFs {
  const files = new Map<string, string>();
  return {
    size: (path) => (files.has(path) ? byteLength(files.get(path)!) : 0),
    append: (path, data) => files.set(path, (files.get(path) ?? '') + data),
    rename: (from, to) => {
      files.set(to, files.get(from) ?? '');
      files.delete(from);
    },
    remove: (path) => void files.delete(path),
    exists: (path) => files.has(path),
    read: (path) => files.get(path) ?? '',
    list: () => [...files.keys()],
  };
}
