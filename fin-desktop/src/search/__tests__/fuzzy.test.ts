import { describe, it, expect } from 'vitest';
import { fuzzyMatch } from '../fuzzy';

describe('fuzzyMatch', () => {
  it('matches an empty query against anything (neutral score)', () => {
    expect(fuzzyMatch('', 'Anything')).toEqual({ matched: true, score: 0, positions: [] });
  });

  it('matches a subsequence case-insensitively and reports positions', () => {
    const m = fuzzyMatch('cht', 'Chart');
    expect(m.matched).toBe(true);
    expect(m.positions).toEqual([0, 1, 4]); // C(0) h(1) t(4)
  });

  it('does not match when characters are out of order or missing', () => {
    expect(fuzzyMatch('xyz', 'Chart').matched).toBe(false);
    expect(fuzzyMatch('tc', 'Chart').matched).toBe(false);
  });

  it('scores a start-of-word / prefix match higher than a mid-word match', () => {
    const prefix = fuzzyMatch('mar', 'Market News');
    const mid = fuzzyMatch('mar', 'Primary Market');
    expect(prefix.matched && mid.matched).toBe(true);
    expect(prefix.score).toBeGreaterThan(mid.score);
  });

  it('rewards consecutive matches over scattered ones', () => {
    const consecutive = fuzzyMatch('cha', 'Chart');
    const scattered = fuzzyMatch('cha', 'Custom Header Area');
    expect(consecutive.score).toBeGreaterThan(scattered.score);
  });

  it('rejects a query longer than the text', () => {
    expect(fuzzyMatch('charts', 'Chart').matched).toBe(false);
  });
});
