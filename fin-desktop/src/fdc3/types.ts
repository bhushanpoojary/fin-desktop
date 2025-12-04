export interface SelectedInstrumentContext {
  instrument: string; // e.g. "AAPL"
  sourceAppId?: string; // optional id of app that published
  timestamp?: string;   // ISO string
}

export type Fdc3EventType = "selectedInstrumentChanged";

export interface Fdc3Event {
  type: Fdc3EventType;
  context: SelectedInstrumentContext;
}
