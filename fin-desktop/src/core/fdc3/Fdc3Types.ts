/**
 * FDC3 Types - Phase 1
 * 
 * Basic FDC3-style types for app-to-app context communication
 */

export type InstrumentContext = {
  instrument: string;          // e.g. "AAPL"
  sourceAppId?: string;        // optional app id that sent it
  timestamp?: number;          // Date.now()
};

export type Fdc3Event = {
  type: "CONTEXT_BROADCAST";
  context: InstrumentContext;
};
