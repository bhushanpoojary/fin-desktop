/**
 * Intent Resolver Provider
 * 
 * React context provider that handles the UI for multi-app intent resolution.
 * This component should wrap your application root.
 */

import React, { useState, useEffect } from "react";
import { IntentResolverDialog } from "../../ui/intent/IntentResolverDialog";
import { setMultipleResolveCallback } from "../fdc3DesktopApi";
import type { IntentName } from "../../core/fdc3/Fdc3Intents";
import type { AppDefinition } from "../../core/fdc3/Fdc3AppDirectory";

interface DialogState {
  intent: IntentName;
  apps: AppDefinition[];
  resolve: (appId: string) => void;
  reject: (error: Error) => void;
}

export interface IntentResolverProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for FDC3 intent resolution dialogs
 * 
 * Wrap your application with this provider to enable multi-app intent resolution UI.
 * 
 * @example
 * ```tsx
 * <IntentResolverProvider>
 *   <App />
 * </IntentResolverProvider>
 * ```
 */
export const IntentResolverProvider: React.FC<IntentResolverProviderProps> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);

  useEffect(() => {
    // Register the callback with the intent system
    setMultipleResolveCallback((intent, apps) => {
      return new Promise<string>((resolve, reject) => {
        setDialogState({ intent, apps, resolve, reject });
      });
    });
  }, []);

  const handleSelect = (appId: string) => {
    if (dialogState) {
      dialogState.resolve(appId);
      setDialogState(null);
    }
  };

  const handleCancel = () => {
    if (dialogState) {
      dialogState.reject(new Error("User cancelled intent resolution"));
      setDialogState(null);
    }
  };

  return (
    <>
      {children}
      {dialogState && (
        <IntentResolverDialog
          intent={dialogState.intent}
          apps={dialogState.apps}
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};
