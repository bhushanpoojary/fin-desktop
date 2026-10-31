import { describe, it, expect, vi } from 'vitest';
import { InterAppBus } from '../interAppBus';
import { ChannelBus } from '../channels';
import { ExternalGateway, ExternalClient, createDuplexPair, decodeWire, encodeWire } from '../external';
import type { WireIdentity } from '../external';

const remote: WireIdentity = { uuid: 'remote', name: 'Python Bot' };

function wire() {
  const bus = new InterAppBus();
  const channels = new ChannelBus();
  const gateway = new ExternalGateway(bus, channels);
  const [serverSide, clientSide] = createDuplexPair();
  gateway.accept(serverSide);
  const client = new ExternalClient(clientSide);
  return { bus, channels, gateway, client };
}

describe('wire protocol', () => {
  it('encodes and decodes, rejecting malformed frames', () => {
    const frame = encodeWire({ t: 'publish', topic: 'x', message: 1 });
    expect(decodeWire(frame)).toEqual({ t: 'publish', topic: 'x', message: 1 });
    expect(decodeWire('not json')).toBeNull();
    expect(decodeWire('{"no":"type"}')).toBeNull();
  });
});

describe('ExternalGateway + ExternalClient', () => {
  it('handshakes and tracks the connection count', async () => {
    const { gateway, client } = wire();
    await client.connect(remote);
    expect(client.getIdentity()).toEqual(remote);
    expect(gateway.getConnectionCount()).toBe(1);
  });

  it('rejects when authentication fails', async () => {
    const bus = new InterAppBus();
    const channels = new ChannelBus();
    const gateway = new ExternalGateway(bus, channels, { authenticate: ({ token }) => token === 'secret' });
    const [s, c] = createDuplexPair();
    gateway.accept(s);
    const client = new ExternalClient(c);
    await expect(client.connect(remote, 'wrong')).rejects.toThrow(/authentication failed/);
    expect(gateway.getConnectionCount()).toBe(0);
  });

  it('receives in-process publishes over the wire', async () => {
    const { bus, client } = wire();
    await client.connect(remote);
    const handler = vi.fn();
    client.subscribe('quotes', handler);
    bus.publish('quotes', { px: 42 }, { uuid: 'internal', name: 'Chart' });
    expect(handler).toHaveBeenCalledWith({ px: 42 }, { uuid: 'internal', name: 'Chart' }, 'quotes');
  });

  it('forwards remote publishes into the in-process bus', async () => {
    const { bus, client } = wire();
    await client.connect(remote);
    const internal = vi.fn();
    bus.subscribe({ uuid: 'internal' }, undefined, 'orders', internal);
    client.publish('orders', { side: 'BUY' });
    expect(internal).toHaveBeenCalledWith({ side: 'BUY' }, remote, 'orders');
  });

  it('delivers point-to-point sends addressed to the remote identity', async () => {
    const { bus, client } = wire();
    await client.connect(remote);
    const handler = vi.fn();
    client.subscribe('dm', handler);
    bus.send(remote, 'dm', 'hi', { uuid: 'internal' });
    expect(handler).toHaveBeenCalledWith('hi', { uuid: 'internal' }, 'dm');
  });

  it('dispatches channel RPC to an in-process provider', async () => {
    const { channels, client } = wire();
    const provider = channels.createProvider('calc');
    provider.register<{ a: number; b: number }, number>('add', ({ a, b }) => a + b);
    await client.connect(remote);
    await expect(client.dispatch('calc', 'add', { a: 4, b: 5 })).resolves.toBe(9);
  });

  it('surfaces RPC errors for unknown channels/actions', async () => {
    const { channels, client } = wire();
    channels.createProvider('calc');
    await client.connect(remote);
    await expect(client.dispatch('missing', 'x', {})).rejects.toThrow(/no provider/);
    await expect(client.dispatch('calc', 'nope', {})).rejects.toThrow(/no action/);
  });

  it('cleans up bus subscriptions on disconnect', async () => {
    const { bus, gateway, client } = wire();
    await client.connect(remote);
    client.subscribe('quotes', vi.fn());
    expect(bus.subscriptionCount()).toBe(1);
    client.disconnect();
    expect(bus.subscriptionCount()).toBe(0);
    expect(gateway.getConnectionCount()).toBe(0);
  });

  it('ignores bus operations before a hello handshake', () => {
    const bus = new InterAppBus();
    const channels = new ChannelBus();
    const gateway = new ExternalGateway(bus, channels);
    const [s, c] = createDuplexPair();
    gateway.accept(s);
    // Send a publish without saying hello — must be ignored.
    c.send(encodeWire({ t: 'publish', topic: 'x', message: 1 }));
    expect(gateway.getConnectionCount()).toBe(0);
  });
});
