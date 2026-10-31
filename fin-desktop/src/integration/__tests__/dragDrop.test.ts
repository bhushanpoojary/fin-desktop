import { describe, it, expect, vi } from 'vitest';
import { DragManager, payloadFormats, accepts } from '../dragDrop';
import type { DragPayload, DropTarget } from '../dragDrop';

function textPayload(text = 'AAPL'): DragPayload {
  return { items: [{ format: 'text/plain', data: text }], source: { appId: 'src' } };
}

function filePayload(): DragPayload {
  return { items: [], files: [{ name: 'report.csv', size: 1024 }], source: { appId: 'src' } };
}

function target(id: string, acceptsList: string[], onDrop = vi.fn()): DropTarget {
  return { id, accepts: acceptsList, onDrop };
}

describe('payload helpers', () => {
  it('lists item formats plus the files pseudo-format', () => {
    expect(payloadFormats(textPayload())).toEqual(['text/plain']);
    expect(payloadFormats(filePayload())).toEqual(['files']);
  });

  it('accepts via explicit format, wildcard, or files', () => {
    expect(accepts(target('t', ['text/plain']), textPayload())).toBe(true);
    expect(accepts(target('t', ['*']), textPayload())).toBe(true);
    expect(accepts(target('t', ['files']), filePayload())).toBe(true);
    expect(accepts(target('t', ['text/html']), textPayload())).toBe(false);
  });
});

describe('DragManager', () => {
  it('starts and ends a single session', () => {
    const mgr = new DragManager();
    expect(mgr.startDrag(textPayload())).toBe(true);
    expect(mgr.isDragging()).toBe(true);
    expect(mgr.startDrag(textPayload())).toBe(false); // already active
    mgr.cancel();
    expect(mgr.isDragging()).toBe(false);
  });

  it('rejects empty payloads', () => {
    const mgr = new DragManager();
    expect(mgr.startDrag({ items: [] })).toBe(false);
  });

  it('reports canDrop against registered targets', () => {
    const mgr = new DragManager();
    mgr.registerTarget(target('accepts', ['text/plain']));
    mgr.registerTarget(target('rejects', ['text/html']));
    mgr.startDrag(textPayload());
    expect(mgr.canDrop('accepts')).toBe(true);
    expect(mgr.canDrop('rejects')).toBe(false);
    expect(mgr.canDrop('unknown')).toBe(false);
  });

  it('tracks the hovered target', () => {
    const mgr = new DragManager();
    mgr.registerTarget(target('t', ['*']));
    mgr.startDrag(textPayload());
    expect(mgr.dragOver('t')).toBe(true);
    expect(mgr.getOverId()).toBe('t');
  });

  it('delivers the payload on an accepted drop and ends the session', () => {
    const onDrop = vi.fn();
    const mgr = new DragManager();
    mgr.registerTarget(target('t', ['text/plain'], onDrop));
    const payload = textPayload('MSFT');
    mgr.startDrag(payload);
    expect(mgr.drop('t')).toBe(true);
    expect(onDrop).toHaveBeenCalledWith(payload, expect.objectContaining({ id: 't' }));
    expect(mgr.isDragging()).toBe(false);
  });

  it('does not deliver to a rejecting target but still ends the session', () => {
    const onDrop = vi.fn();
    const mgr = new DragManager();
    mgr.registerTarget(target('t', ['text/html'], onDrop));
    mgr.startDrag(textPayload());
    expect(mgr.drop('t')).toBe(false);
    expect(onDrop).not.toHaveBeenCalled();
    expect(mgr.isDragging()).toBe(false);
  });

  it('delivers files to a files target', () => {
    const onDrop = vi.fn();
    const mgr = new DragManager();
    mgr.registerTarget(target('drop', ['files'], onDrop));
    mgr.startDrag(filePayload());
    expect(mgr.drop('drop')).toBe(true);
    expect(onDrop).toHaveBeenCalled();
  });

  it('unregistering a target removes it and clears hover', () => {
    const mgr = new DragManager();
    const off = mgr.registerTarget(target('t', ['*']));
    mgr.startDrag(textPayload());
    mgr.dragOver('t');
    off();
    expect(mgr.getTarget('t')).toBeUndefined();
    expect(mgr.getOverId()).toBeNull();
  });

  it('notifies onChange on start/over/drop', () => {
    const onChange = vi.fn();
    const mgr = new DragManager({ onChange });
    mgr.registerTarget(target('t', ['*']));
    mgr.startDrag(textPayload());
    mgr.dragOver('t');
    mgr.drop('t');
    expect(onChange).toHaveBeenCalledTimes(3);
  });
});
