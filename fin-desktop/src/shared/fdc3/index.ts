/**
 * Shared FDC3 Utilities Export
 * 
 * Convenient exports for FDC3 initialization and usage
 */

// Initialization
export {
  initializeFdc3Intents,
  createFdc3DesktopApi,
  setMultipleResolveCallback,
  getIntentResolver,
} from "./fdc3DesktopApi";

// React Hooks
export { useIntent, useIntentListener } from "./hooks/useIntent";
export type { UseIntentOptions, UseIntentResult } from "./hooks/useIntent";

// Providers
export { IntentResolverProvider } from "./providers/IntentResolverProvider";
export type { IntentResolverProviderProps } from "./providers/IntentResolverProvider";
