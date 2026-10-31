import { describe, it, expect, vi } from 'vitest';
import { HotkeyRegistry, parseAccelerator } from '../hotkeys';

describe('parseAccelerator', () => {
  it('parses modifiers and the key', () => {
    const chord = parseAccelerator('Ctrl+Shift+K');
    expect(chord).toEqual({ ctrl: true, alt: false, shift: true, meta: false, key: 'k' });
  });

  it('resolves CmdOrCtrl per platform', () => {
    expect(parseAccelerator('CmdOrCtrl+S', false).ctrl).toBe(true);
    expect(parseAccelerator('CmdOrCtrl+S', false).meta).toBe(false);
    expect(parseAccelerator('CmdOrCtrl+S', true).meta).toBe(true);
    expect(parseAccelerator('CmdOrCtrl+S', true).ctrl).toBe(false);
  });

  it('normalizes key aliases', () => {
    expect(parseAccelerator('Esc').key).toBe('escape');
    expect(parseAccelerator('Ctrl+Space').key).toBe('space');
    expect(parseAccelerator('Up').key).toBe('arrowup');
  });

  it('throws on missing or duplicate keys', () => {
    expect(() => parseAccelerator('Ctrl+Shift')).toThrow(/no key/);
    expect(() => parseAccelerator('K+J')).toThrow(/more than one key/);
  });
});

describe('HotkeyRegistry', () => {
  it('fires the handler for a matching key event', () => {
    const reg = new HotkeyRegistry();
    const handler = vi.fn();
    reg.register('Ctrl+K', handler);
    const handled = reg.handleKeyEvent({ key: 'k', ctrlKey: true });
    expect(handled).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire when modifiers differ', () => {
    const reg = new HotkeyRegistry();
    const handler = vi.fn();
    reg.register('Ctrl+Shift+K', handler);
    expect(reg.handleKeyEvent({ key: 'k', ctrlKey: true })).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    expect(reg.handleKeyEvent({ key: 'k', ctrlKey: true, shiftKey: true })).toBe(true);
  });

  it('treats equivalent spellings as the same binding', () => {
    const reg = new HotkeyRegistry();
    reg.register('Control+K', vi.fn());
    expect(reg.register('Ctrl+K', vi.fn())).toBe(false); // already registered
    expect(reg.isRegistered('ctrl+k')).toBe(true);
  });

  it('matches CmdOrCtrl against the platform modifier', () => {
    const mac = new HotkeyRegistry({ isMac: true });
    const handler = vi.fn();
    mac.register('CmdOrCtrl+S', handler);
    expect(mac.handleKeyEvent({ key: 's', ctrlKey: true })).toBe(false); // ctrl not meta on mac
    expect(mac.handleKeyEvent({ key: 's', metaKey: true })).toBe(true);
  });

  it('matches aliased keys (space / escape / arrows)', () => {
    const reg = new HotkeyRegistry();
    const space = vi.fn();
    reg.register('Ctrl+Space', space);
    expect(reg.handleKeyEvent({ key: ' ', ctrlKey: true })).toBe(true);
    expect(space).toHaveBeenCalled();
  });

  it('unregisters and lists bindings', () => {
    const reg = new HotkeyRegistry();
    reg.register('Ctrl+K', vi.fn());
    reg.register('Ctrl+J', vi.fn());
    expect(reg.list().sort()).toEqual(['Ctrl+J', 'Ctrl+K']);
    expect(reg.unregister('Ctrl+K')).toBe(true);
    expect(reg.isRegistered('Ctrl+K')).toBe(false);
    reg.unregisterAll();
    expect(reg.list()).toEqual([]);
  });
});
