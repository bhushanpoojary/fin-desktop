import { describe, it, expect, vi } from 'vitest';
import { InterAppBus } from '../interAppBus';
import type { AppIdentity } from '../interAppBus';

const appA: AppIdentity = { uuid: 'a', name: 'App A' };
const appB: AppIdentity = { uuid: 'b', name: 'App B' };
const appC: AppIdentity = { uuid: 'c', name: 'App C' };

describe('InterAppBus', () => {
  it('publishes a topic to all subscribers and counts deliveries', () => {
    const bus = new InterAppBus();
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.subscribe(appB, undefined, 'quotes', h1);
    bus.subscribe(appC, undefined, 'quotes', h2);
    const delivered = bus.publish('quotes', { px: 10 }, appA);
    expect(delivered).toBe(2);
    expect(h1).toHaveBeenCalledWith({ px: 10 }, appA, 'quotes');
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('does not deliver to other topics', () => {
    const bus = new InterAppBus();
    const h = vi.fn();
    bus.subscribe(appB, undefined, 'quotes', h);
    bus.publish('news', 'hi', appA);
    expect(h).not.toHaveBeenCalled();
  });

  it('filters by sender when a source identity is given', () => {
    const bus = new InterAppBus();
    const h = vi.fn();
    bus.subscribe(appB, { uuid: 'a' }, 'quotes', h); // only from App A
    bus.publish('quotes', 1, appC); // other sender
    expect(h).not.toHaveBeenCalled();
    bus.publish('quotes', 2, appA);
    expect(h).toHaveBeenCalledWith(2, appA, 'quotes');
  });

  it('sends point-to-point only to the target identity', () => {
    const bus = new InterAppBus();
    const toB = vi.fn();
    const toC = vi.fn();
    bus.subscribe(appB, undefined, 'dm', toB);
    bus.subscribe(appC, undefined, 'dm', toC);
    const delivered = bus.send(appB, 'dm', 'secret', appA);
    expect(delivered).toBe(1);
    expect(toB).toHaveBeenCalledWith('secret', appA, 'dm');
    expect(toC).not.toHaveBeenCalled();
  });

  it('unsubscribe stops delivery', () => {
    const bus = new InterAppBus();
    const h = vi.fn();
    const sub = bus.subscribe(appB, undefined, 'quotes', h);
    sub.unsubscribe();
    bus.publish('quotes', 1, appA);
    expect(h).not.toHaveBeenCalled();
    expect(bus.subscriptionCount()).toBe(0);
  });

  it('unsubscribeAll removes every subscription for an owner', () => {
    const bus = new InterAppBus();
    bus.subscribe(appB, undefined, 'quotes', vi.fn());
    bus.subscribe(appB, undefined, 'news', vi.fn());
    bus.subscribe(appC, undefined, 'quotes', vi.fn());
    bus.unsubscribeAll(appB);
    expect(bus.subscriptionCount()).toBe(1);
  });
});
