/**
 * FDC3 Intents Type Definitions
 * 
 * Defines the core types for FDC3-style intents, contexts, and resolutions
 * used throughout the FinDesktop application.
 */

/**
 * Supported FDC3 intent names
 */
export type IntentName = "ViewChart" | "ViewNews" | "Trade";

/**
 * Base instrument context containing a symbol/ticker
 */
export interface InstrumentContext {
  instrument: string;  // e.g. "AAPL", "MSFT", "GOOGL"
}

/**
 * Extended context for trade-related intents
 */
export interface TradeContext extends InstrumentContext {
  side?: "BUY" | "SELL";
  quantity?: number;
  price?: number;
}

/**
 * Union type of all supported context types
 */
export type IntentContext = InstrumentContext | TradeContext;

/**
 * Represents an application that can handle specific intents
 */
export interface AppIntent {
  appId: string;              // Unique identifier from app directory
  appTitle: string;           // Display name of the application
  intents: IntentName[];      // List of intents this app can handle
}

/**
 * Result of resolving an intent to a specific application
 */
export interface IntentResolution {
  intent: IntentName;
  appId: string;
  appTitle: string;
}
