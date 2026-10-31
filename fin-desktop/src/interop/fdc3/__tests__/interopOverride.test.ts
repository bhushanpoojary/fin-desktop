import { describe, it, expect, vi } from 'vitest';
import { InteropBroker } from '../broker';
import { DesktopAgent } from '../desktopAgent';
import { createInstrument } from '../context';
import type { InteropOverride } from '../types';

function setup(override: InteropOverride) {
  const broker = new InteropBroker({ override });
  const a = new DesktopAgent(broker, { appId: 'a' });
  const b = new DesktopAgent(broker, { appId: 'b' });
  return { broker, a, b };
}

describe('InteropBroker override', () => {
  it('transforms a broadcast context before delivery', () => {
    const override: InteropOverride = {
      onBeforeBroadcast: (ctx) => ({ ...ctx, id: { ticker: 'OVERRIDDEN' } }),
    };
    const { a, b } = setup(override);
    const received = vi.fn();
    b.joinUserChannel('red');
    b.addContextListener('fdc3.instrument', received);
    a.joinUserChannel('red');
    a.broadcast(createInstrument('AAPL'));
    expect(received).toHaveBeenCalled();
    expect(received.mock.calls[0][0]).toMatchObject({ id: { ticker: 'OVERRIDDEN' } });
  });

  it('blocks a broadcast when the override returns null', () => {
    const { a, b } = setup({ onBeforeBroadcast: () => null });
    const received = vi.fn();
    b.joinUserChannel('red');
    b.addContextListener(null, received);
    a.joinUserChannel('red');
    a.broadcast(createInstrument('AAPL'));
    expect(received).not.toHaveBeenCalled();
  });

  it('redirects a raised intent to a different intent/context', () => {
    const override: InteropOverride = {
      onBeforeRaiseIntent: () => ({ intent: 'ViewNews', context: createInstrument('REDIR') }),
    };
    const { broker, a } = setup(override);
    const news = vi.fn();
    broker.addIntentListener('ViewNews', news);
    const res = a.raiseIntent('ViewChart', createInstrument('AAPL'));
    expect(res.intent).toBe('ViewNews');
    expect(news).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'REDIR' } }), expect.anything());
  });

  it('blocks a raised intent entirely', () => {
    const { broker, a } = setup({ onBeforeRaiseIntent: () => ({ block: true }) });
    const chart = vi.fn();
    broker.addIntentListener('ViewChart', chart);
    const res = a.raiseIntent('ViewChart', createInstrument('AAPL'));
    expect(res.deliveredTo).toBe(0);
    expect(chart).not.toHaveBeenCalled();
  });

  it('leaves traffic unchanged when hooks return nothing', () => {
    const { broker, a } = setup({ onBeforeRaiseIntent: () => undefined });
    const chart = vi.fn();
    broker.addIntentListener('ViewChart', chart);
    const res = a.raiseIntent('ViewChart', createInstrument('AAPL'));
    expect(res.intent).toBe('ViewChart');
    expect(chart).toHaveBeenCalledTimes(1);
  });
});
