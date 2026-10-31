import { describe, it, expect } from 'vitest';
import {
  ContextTypes,
  createInstrument,
  createContact,
  createCurrency,
  createCountry,
  createOrganization,
  nothing,
  isContext,
  isContextType,
  isInstrument,
  isContact,
  isCurrency,
  type Instrument,
} from '../context';

describe('context factories', () => {
  it('creates an instrument with ticker id and name', () => {
    const aapl = createInstrument('AAPL');
    expect(aapl).toEqual({ type: 'fdc3.instrument', name: 'AAPL', id: { ticker: 'AAPL' } });
  });

  it('merges extra fields into an instrument', () => {
    const aapl = createInstrument('AAPL', { id: { ticker: 'AAPL', ISIN: 'US0378331005' } });
    expect(aapl.id).toEqual({ ticker: 'AAPL', ISIN: 'US0378331005' });
    expect(aapl.type).toBe(ContextTypes.Instrument);
  });

  it('creates a contact, currency, country, organization', () => {
    expect(createContact('jo@x.com', 'Jo')).toEqual({
      type: 'fdc3.contact',
      name: 'Jo',
      id: { email: 'jo@x.com' },
    });
    expect(createCurrency('USD')).toEqual({
      type: 'fdc3.currency',
      name: undefined,
      id: { CURRENCY_ISOCODE: 'USD' },
    });
    expect(createCountry('US', 'United States')).toEqual({
      type: 'fdc3.country',
      name: 'United States',
      id: { ISOALPHA2: 'US' },
    });
    expect(createOrganization('Apple', { LEI: 'HWUPKR0MPOU8FGXBT394' }).id?.LEI).toBe(
      'HWUPKR0MPOU8FGXBT394',
    );
  });

  it('creates a nothing context', () => {
    expect(nothing()).toEqual({ type: 'fdc3.nothing' });
  });
});

describe('context type guards', () => {
  it('isContext accepts objects with a string type', () => {
    expect(isContext({ type: 'fdc3.instrument' })).toBe(true);
    expect(isContext(null)).toBe(false);
    expect(isContext({})).toBe(false);
    expect(isContext({ type: 42 })).toBe(false);
  });

  it('isContextType narrows by type', () => {
    const ctx: unknown = createInstrument('MSFT');
    expect(isContextType<Instrument>(ctx, ContextTypes.Instrument)).toBe(true);
    expect(isContextType<Instrument>(ctx, ContextTypes.Contact)).toBe(false);
  });

  it('specific guards discriminate', () => {
    const inst = createInstrument('TSLA');
    expect(isInstrument(inst)).toBe(true);
    expect(isContact(inst)).toBe(false);
    expect(isCurrency(createCurrency('EUR'))).toBe(true);
    expect(isInstrument(createContact('a@b.com'))).toBe(false);
  });
});
