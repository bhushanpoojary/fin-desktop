/**
 * FDC3 Core Module - Phase 1 & 2
 * 
 * Export all FDC3-related types and utilities
 */

// Phase 1: Channels and Context
export type { InstrumentContext, Fdc3Event } from "./Fdc3Types";
export { Fdc3ContextBus } from "./Fdc3ContextBus";
export { Fdc3Provider, useFdc3 } from "./Fdc3ContextProvider";

// Phase 2: Intents and App Directory
export type {
  IntentName,
  TradeContext,
  IntentContext,
  AppIntent,
  IntentResolution,
} from "./Fdc3Intents";

export type {
  AppDefinition,
} from "./Fdc3AppDirectory";

export type {
  IntentResolverOptions,
  MultipleResolveCallback,
} from "./Fdc3IntentResolver";

export { Fdc3AppDirectory } from "./Fdc3AppDirectory";
export { Fdc3IntentResolver } from "./Fdc3IntentResolver";
