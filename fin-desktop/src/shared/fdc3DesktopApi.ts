/**
 * Desktop API with FDC3 Intent Support
 * 
 * This module extends the base DesktopApi with FDC3 intent resolution capabilities.
 * It should be initialized during application startup.
 */

import { Fdc3AppDirectory } from "../core/fdc3/Fdc3AppDirectory";
import { Fdc3IntentResolver } from "../core/fdc3/Fdc3IntentResolver";
import type { IntentName, IntentContext, IntentResolution } from "../core/fdc3/Fdc3Intents";
import type { AppDefinition } from "../core/fdc3/Fdc3AppDirectory";
import type { DesktopApi } from "./desktopApi";

/**
 * Global intent resolver instance
 */
let intentResolverInstance: Fdc3IntentResolver | null = null;

/**
 * Callback for UI-based intent resolution
 * This should be set by the React app to show the resolver dialog
 */
let multipleResolveCallback: ((intent: IntentName, apps: AppDefinition[]) => Promise<string>) | undefined;

/**
 * Initialize the FDC3 intent system
 * 
 * @param appDirectory Array of app definitions
 * @param desktopApi The desktop API instance
 */
export function initializeFdc3Intents(
  appDirectory: AppDefinition[],
  desktopApi: DesktopApi
): void {
  const directory = new Fdc3AppDirectory(appDirectory);
  
  intentResolverInstance = new Fdc3IntentResolver({
    appDirectory: directory,
    desktopApi: desktopApi,
    onMultipleResolve: (intent, apps) => {
      if (multipleResolveCallback) {
        return multipleResolveCallback(intent, apps);
      }
      // Fallback: use first app if no callback is set
      return Promise.resolve(apps[0].id);
    },
  });
}

/**
 * Set the callback for handling multiple app resolution
 * This should be called by the React app with a function that shows the resolver dialog
 * 
 * @param callback Function to show resolver dialog and return selected app ID
 */
export function setMultipleResolveCallback(
  callback: (intent: IntentName, apps: AppDefinition[]) => Promise<string>
): void {
  multipleResolveCallback = callback;
}

/**
 * Add FDC3 intent support to existing DesktopApi
 * 
 * @param baseApi The base desktop API from the preload script
 * @returns The same API object with raiseIntent method added
 */
export function createFdc3DesktopApi(baseApi: DesktopApi): DesktopApi {
  console.log("🔧 Setting up raiseIntent implementation...");
  
  // Use the setter method provided by the preload script
  baseApi.setFdc3RaiseIntent(async (intent: IntentName, context: IntentContext): Promise<IntentResolution> => {
    if (!intentResolverInstance) {
      console.error("❌ Intent resolver not initialized when raiseIntent was called");
      throw new Error("FDC3 intent system not initialized. Call initializeFdc3Intents first.");
    }
    console.log(`📤 Raising intent: ${intent}`, context);
    return intentResolverInstance.raiseIntent(intent, context);
  });
  
  console.log("✅ raiseIntent implementation set via setFdc3RaiseIntent");
  console.log("✅ typeof baseApi.raiseIntent:", typeof baseApi.raiseIntent);
  return baseApi;
}

/**
 * Get the intent resolver instance (for testing or advanced usage)
 */
export function getIntentResolver(): Fdc3IntentResolver | null {
  return intentResolverInstance;
}
