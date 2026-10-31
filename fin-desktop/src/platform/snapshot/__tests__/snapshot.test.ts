import { describe, it, expect } from 'vitest';
import {
  createSnapshot,
  serializeSnapshot,
  deserializeSnapshot,
  isValidSnapshot,
  SNAPSHOT_VERSION,
  type WindowSnapshot,
} from '../snapshot';
import { createRoot } from '../../layout/layoutTree';

function sampleWindow(): WindowSnapshot {
  return {
    id: 'win1',
    bounds: { x: 0, y: 0, width: 1200, height: 800 },
    views: [{ id: 'v1', url: 'https://example.com', title: 'Example' }],
    layout: createRoot('s1', 'v1'),
  };
}

describe('snapshot', () => {
  it('creates a snapshot with the current version', () => {
    const snap = createSnapshot([sampleWindow()], 123);
    expect(snap.version).toBe(SNAPSHOT_VERSION);
    expect(snap.createdAt).toBe(123);
    expect(snap.windows).toHaveLength(1);
  });

  it('round-trips through serialize/deserialize', () => {
    const snap = createSnapshot([sampleWindow()], 123);
    const restored = deserializeSnapshot(serializeSnapshot(snap));
    expect(restored).toEqual(snap);
  });

  it('validates well-formed snapshots', () => {
    expect(isValidSnapshot(createSnapshot([sampleWindow()]))).toBe(true);
    expect(isValidSnapshot({ version: 1, createdAt: 1, windows: [] })).toBe(true);
  });

  it('rejects malformed objects', () => {
    expect(isValidSnapshot(null)).toBe(false);
    expect(isValidSnapshot({ version: '1', createdAt: 1, windows: [] })).toBe(false);
    expect(isValidSnapshot({ version: 1, createdAt: 1, windows: {} })).toBe(false);
    expect(isValidSnapshot({ version: 1, createdAt: 1, windows: [{ id: 'x' }] })).toBe(false);
  });

  it('throws on invalid JSON', () => {
    expect(() => deserializeSnapshot('{ not json')).toThrow(/not valid JSON/);
  });

  it('throws on an unexpected shape', () => {
    expect(() => deserializeSnapshot(JSON.stringify({ foo: 'bar' }))).toThrow(/unexpected shape/);
  });

  it('throws on a newer, unsupported version', () => {
    const future = JSON.stringify({
      version: SNAPSHOT_VERSION + 1,
      createdAt: 1,
      windows: [],
    });
    expect(() => deserializeSnapshot(future)).toThrow(/Unsupported snapshot version/);
  });

  it('accepts windows with a null layout', () => {
    const snap = createSnapshot([{ ...sampleWindow(), layout: null }]);
    const restored = deserializeSnapshot(serializeSnapshot(snap));
    expect(restored.windows[0].layout).toBeNull();
  });
});
