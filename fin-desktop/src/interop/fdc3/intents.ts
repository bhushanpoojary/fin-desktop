/**
 * FDC3 2.0 standard intents.
 *
 * The well-known intent names from the FDC3 intents spec, plus helpers. Custom intents are
 * allowed (IntentName is a string); these constants give type-safe access to the standards.
 * See https://fdc3.finos.org/docs/intents/spec
 */

export const Intents = {
  ViewChart: 'ViewChart',
  ViewInstrument: 'ViewInstrument',
  ViewQuote: 'ViewQuote',
  ViewNews: 'ViewNews',
  ViewAnalysis: 'ViewAnalysis',
  ViewResearch: 'ViewResearch',
  ViewContact: 'ViewContact',
  ViewHoldings: 'ViewHoldings',
  ViewOrders: 'ViewOrders',
  ViewInteractions: 'ViewInteractions',
  ViewProfile: 'ViewProfile',
  ViewMessages: 'ViewMessages',
  StartCall: 'StartCall',
  StartChat: 'StartChat',
  StartEmail: 'StartEmail',
  CreateInteraction: 'CreateInteraction',
} as const;

export type StandardIntent = (typeof Intents)[keyof typeof Intents];

/** Any intent name — a standard one or a custom string. */
export type IntentName = StandardIntent | (string & {});

const STANDARD_INTENT_SET = new Set<string>(Object.values(Intents));

export function isStandardIntent(name: string): name is StandardIntent {
  return STANDARD_INTENT_SET.has(name);
}

export function listStandardIntents(): StandardIntent[] {
  return Object.values(Intents);
}
