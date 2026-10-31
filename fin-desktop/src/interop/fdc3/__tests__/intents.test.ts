import { describe, it, expect } from 'vitest';
import { Intents, isStandardIntent, listStandardIntents } from '../intents';

describe('intents', () => {
  it('exposes well-known standard intents', () => {
    expect(Intents.ViewChart).toBe('ViewChart');
    expect(Intents.StartChat).toBe('StartChat');
    expect(Intents.ViewContact).toBe('ViewContact');
  });

  it('recognizes standard intents', () => {
    expect(isStandardIntent('ViewChart')).toBe(true);
    expect(isStandardIntent('ViewNews')).toBe(true);
    expect(isStandardIntent('DoSomethingCustom')).toBe(false);
  });

  it('lists all standard intents', () => {
    const all = listStandardIntents();
    expect(all).toContain('ViewChart');
    expect(all).toContain('CreateInteraction');
    expect(new Set(all).size).toBe(all.length);
  });
});
