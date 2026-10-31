import { describe, it, expect } from 'vitest';
import { RotatingFileSink, createInMemoryLogFs, rotatedName, jsonLineFormatter } from '../rotatingFileSink';
import { Logger } from '../logger';
import type { LogRecord } from '../logger';

function record(message: string): LogRecord {
  return { level: 'info', message, timestamp: 0 };
}

describe('rotatedName', () => {
  it('inserts the index before the extension', () => {
    expect(rotatedName('logs/app.log', 1)).toBe('logs/app.1.log');
    expect(rotatedName('app.log', 3)).toBe('app.3.log');
    expect(rotatedName('C:\\logs\\app.log', 2)).toBe('C:\\logs\\app.2.log');
    expect(rotatedName('noext', 1)).toBe('noext.1');
  });
});

describe('RotatingFileSink', () => {
  it('appends records to the active file', () => {
    const fs = createInMemoryLogFs();
    const sink = new RotatingFileSink({ fs, path: 'app.log', maxBytes: 10_000 });
    sink.write(record('hello'));
    sink.write(record('world'));
    expect(fs.read('app.log').trim().split('\n')).toHaveLength(2);
  });

  it('rotates when the active file would exceed maxBytes', () => {
    const fs = createInMemoryLogFs();
    const line = jsonLineFormatter(record('x'));
    const sink = new RotatingFileSink({ fs, path: 'app.log', maxBytes: line.length + 1, maxFiles: 3 });
    sink.write(record('x')); // fits
    sink.write(record('y')); // triggers rotation -> app.1.log has x, app.log has y
    expect(fs.exists('app.1.log')).toBe(true);
    expect(fs.read('app.1.log')).toContain('"x"');
    expect(fs.read('app.log')).toContain('"y"');
  });

  it('keeps at most maxFiles backups, dropping the oldest', () => {
    const fs = createInMemoryLogFs();
    const line = jsonLineFormatter(record('x'));
    const sink = new RotatingFileSink({ fs, path: 'app.log', maxBytes: line.length + 1, maxFiles: 2 });
    for (const m of ['a', 'b', 'c', 'd']) sink.write(record(m));
    // Active + 2 backups only.
    expect(fs.exists('app.log')).toBe(true);
    expect(fs.exists('app.1.log')).toBe(true);
    expect(fs.exists('app.2.log')).toBe(true);
    expect(fs.exists('app.3.log')).toBe(false);
    expect(fs.read('app.log')).toContain('"d"');
  });

  it('with maxFiles 0 it truncates instead of keeping backups', () => {
    const fs = createInMemoryLogFs();
    const line = jsonLineFormatter(record('x'));
    const sink = new RotatingFileSink({ fs, path: 'app.log', maxBytes: line.length + 1, maxFiles: 0 });
    sink.write(record('x'));
    sink.write(record('y'));
    expect(fs.list()).toEqual(['app.log']);
    expect(fs.read('app.log')).toContain('"y"');
    expect(fs.read('app.log')).not.toContain('"x"');
  });

  it('works as a drop-in sink for the structured Logger', () => {
    const fs = createInMemoryLogFs();
    const logger = new Logger({ sink: new RotatingFileSink({ fs, path: 'app.log', maxBytes: 10_000 }), level: 'info', now: () => 0 });
    logger.info('started');
    logger.child('fdc3').warn('slow');
    const lines = fs.read('app.log').trim().split('\n').map((l) => JSON.parse(l));
    expect(lines[0]).toMatchObject({ level: 'info', message: 'started' });
    expect(lines[1]).toMatchObject({ level: 'warn', message: 'slow', context: 'fdc3' });
  });
});
