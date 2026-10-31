import { describe, it, expect, vi } from 'vitest';
import { InteropBroker } from '../broker';
import { DesktopAgent } from '../desktopAgent';
import { AppDirectory, type AppDirectoryApp } from '../appDirectory';
import {
  createMemoryTransportPair,
  createBusTransport,
  type InteropMessage,
  type PubSubBus,
} from '../fdc3Transport';
import { createInstrument, ContextTypes } from '../context';
import { Intents } from '../intents';

const chartApp: AppDirectoryApp = {
  appId: 'chart',
  name: 'Chart',
  interop: { intents: { listensFor: { [Intents.ViewChart]: { contexts: [ContextTypes.Instrument] } } } },
};

function twoWindows() {
  const [t1, t2] = createMemoryTransportPair();
  const dir = () => new AppDirectory([chartApp]);
  const broker1 = new InteropBroker({ transport: t1, directory: dir() });
  const broker2 = new InteropBroker({ transport: t2, directory: dir() });
  const a = new DesktopAgent(broker1, { appId: 'A' });
  const b = new DesktopAgent(broker2, { appId: 'B' });
  return { broker1, broker2, a, b };
}

describe('cross-window interop (transport)', () => {
  it('propagates channel broadcasts to agents in another window on the same channel', () => {
    const { a, b } = twoWindows();
    const received = vi.fn();
    a.joinUserChannel('red');
    b.joinUserChannel('red');
    b.addContextListener(null, received);

    a.broadcast(createInstrument('AAPL'));

    expect(received).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'AAPL' } }));
  });

  it('does not cross different channels', () => {
    const { a, b } = twoWindows();
    const received = vi.fn();
    a.joinUserChannel('red');
    b.joinUserChannel('blue');
    b.addContextListener(null, received);
    a.broadcast(createInstrument('MSFT'));
    expect(received).not.toHaveBeenCalled();
  });

  it('delivers a raised intent to a listener in another window', () => {
    const { a, b } = twoWindows();
    const handler = vi.fn();
    b.addIntentListener(Intents.ViewChart, handler);
    a.raiseIntent(Intents.ViewChart, createInstrument('NVDA'));
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ id: { ticker: 'NVDA' } }),
      { source: { appId: 'A' } },
    );
  });

  it('delivers each broadcast exactly once (no echo loop)', () => {
    const { a, b } = twoWindows();
    const received = vi.fn();
    a.joinUserChannel('green');
    b.joinUserChannel('green');
    b.addContextListener(ContextTypes.Instrument, received);
    a.broadcast(createInstrument('TSLA'));
    expect(received).toHaveBeenCalledTimes(1);
  });

  it('stops receiving after dispose()', () => {
    const { broker2, a, b } = twoWindows();
    const received = vi.fn();
    a.joinUserChannel('red');
    b.joinUserChannel('red');
    b.addContextListener(null, received);
    broker2.dispose();
    a.broadcast(createInstrument('AMD'));
    expect(received).not.toHaveBeenCalled();
  });

  it('replays the current channel context to a window that joins later', () => {
    // Window A broadcasts before window B's broker is even connected.
    const [t1, t2] = createMemoryTransportPair();
    const broker1 = new InteropBroker({ transport: t1 });
    const a = new DesktopAgent(broker1, { appId: 'A' });
    a.joinUserChannel('red');
    a.broadcast(createInstrument('AAPL'));

    // Window B opens afterwards and joins the same channel.
    const broker2 = new InteropBroker({ transport: t2 });
    const b = new DesktopAgent(broker2, { appId: 'B' });
    const received = vi.fn();
    b.addContextListener(ContextTypes.Instrument, received);

    b.joinUserChannel('red'); // request-state → broker1 replies with AAPL

    expect(received).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'AAPL' } }));
  });
});

describe('createMemoryTransportPair', () => {
  it('delivers to the other side, not the sender', () => {
    const [t1, t2] = createMemoryTransportPair();
    const on1 = vi.fn();
    const on2 = vi.fn();
    t1.subscribe(on1);
    t2.subscribe(on2);
    const msg: InteropMessage = { kind: 'intent', intent: 'X', context: { type: 'fdc3.nothing' } };
    t1.send(msg);
    expect(on2).toHaveBeenCalledWith(msg);
    expect(on1).not.toHaveBeenCalled();
  });
});

describe('createBusTransport', () => {
  it('bridges a pub/sub bus on a single topic', () => {
    const handlers = new Map<string, (p: unknown) => void>();
    const bus: PubSubBus = {
      publish: (topic, payload) => handlers.get(topic)?.(payload),
      subscribe: (topic, handler) => {
        handlers.set(topic, handler);
        return () => handlers.delete(topic);
      },
    };
    const transport = createBusTransport(bus);
    const received = vi.fn();
    transport.subscribe(received);
    const msg: InteropMessage = { kind: 'intent', intent: 'Y', context: { type: 'fdc3.nothing' } };
    transport.send(msg);
    expect(received).toHaveBeenCalledWith(msg);
  });
});
