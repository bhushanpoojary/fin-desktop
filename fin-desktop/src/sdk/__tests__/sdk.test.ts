import { describe, it, expect, vi } from 'vitest';
import {
  createMockFdc3,
  createMockFdc3Pair,
  createMockPlatform,
  MemoryPlatformHost,
} from '../testing';
import { getFdc3, isInFinDesktop } from '../accessors';
import { fdc3 as fdc3ns } from '../index';

describe('SDK namespaced exports', () => {
  it('exposes the fdc3 namespace helpers', () => {
    expect(typeof fdc3ns.createInstrument).toBe('function');
    expect(fdc3ns.ContextTypes.Instrument).toBe('fdc3.instrument');
  });
});

describe('accessors', () => {
  it('isInFinDesktop reflects window.fdc3 presence', () => {
    delete (window as { fdc3?: unknown }).fdc3;
    expect(isInFinDesktop()).toBe(false);
    window.fdc3 = createMockFdc3();
    expect(isInFinDesktop()).toBe(true);
    delete (window as { fdc3?: unknown }).fdc3;
  });

  it('getFdc3 throws a helpful error when not in the container', () => {
    delete (window as { fdc3?: unknown }).fdc3;
    expect(() => getFdc3()).toThrow(/not available/);
  });
});

describe('createMockFdc3', () => {
  it('provides a working standalone agent', () => {
    const agent = createMockFdc3({ appId: 'test' });
    const received = vi.fn();
    agent.joinUserChannel('red');
    agent.addContextListener(null, received);
    agent.broadcast(fdc3ns.createInstrument('AAPL'));
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'AAPL' } }));
  });
});

describe('createMockFdc3Pair', () => {
  it('lets two mock apps interop', () => {
    const [a, b] = createMockFdc3Pair({ appIds: ['A', 'B'] });
    const received = vi.fn();
    a.joinUserChannel('blue');
    b.joinUserChannel('blue');
    b.addContextListener(null, received);
    a.broadcast(fdc3ns.createInstrument('MSFT'));
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ id: { ticker: 'MSFT' } }));
  });
});

describe('createMockPlatform', () => {
  it('records views, bounds, and visibility', () => {
    const { platform, host } = createMockPlatform();
    const win = platform.createWindow({ x: 0, y: 0, width: 1000, height: 800 });
    const a = win.addView('https://a.test');
    win.splitView(a, 'right', 'https://b.test');

    expect(host).toBeInstanceOf(MemoryPlatformHost);
    expect([...host.views.values()].map((v) => v.url).sort()).toEqual([
      'https://a.test',
      'https://b.test',
    ]);
    expect(host.visibleViewIds()).toHaveLength(2);
    expect(host.views.get(a)?.bounds).toEqual({ x: 0, y: 0, width: 500, height: 800 });
  });

  it('respects a passed-in security guard', () => {
    const { platform } = createMockPlatform({ canOpenUrl: (url) => url.startsWith('https://ok') });
    const win = platform.createWindow({ x: 0, y: 0, width: 800, height: 600 });
    expect(() => win.addView('https://evil.test')).toThrow(/Blocked by policy/);
  });
});
