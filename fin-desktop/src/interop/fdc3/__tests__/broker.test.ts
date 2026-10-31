import { describe, it, expect, vi } from 'vitest';
import { InteropBroker } from '../broker';
import { createInstrument } from '../context';

describe('InteropBroker', () => {
  it('exposes the default colored user channels', () => {
    const broker = new InteropBroker();
    const channels = broker.getUserChannels();
    expect(channels.map((c) => c.id)).toContain('red');
    expect(channels).toHaveLength(8);
    expect(channels.every((c) => c.type === 'user')).toBe(true);
    expect(broker.getChannel('blue')?.displayMetadata?.color).toBe('#1976d2');
  });

  it('getOrCreateChannel is idempotent for app channels', () => {
    const broker = new InteropBroker();
    const a = broker.getOrCreateChannel('orders');
    const b = broker.getOrCreateChannel('orders');
    expect(a).toBe(b);
    expect(a.type).toBe('app');
  });

  it('createPrivateChannel yields unique private channels', () => {
    const broker = new InteropBroker();
    const p1 = broker.createPrivateChannel();
    const p2 = broker.createPrivateChannel();
    expect(p1.id).not.toBe(p2.id);
    expect(p1.type).toBe('private');
  });

  it('routes raised intents to all registered listeners', () => {
    const broker = new InteropBroker();
    const h1 = vi.fn();
    const h2 = vi.fn();
    broker.addIntentListener('ViewChart', h1);
    broker.addIntentListener('ViewChart', h2);
    const ctx = createInstrument('AAPL');

    const resolution = broker.raiseIntent('ViewChart', ctx, { appId: 'caller' });

    expect(resolution).toEqual({ intent: 'ViewChart', source: { appId: 'caller' }, deliveredTo: 2 });
    expect(h1).toHaveBeenCalledWith(ctx, { source: { appId: 'caller' } });
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('reports zero delivery when no listener is registered', () => {
    const broker = new InteropBroker();
    expect(broker.raiseIntent('ViewNews', createInstrument('X')).deliveredTo).toBe(0);
  });
});
