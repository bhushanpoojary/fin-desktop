import { describe, it, expect, vi } from 'vitest';
import { InteropBroker } from '../broker';
import { DesktopAgent } from '../desktopAgent';
import { AppDirectory, type AppDirectoryApp } from '../appDirectory';
import { createInstrument, ContextTypes } from '../context';
import { Intents } from '../intents';

const chartApp: AppDirectoryApp = {
  appId: 'chart',
  name: 'Chart',
  interop: { intents: { listensFor: { [Intents.ViewChart]: { contexts: [ContextTypes.Instrument] } } } },
};

function setup() {
  const broker = new InteropBroker({ directory: new AppDirectory([chartApp]) });
  const a = new DesktopAgent(broker, { appId: 'appA' });
  const b = new DesktopAgent(broker, { appId: 'appB' });
  return { broker, a, b };
}

describe('DesktopAgent — channels & context', () => {
  it('two agents on the same user channel exchange context', () => {
    const { a, b } = setup();
    const received = vi.fn();
    a.joinUserChannel('red');
    b.joinUserChannel('red');
    b.addContextListener(null, received);

    a.broadcast(createInstrument('AAPL'));
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'AAPL' } }));
  });

  it('does not deliver across different channels', () => {
    const { a, b } = setup();
    const received = vi.fn();
    a.joinUserChannel('red');
    b.joinUserChannel('blue');
    b.addContextListener(null, received);
    a.broadcast(createInstrument('MSFT'));
    expect(received).not.toHaveBeenCalled();
  });

  it('replays the channel context when an agent joins', () => {
    const { a, b } = setup();
    a.joinUserChannel('green');
    a.broadcast(createInstrument('TSLA'));

    const received = vi.fn();
    b.addContextListener(ContextTypes.Instrument, received); // no channel yet → nothing
    expect(received).not.toHaveBeenCalled();

    b.joinUserChannel('green'); // joining replays cached context to the listener
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'TSLA' } }));
  });

  it('broadcast is a no-op when not joined to a channel', () => {
    const { a } = setup();
    expect(() => a.broadcast(createInstrument('X'))).not.toThrow();
  });

  it('joining an unknown user channel throws', () => {
    const { a } = setup();
    expect(() => a.joinUserChannel('nope')).toThrow(/No user channel/);
  });
});

describe('DesktopAgent — intents & discovery', () => {
  it('raiseIntent delivers context to a listening agent', () => {
    const { a, b } = setup();
    const handler = vi.fn();
    b.addIntentListener(Intents.ViewChart, handler);

    const resolution = a.raiseIntent(Intents.ViewChart, createInstrument('AAPL'));
    expect(resolution.deliveredTo).toBe(1);
    expect(resolution.source).toEqual({ appId: 'appA' });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ id: { ticker: 'AAPL' } }),
      { source: { appId: 'appA' } },
    );
  });

  it('raiseIntentForContext resolves an intent from the directory', () => {
    const { a, b } = setup();
    const handler = vi.fn();
    b.addIntentListener(Intents.ViewChart, handler);
    const resolution = a.raiseIntentForContext(createInstrument('NVDA'));
    expect(resolution.intent).toBe(Intents.ViewChart);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('findIntent / findIntentsByContext query the directory', () => {
    const { a } = setup();
    expect(a.findIntent(Intents.ViewChart).apps.map((x) => x.appId)).toEqual(['chart']);
    expect(
      a.findIntentsByContext(createInstrument('AMD')).map((r) => r.intent.name),
    ).toEqual([Intents.ViewChart]);
  });

  it('getInfo reports FDC3 2.0', () => {
    const { a } = setup();
    expect(a.getInfo().fdc3Version).toBe('2.0');
    expect(a.getInfo().provider).toBe('FinDesktop');
  });
});
