/**
 * FDC3 Intent Resolver
 * 
 * Handles the resolution of intents to specific applications, including:
 * - Looking up apps from the app directory
 * - Handling single vs. multiple app resolution
 * - Opening resolved applications
 */

import type { IntentName, IntentContext, IntentResolution } from "./Fdc3Intents";
import type { Fdc3AppDirectory, AppDefinition } from "./Fdc3AppDirectory";
import type { DesktopApi } from "../../shared/desktopApi";

/**
 * Callback for handling multiple app resolution
 * Should be provided by the UI layer to show a selection dialog
 */
export type MultipleResolveCallback = (
  intent: IntentName,
  apps: AppDefinition[]
) => Promise<string>;

/**
 * Options for creating an IntentResolver
 */
export interface IntentResolverOptions {
  appDirectory: Fdc3AppDirectory;
  desktopApi: DesktopApi;
  onMultipleResolve?: MultipleResolveCallback;
}

/**
 * Intent Resolver service
 * 
 * Resolves FDC3 intents to applications and handles opening them
 */
export class Fdc3IntentResolver {
  private appDirectory: Fdc3AppDirectory;
  private desktopApi: DesktopApi;
  private onMultipleResolve?: MultipleResolveCallback;

  constructor(options: IntentResolverOptions) {
    this.appDirectory = options.appDirectory;
    this.desktopApi = options.desktopApi;
    this.onMultipleResolve = options.onMultipleResolve;
  }

  /**
   * Raise an intent with context
   * 
   * @param intent The intent to raise
   * @param context Context data to pass to the app
   * @returns Resolution indicating which app was selected
   * @throws Error if no apps can handle the intent or resolution fails
   */
  async raiseIntent(
    intent: IntentName,
    context: IntentContext
  ): Promise<IntentResolution> {
    // Find apps that can handle this intent
    const apps = this.appDirectory.getAppsForIntent(intent);

    // No apps found
    if (apps.length === 0) {
      const error = `No applications found to handle intent: ${intent}`;
      
      // Log to desktop event bus
      this.desktopApi.publish("FDC3_INTENT_ERROR", {
        intent,
        context,
        error,
        timestamp: new Date().toISOString(),
      });

      throw new Error(error);
    }

    // Exactly one app - use it directly
    if (apps.length === 1) {
      const app = apps[0];
      return await this.openAppWithIntent(app, intent, context);
    }

    // Multiple apps - need resolution
    return await this.resolveMultipleApps(intent, context, apps);
  }

  /**
   * Handle resolution when multiple apps can handle the intent
   */
  private async resolveMultipleApps(
    intent: IntentName,
    context: IntentContext,
    apps: AppDefinition[]
  ): Promise<IntentResolution> {
    let selectedAppId: string;

    // If a callback is provided, use it to let the user choose
    if (this.onMultipleResolve) {
      selectedAppId = await this.onMultipleResolve(intent, apps);
    } else {
      // No callback - try to use default app
      const defaultApp = this.appDirectory.getDefaultAppForIntent(intent);
      
      if (defaultApp) {
        selectedAppId = defaultApp.id;
      } else {
        // No default - just pick the first one
        selectedAppId = apps[0].id;
      }
    }

    // Find the selected app
    const selectedApp = apps.find(app => app.id === selectedAppId);
    
    if (!selectedApp) {
      throw new Error(`Selected app not found: ${selectedAppId}`);
    }

    return await this.openAppWithIntent(selectedApp, intent, context);
  }

  /**
   * Open an application with intent and context
   */
  private async openAppWithIntent(
    app: AppDefinition,
    intent: IntentName,
    context: IntentContext
  ): Promise<IntentResolution> {
    try {
      // Open the app using desktopApi
      // Note: You may need to extend openApp to accept additional parameters
      await this.desktopApi.openApp(app.id);

      // Publish the intent context to the app via event bus
      this.desktopApi.publish("FDC3_INTENT_RAISED", {
        intent,
        context,
        appId: app.id,
        appTitle: app.title,
        timestamp: new Date().toISOString(),
      });

      // Also publish a targeted message to the specific app
      this.desktopApi.publish(`FDC3_INTENT_${app.id}`, {
        intent,
        context,
      });

      return {
        intent,
        appId: app.id,
        appTitle: app.title,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log error to event bus
      this.desktopApi.publish("FDC3_INTENT_ERROR", {
        intent,
        context,
        appId: app.id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      throw new Error(`Failed to open app ${app.id}: ${errorMessage}`);
    }
  }
}
