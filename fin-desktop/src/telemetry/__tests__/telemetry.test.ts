import { describe, it, expect } from 'vitest';
import { Telemetry } from '../telemetry';
import { MemorySink } from '../events';

function setup(enabled = true, extra = {}) {
  const sink = new MemorySink();
  const telemetry = new Telemetry({ sink, enabled, now: () => 1_000, ...extra });
  return { sink, telemetry };
}

describe('Telemetry', () => {
  it('is a no-op when disabled (privacy by default)', async () => {
    const { sink, telemetry } = setup(false);
    telemetry.track('x');
    await telemetry.flush();
    expect(sink.events).toHaveLength(0);
    expect(telemetry.isEnabled()).toBe(false);
  });

  it('records events and flushes to the sink', async () => {
    const { sink, telemetry } = setup();
    telemetry.track('app.open', { appId: 'blotter' }, 'info');
    expect(sink.events).toHaveLength(0); // buffered until flush
    await telemetry.flush();
    expect(sink.events[0]).toEqual({
      name: 'app.open',
      level: 'info',
      timestamp: 1_000,
      properties: { appId: 'blotter' },
    });
  });

  it('merges common properties into every event', async () => {
    const { sink, telemetry } = setup(true, { commonProperties: { session: 's1' } });
    telemetry.track('e', { a: 1 });
    await telemetry.flush();
    expect(sink.events[0].properties).toEqual({ session: 's1', a: 1 });
  });

  it('redacts configured keys recursively', async () => {
    const { sink, telemetry } = setup(true, { redactKeys: ['password', 'token'] });
    telemetry.track('login', { user: 'jo', password: 'secret', nested: { token: 'abc', ok: 1 } });
    await telemetry.flush();
    expect(sink.events[0].properties).toEqual({
      user: 'jo',
      password: '[REDACTED]',
      nested: { token: '[REDACTED]', ok: 1 },
    });
  });

  it('auto-flushes at the batch size', () => {
    const { sink, telemetry } = setup(true, { batchSize: 2 });
    telemetry.track('a');
    expect(sink.events).toHaveLength(0);
    telemetry.track('b'); // reaches batchSize → auto-flush (sync MemorySink)
    expect(sink.events).toHaveLength(2);
  });

  it('respects runtime opt-in/out', async () => {
    const { sink, telemetry } = setup(false);
    telemetry.setEnabled(true);
    telemetry.track('on');
    telemetry.setEnabled(false);
    telemetry.track('off');
    await telemetry.flush();
    expect(sink.events.map((e) => e.name)).toEqual(['on']);
  });

  it('convenience trackers capture common events', async () => {
    const { sink, telemetry } = setup();
    telemetry.trackAppLaunch('news', { source: 'launcher' });
    telemetry.trackIntent('ViewChart');
    telemetry.trackError(new Error('boom'));
    await telemetry.flush();

    expect(sink.events.map((e) => e.name)).toEqual(['app.launch', 'fdc3.intent', 'error']);
    expect(sink.events[0].properties).toMatchObject({ appId: 'news', source: 'launcher' });
    expect(sink.events[2].level).toBe('error');
    expect(sink.events[2].properties).toMatchObject({ message: 'boom' });
  });

  it('flush is a no-op with an empty buffer', async () => {
    const { sink, telemetry } = setup();
    await telemetry.flush();
    expect(sink.events).toHaveLength(0);
  });
});
