import { describe, it, expect } from 'vitest';
import { Capabilities, isCapability, listCapabilities } from '../permissions';

describe('capabilities', () => {
  it('recognizes known capabilities', () => {
    expect(isCapability(Capabilities.ClipboardRead)).toBe(true);
    expect(isCapability('clipboard-read')).toBe(true);
    expect(isCapability('made-up')).toBe(false);
  });

  it('lists all capabilities uniquely', () => {
    const all = listCapabilities();
    expect(all).toContain(Capabilities.Fdc3);
    expect(new Set(all).size).toBe(all.length);
  });
});
