import { describe, it, expect } from 'vitest';
import { negotiateFdc3Version, supportsFdc3, SUPPORTED_FDC3_VERSIONS } from '../versionNegotiation';

describe('FDC3 version negotiation', () => {
  it('reports supported versions', () => {
    expect(supportsFdc3('2.0')).toBe(true);
    expect(supportsFdc3('1.2')).toBe(true);
    expect(supportsFdc3('3.0')).toBe(false);
  });

  it('picks the highest mutually-supported version', () => {
    expect(negotiateFdc3Version(['1.2', '2.0'])).toBe('2.0');
    expect(negotiateFdc3Version(['1.2'])).toBe('1.2');
  });

  it('returns null when there is no overlap', () => {
    expect(negotiateFdc3Version(['3.0', '0.9'])).toBeNull();
  });

  it('honors a custom supported set', () => {
    expect(negotiateFdc3Version(['1.2', '2.0'], ['1.2'])).toBe('1.2');
  });

  it('exposes versions newest-first', () => {
    expect(SUPPORTED_FDC3_VERSIONS[0]).toBe('2.0');
  });
});
