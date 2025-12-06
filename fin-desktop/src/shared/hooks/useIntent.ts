/**
 * React Hook for FDC3 Intents
 * 
 * Provides a convenient way to raise intents from React components
 * with built-in error handling and loading states.
 */

import { useState, useCallback } from "react";
import type { IntentName, IntentContext, IntentResolution } from "../../core/fdc3/Fdc3Intents";

export interface UseIntentOptions {
  onSuccess?: (resolution: IntentResolution) => void;
  onError?: (error: Error) => void;
}

export interface UseIntentResult {
  raiseIntent: (intent: IntentName, context: IntentContext) => Promise<IntentResolution | undefined>;
  isLoading: boolean;
  error: Error | null;
  lastResolution: IntentResolution | null;
}

/**
 * Hook for raising FDC3 intents with loading and error states
 * 
 * @param options Optional callbacks for success and error handling
 * @returns Object with raiseIntent function and state
 * 
 * @example
 * ```tsx
 * const { raiseIntent, isLoading, error } = useIntent({
 *   onSuccess: (resolution) => {
 *     console.log(`Opened in ${resolution.appTitle}`);
 *   },
 *   onError: (error) => {
 *     alert(`Failed: ${error.message}`);
 *   }
 * });
 * 
 * // Later...
 * await raiseIntent("ViewChart", { instrument: "AAPL" });
 * ```
 */
export function useIntent(options: UseIntentOptions = {}): UseIntentResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResolution, setLastResolution] = useState<IntentResolution | null>(null);

  const raiseIntent = useCallback(
    async (intent: IntentName, context: IntentContext): Promise<IntentResolution | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!window.desktopApi) {
          throw new Error("DesktopApi not available");
        }

        const resolution = await window.desktopApi.raiseIntent(intent, context);
        setLastResolution(resolution);

        if (options.onSuccess) {
          options.onSuccess(resolution);
        }

        return resolution;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (options.onError) {
          options.onError(error);
        }

        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    raiseIntent,
    isLoading,
    error,
    lastResolution,
  };
}

/**
 * Hook for listening to intents targeted at the current app
 * 
 * @param appId The ID of the current app
 * @param onIntent Callback when an intent is received
 * 
 * @example
 * ```tsx
 * useIntentListener("chartApp", (intent, context) => {
 *   if (intent === "ViewChart" && "instrument" in context) {
 *     setSymbol(context.instrument);
 *   }
 * });
 * ```
 */
export function useIntentListener(
  appId: string,
  onIntent: (intent: IntentName, context: IntentContext) => void
): void {
  React.useEffect(() => {
    if (!window.desktopApi) {
      console.error("DesktopApi not available for intent listener");
      return;
    }

    const unsubscribe = window.desktopApi.subscribe(
      `FDC3_INTENT_${appId}`,
      (data: { intent: IntentName; context: IntentContext }) => {
        onIntent(data.intent, data.context);
      }
    );

    return unsubscribe;
  }, [appId, onIntent]);
}

// Need React import for useEffect in useIntentListener
import React from "react";
