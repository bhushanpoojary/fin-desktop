/**
 * FDC3 2.0 standard context types.
 *
 * Type definitions, factories, and type guards for the FDC3 context data schema, so
 * third-party FDC3 apps interop out of the box. Framework-agnostic and pure.
 * See https://fdc3.finos.org/docs/context/spec
 */

/** Base FDC3 context object. */
export interface Context {
  type: string;
  id?: Record<string, string>;
  name?: string;
}

export const ContextTypes = {
  Instrument: 'fdc3.instrument',
  InstrumentList: 'fdc3.instrumentList',
  Contact: 'fdc3.contact',
  ContactList: 'fdc3.contactList',
  Organization: 'fdc3.organization',
  Country: 'fdc3.country',
  Currency: 'fdc3.currency',
  Email: 'fdc3.email',
  Position: 'fdc3.position',
  Portfolio: 'fdc3.portfolio',
  Chart: 'fdc3.chart',
  Nothing: 'fdc3.nothing',
} as const;

export type ContextType = (typeof ContextTypes)[keyof typeof ContextTypes];

export interface Instrument extends Context {
  type: typeof ContextTypes.Instrument;
  market?: { MIC?: string; name?: string; COUNTRY_ISOALPHA2?: string };
}

export interface InstrumentList extends Context {
  type: typeof ContextTypes.InstrumentList;
  instruments: Instrument[];
}

export interface Contact extends Context {
  type: typeof ContextTypes.Contact;
}

export interface ContactList extends Context {
  type: typeof ContextTypes.ContactList;
  contacts: Contact[];
}

export interface Organization extends Context {
  type: typeof ContextTypes.Organization;
}

export interface Country extends Context {
  type: typeof ContextTypes.Country;
}

export interface Currency extends Context {
  type: typeof ContextTypes.Currency;
}

export interface Email extends Context {
  type: typeof ContextTypes.Email;
  recipients: Contact | ContactList;
  subject?: string;
  textBody?: string;
}

export interface Position extends Context {
  type: typeof ContextTypes.Position;
  instrument: Instrument;
  holding?: number;
}

export interface Portfolio extends Context {
  type: typeof ContextTypes.Portfolio;
  positions: Position[];
}

export interface Chart extends Context {
  type: typeof ContextTypes.Chart;
  instruments: Instrument[];
  style?: 'line' | 'bar' | 'candle' | 'mountain' | 'histogram' | 'heatmap' | string;
}

export interface Nothing extends Context {
  type: typeof ContextTypes.Nothing;
}

export type StandardContext =
  | Instrument
  | InstrumentList
  | Contact
  | ContactList
  | Organization
  | Country
  | Currency
  | Email
  | Position
  | Portfolio
  | Chart
  | Nothing;

// ---- Factories ----

export function createInstrument(ticker: string, extra?: Partial<Instrument>): Instrument {
  return { type: ContextTypes.Instrument, name: ticker, id: { ticker }, ...extra };
}

export function createContact(email: string, name?: string): Contact {
  return { type: ContextTypes.Contact, name, id: { email } };
}

export function createOrganization(name: string, id?: Record<string, string>): Organization {
  return { type: ContextTypes.Organization, name, id };
}

export function createCountry(isoAlpha2: string, name?: string): Country {
  return { type: ContextTypes.Country, name, id: { ISOALPHA2: isoAlpha2 } };
}

export function createCurrency(isoCode: string, name?: string): Currency {
  return { type: ContextTypes.Currency, name, id: { CURRENCY_ISOCODE: isoCode } };
}

export function nothing(): Nothing {
  return { type: ContextTypes.Nothing };
}

// ---- Type guards ----

export function isContext(value: unknown): value is Context {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { type?: unknown }).type === 'string'
  );
}

export function isContextType<T extends Context>(value: unknown, type: string): value is T {
  return isContext(value) && value.type === type;
}

export const isInstrument = (v: unknown): v is Instrument =>
  isContextType<Instrument>(v, ContextTypes.Instrument);
export const isContact = (v: unknown): v is Contact =>
  isContextType<Contact>(v, ContextTypes.Contact);
export const isOrganization = (v: unknown): v is Organization =>
  isContextType<Organization>(v, ContextTypes.Organization);
export const isCountry = (v: unknown): v is Country =>
  isContextType<Country>(v, ContextTypes.Country);
export const isCurrency = (v: unknown): v is Currency =>
  isContextType<Currency>(v, ContextTypes.Currency);
export const isPortfolio = (v: unknown): v is Portfolio =>
  isContextType<Portfolio>(v, ContextTypes.Portfolio);
