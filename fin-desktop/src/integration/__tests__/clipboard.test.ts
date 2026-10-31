import { describe, it, expect, vi } from 'vitest';
import { Clipboard, InMemoryClipboardBackend, ClipboardFormat } from '../clipboard';

describe('Clipboard', () => {
  it('writes and reads plain text', () => {
    const clip = new Clipboard();
    clip.writeText('hello');
    expect(clip.readText()).toBe('hello');
    expect(clip.hasFormat(ClipboardFormat.Text)).toBe(true);
  });

  it('writes multiple formats at once', () => {
    const clip = new Clipboard();
    clip.write({ [ClipboardFormat.Text]: 'plain', [ClipboardFormat.Html]: '<b>plain</b>' });
    expect(clip.availableFormats().sort()).toEqual(['text/html', 'text/plain']);
    expect(clip.readFormat(ClipboardFormat.Html)).toBe('<b>plain</b>');
  });

  it('writeHtml derives plain text by stripping tags', () => {
    const clip = new Clipboard();
    clip.writeHtml('<p>Hello <b>world</b></p>');
    expect(clip.readText()).toBe('Hello world');
    expect(clip.readFormat(ClipboardFormat.Html)).toBe('<p>Hello <b>world</b></p>');
  });

  it('replaces contents on each write and clears', () => {
    const clip = new Clipboard();
    clip.write({ 'custom/x': 'a' });
    clip.writeText('b');
    expect(clip.hasFormat('custom/x')).toBe(false);
    clip.clear();
    expect(clip.availableFormats()).toEqual([]);
    expect(clip.readText()).toBe('');
  });

  it('notifies onChange and uses the injected backend', () => {
    const onChange = vi.fn();
    const backend = new InMemoryClipboardBackend();
    const clip = new Clipboard({ backend, onChange });
    clip.writeText('x');
    expect(onChange).toHaveBeenCalledWith({ [ClipboardFormat.Text]: 'x' });
    expect(backend.read()).toEqual({ [ClipboardFormat.Text]: 'x' });
  });
});
