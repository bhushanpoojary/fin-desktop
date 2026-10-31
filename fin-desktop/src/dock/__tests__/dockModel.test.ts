import { describe, it, expect, vi } from 'vitest';
import { DockModel } from '../dockModel';
import type { DockButton, DockGroup, DockItem } from '../dockModel';

function button(id: string, appId = id): DockButton {
  return { id, kind: 'button', label: id, action: { type: 'launchApp', appId } };
}

describe('DockModel', () => {
  it('starts empty at the bottom, not auto-hiding', () => {
    const dock = new DockModel();
    expect(dock.getItems()).toEqual([]);
    expect(dock.getPosition()).toBe('bottom');
    expect(dock.isAutoHide()).toBe(false);
    expect(dock.orientation()).toBe('horizontal');
  });

  it('derives orientation from position', () => {
    const dock = new DockModel();
    dock.setPosition('left');
    expect(dock.orientation()).toBe('vertical');
    dock.setPosition('right');
    expect(dock.orientation()).toBe('vertical');
    dock.setPosition('top');
    expect(dock.orientation()).toBe('horizontal');
  });

  it('pins items idempotently and respects insert index', () => {
    const dock = new DockModel();
    dock.addItem(button('a'));
    dock.addItem(button('b'));
    dock.addItem(button('c'), 1);
    dock.addItem(button('a')); // duplicate ignored
    expect(dock.getItems().map((i) => i.id)).toEqual(['a', 'c', 'b']);
  });

  it('removes and reorders items', () => {
    const dock = new DockModel();
    ['a', 'b', 'c'].forEach((id) => dock.addItem(button(id)));
    expect(dock.moveItem('a', 2)).toBe(true);
    expect(dock.getItems().map((i) => i.id)).toEqual(['b', 'c', 'a']);
    expect(dock.removeItem('c')).toBe(true);
    expect(dock.removeItem('missing')).toBe(false);
    expect(dock.getItems().map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('manages dropdown groups', () => {
    const group: DockGroup = { id: 'g', kind: 'group', label: 'Tools', items: [] };
    const dock = new DockModel();
    dock.addItem(group);
    expect(dock.addToGroup('g', button('t1'))).toBe(true);
    expect(dock.addToGroup('g', button('t1'))).toBe(false); // dup
    expect(dock.addToGroup('missing', button('x'))).toBe(false);
    const stored = dock.getItems()[0] as DockGroup;
    expect(stored.items.map((b) => b.id)).toEqual(['t1']);
    expect(dock.removeFromGroup('g', 't1')).toBe(true);
    expect((dock.getItems()[0] as DockGroup).items).toEqual([]);
  });

  it('tracks running apps for the active indicator', () => {
    const dock = new DockModel();
    expect(dock.isRunning('app')).toBe(false);
    dock.setRunning('app', true);
    expect(dock.isRunning('app')).toBe(true);
    expect(dock.runningApps()).toEqual(['app']);
    dock.setRunning('app', false);
    expect(dock.isRunning('app')).toBe(false);
  });

  it('notifies onChange for mutations only', () => {
    const onChange = vi.fn();
    const dock = new DockModel({ onChange });
    dock.addItem(button('a'));
    dock.setPosition('top');
    dock.setPosition('top'); // no-op, no emit
    dock.setAutoHide(true);
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('supports all action types', () => {
    const items: DockItem[] = [
      { id: '1', kind: 'button', label: 'App', action: { type: 'launchApp', appId: 'a' } },
      { id: '2', kind: 'button', label: 'Chart', action: { type: 'raiseIntent', intent: 'ViewChart' } },
      { id: '3', kind: 'button', label: 'WS', action: { type: 'openWorkspace', workspaceId: 'w' } },
      { id: '4', kind: 'button', label: 'Fn', action: { type: 'runFunction', functionId: 'f' } },
      { id: '5', kind: 'button', label: 'Url', action: { type: 'openUrl', url: 'https://x' } },
      { id: 'sep', kind: 'separator' },
    ];
    const dock = new DockModel({ initial: { items } });
    expect(dock.getItems()).toHaveLength(6);
  });

  it('serializes and deserializes (running state is ephemeral)', () => {
    const dock = new DockModel({ initial: { position: 'left', autoHide: true } });
    dock.addItem(button('a'));
    dock.setRunning('a', true);
    const state = dock.serialize();
    expect(state).toEqual({
      position: 'left',
      autoHide: true,
      items: [button('a')],
    });

    const restored = DockModel.deserialize(state);
    expect(restored.getPosition()).toBe('left');
    expect(restored.isAutoHide()).toBe(true);
    expect(restored.getItems().map((i) => i.id)).toEqual(['a']);
    expect(restored.isRunning('a')).toBe(false); // not persisted
  });

  it('deep-clones so external mutation cannot corrupt state', () => {
    const original = button('a');
    const dock = new DockModel();
    dock.addItem(original);
    (original.action as { appId: string }).appId = 'hacked';
    const stored = dock.getItems()[0] as DockButton;
    expect((stored.action as { appId: string }).appId).toBe('a');
  });
});
