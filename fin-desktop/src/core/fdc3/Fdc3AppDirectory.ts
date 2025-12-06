/**
 * FDC3 App Directory Service
 * 
 * Manages application definitions and provides lookups for intent resolution.
 * Acts as a simple in-memory app directory that can be queried by intent name.
 */

import type { IntentName } from "./Fdc3Intents";

/**
 * Definition of an application in the app directory
 */
export interface AppDefinition {
  id: string;                         // Unique application identifier
  title: string;                      // Display name
  componentId: string;                // React component or route identifier
  intents?: IntentName[];             // List of intents this app can handle
  isDefaultForIntent?: IntentName[];  // Intents for which this app is the default handler
}

/**
 * App Directory service for managing and querying application definitions
 */
export class Fdc3AppDirectory {
  private apps: AppDefinition[];

  /**
   * Create a new App Directory instance
   * @param apps Array of application definitions
   */
  constructor(apps: AppDefinition[]) {
    this.apps = apps;
  }

  /**
   * Get all registered applications
   */
  getAllApps(): AppDefinition[] {
    return [...this.apps];
  }

  /**
   * Get a specific application by ID
   * @param appId Application identifier
   */
  getAppById(appId: string): AppDefinition | undefined {
    return this.apps.find(app => app.id === appId);
  }

  /**
   * Get all applications that can handle a specific intent
   * @param intent Intent name to search for
   */
  getAppsForIntent(intent: IntentName): AppDefinition[] {
    return this.apps.filter(app => 
      app.intents && app.intents.includes(intent)
    );
  }

  /**
   * Get the default application for a specific intent
   * @param intent Intent name
   * @returns Default app if one is configured, undefined otherwise
   */
  getDefaultAppForIntent(intent: IntentName): AppDefinition | undefined {
    return this.apps.find(app => 
      app.isDefaultForIntent && app.isDefaultForIntent.includes(intent)
    );
  }
}
