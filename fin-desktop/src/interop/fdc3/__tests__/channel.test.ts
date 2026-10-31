import { describe, it, expect, vi } from 'vitest';
import { ChannelImpl } from '../channel';
import { createInstrument, ContextTypes } from '../context';

describe('ChannelImpl', () => {
  it('delivers broadcasts to listeners', () => {
    const ch = new ChannelImpl('red', 'user');
    const handler = vi.fn();
    ch.addContextListener(null, handler);
    const aapl = createInstrument('AAPL');
    ch.broadcast(aapl);
    expect(handler).toHaveBeenCalledWith(aapl);
  });

  it('filters typed listeners by context type', () => {
    const ch = new ChannelImpl('red', 'user');
    const onInstrument = vi.fn();
    ch.addContextListener(ContextTypes.Instrument, onInstrument);
    ch.broadcast({ type: ContextTypes.Contact, name: 'x' });
    expect(onInstrument).not.toHaveBeenCalled();
    ch.broadcast(createInstrument('MSFT'));
    expect(onInstrument).toHaveBeenCalledTimes(1);
  });

  it('replays the latest matching context to new listeners', () => {
    const ch = new ChannelImpl('red', 'user');
    ch.broadcast(createInstrument('TSLA'));
    const late = vi.fn();
    ch.addContextListener(ContextTypes.Instrument, late);
    expect(late).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'TSLA' } }));
  });

  it('getCurrentContext returns latest overall or by type', () => {
    const ch = new ChannelImpl('red', 'user');
    expect(ch.getCurrentContext()).toBeNull();
    ch.broadcast(createInstrument('NVDA'));
    ch.broadcast({ type: ContextTypes.Contact, name: 'Jo' });
    expect(ch.getCurrentContext()?.type).toBe(ContextTypes.Contact);
    expect(ch.getCurrentContext(ContextTypes.Instrument)?.id?.ticker).toBe('NVDA');
  });

  it('stops delivering after unsubscribe', () => {
    const ch = new ChannelImpl('red', 'user');
    const handler = vi.fn();
    const listener = ch.addContextListener(null, handler);
    listener.unsubscribe();
    ch.broadcast(createInstrument('AMD'));
    expect(handler).not.toHaveBeenCalled();
  });
});
