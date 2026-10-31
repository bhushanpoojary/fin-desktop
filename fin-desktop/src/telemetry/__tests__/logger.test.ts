import { describe, it, expect } from 'vitest';
import { Logger, MemoryLogSink } from '../logger';

function setup(level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
  const sink = new MemoryLogSink();
  const logger = new Logger({ sink, level, now: () => 42 });
  return { sink, logger };
}

describe('Logger', () => {
  it('writes records at or above the configured level', () => {
    const { sink, logger } = setup('warn');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(sink.records.map((r) => r.level)).toEqual(['warn', 'error']);
  });

  it('includes message, timestamp, and data', () => {
    const { sink, logger } = setup('debug');
    logger.info('hello', { a: 1 });
    expect(sink.records[0]).toEqual({
      level: 'info',
      message: 'hello',
      timestamp: 42,
      context: undefined,
      data: { a: 1 },
    });
  });

  it('supports runtime level changes', () => {
    const { sink, logger } = setup('error');
    logger.info('nope');
    logger.setLevel('info');
    logger.info('yes');
    expect(sink.records.map((r) => r.message)).toEqual(['yes']);
  });

  it('child loggers append context and share the sink', () => {
    const { sink, logger } = setup('debug');
    const child = logger.child('fdc3');
    const grandchild = child.child('broker');
    child.info('c');
    grandchild.info('g');
    expect(sink.records.map((r) => r.context)).toEqual(['fdc3', 'fdc3.broker']);
  });
});
