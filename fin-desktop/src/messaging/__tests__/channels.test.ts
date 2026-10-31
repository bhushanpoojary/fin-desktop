import { describe, it, expect, vi } from 'vitest';
import { ChannelBus } from '../channels';
import type { ChannelIdentity } from '../channels';

const client1: ChannelIdentity = { uuid: 'c1', name: 'Client 1' };
const client2: ChannelIdentity = { uuid: 'c2', name: 'Client 2' };

describe('Channels', () => {
  it('client dispatches an action to the provider (RPC)', async () => {
    const bus = new ChannelBus();
    const provider = bus.createProvider('calc');
    provider.register<{ a: number; b: number }, number>('add', ({ a, b }) => a + b);

    const client = await bus.connect('calc', client1);
    await expect(client.dispatch('add', { a: 2, b: 3 })).resolves.toBe(5);
  });

  it('supports async handlers', async () => {
    const bus = new ChannelBus();
    const provider = bus.createProvider('calc');
    provider.register('slow', async (n: number) => n * 2);
    const client = await bus.connect('calc', client1);
    await expect(client.dispatch('slow', 21)).resolves.toBe(42);
  });

  it('passes the sender identity to provider handlers', async () => {
    const bus = new ChannelBus();
    const provider = bus.createProvider('echo');
    const handler = vi.fn((_payload: unknown, sender: ChannelIdentity) => sender.uuid);
    provider.register('whoami', handler);
    const client = await bus.connect('echo', client1);
    await expect(client.dispatch('whoami', null)).resolves.toBe('c1');
  });

  it('rejects unknown actions and unknown channels', async () => {
    const bus = new ChannelBus();
    bus.createProvider('calc');
    const client = await bus.connect('calc', client1);
    await expect(client.dispatch('nope', {})).rejects.toThrow(/no action/);
    await expect(bus.connect('missing', client1)).rejects.toThrow(/no provider/);
  });

  it('prevents duplicate providers', () => {
    const bus = new ChannelBus();
    bus.createProvider('calc');
    expect(() => bus.createProvider('calc')).toThrow(/already has a provider/);
  });

  it('provider dispatches to a specific client (reverse RPC)', async () => {
    const bus = new ChannelBus();
    const provider = bus.createProvider('push');
    const c1 = await bus.connect('push', client1);
    const c2 = await bus.connect('push', client2);
    c1.register('ping', () => 'pong-1');
    c2.register('ping', () => 'pong-2');

    await expect(provider.dispatch(client1, 'ping', null)).resolves.toBe('pong-1');
    await expect(provider.dispatch(client2, 'ping', null)).resolves.toBe('pong-2');
  });

  it('provider publishes to all clients that handle the action', async () => {
    const bus = new ChannelBus();
    const provider = bus.createProvider('push');
    const c1 = await bus.connect('push', client1);
    const c2 = await bus.connect('push', client2);
    c1.register('tick', (n: number) => n + 1);
    c2.register('tick', (n: number) => n + 10);
    const results = await provider.publish('tick', 100);
    expect(results.sort((a, b) => (a as number) - (b as number))).toEqual([101, 110]);
  });

  it('tracks connections and fires connect/disconnect handlers', async () => {
    const bus = new ChannelBus();
    const provider = bus.createProvider('rooms');
    const connected = vi.fn();
    const disconnected = vi.fn();
    provider.onConnection(connected);
    provider.onDisconnection(disconnected);

    const c1 = await bus.connect('rooms', client1);
    expect(connected).toHaveBeenCalledWith(client1);
    expect(provider.getConnections()).toHaveLength(1);

    c1.disconnect();
    expect(disconnected).toHaveBeenCalledWith(client1);
    expect(provider.getConnections()).toHaveLength(0);
    expect(c1.isConnected()).toBe(false);
    await expect(c1.dispatch('x', {})).rejects.toThrow(/disconnected/);
  });
});
