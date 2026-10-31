import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDesktopAgent, installFdc3, initializeFdc3 } from '../bootstrap';
import { createInstrument } from '../context';
import { Intents } from '../intents';
import type { PubSubBus } from '../fdc3Transport';
import type { AppDirectoryApp } from '../appDirectory';

function recordingBus() {
  const published: { topic: string; payload: unknown }[] = [];
  const bus: PubSubBus = {
    publish: (topic, payload) => published.push({ topic, payload }),
    subscribe: () => () => {},
  };
  return { bus, published };
}

const chartApp: AppDirectoryApp = {
  appId: 'chart',
  name: 'Chart',
  interop: { intents: { listensFor: { [Intents.ViewChart]: { contexts: ['fdc3.instrument'] } } } },
};

describe('createDesktopAgent', () => {
  it('publishes broadcasts onto the bus transport', () => {
    const { bus, published } = recordingBus();
    const agent = createDesktopAgent(bus, { appId: 'A' });
    agent.joinUserChannel('red');
    agent.broadcast(createInstrument('AAPL'));

    expect(published).toContainEqual({
      topic: 'fdc3:interop',
      payload: expect.objectContaining({ kind: 'broadcast', channelId: 'red' }),
    });
  });

  it('wires the provided app directory for discovery', () => {
    const { bus } = recordingBus();
    const agent = createDesktopAgent(bus, { apps: [chartApp] });
    expect(agent.findIntent(Intents.ViewChart).apps.map((a) => a.appId)).toEqual(['chart']);
  });

  it('honours a custom topic', () => {
    const { bus, published } = recordingBus();
    const agent = createDesktopAgent(bus, { topic: 'my:fdc3' });
    agent.joinUserChannel('blue');
    agent.broadcast(createInstrument('MSFT'));
    expect(published[0].topic).toBe('my:fdc3');
  });
});

describe('installFdc3 / initializeFdc3', () => {
  beforeEach(() => {
    delete (window as { fdc3?: unknown }).fdc3;
  });

  it('installs the agent on window.fdc3 and fires fdc3Ready', () => {
    const { bus } = recordingBus();
    const ready = vi.fn();
    window.addEventListener('fdc3Ready', ready);
    const agent = createDesktopAgent(bus);
    installFdc3(agent);
    expect(window.fdc3).toBe(agent);
    expect(ready).toHaveBeenCalled();
    window.removeEventListener('fdc3Ready', ready);
  });

  it('initializeFdc3 creates and installs in one call', () => {
    const { bus } = recordingBus();
    const agent = initializeFdc3(bus, { appId: 'X' });
    expect(window.fdc3).toBe(agent);
  });
});
