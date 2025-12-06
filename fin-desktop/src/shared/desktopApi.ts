// TypeScript definitions for the Electron preload desktopApi

import type { IntentName, IntentContext, IntentResolution } from "../core/fdc3/Fdc3Intents";

export interface DesktopApi {
  /**
   * Opens an application window by its ID
   * @param appId - The unique identifier of the app to open
   * @returns A promise that resolves to the window ID
   */
  openApp(appId: string): Promise<number>;

  /**
   * Publishes a message to a topic on the event bus
   * @param topic - The topic to publish to
   * @param payload - The data to send
   */
  publish(topic: string, payload: unknown): void;

  /**
   * Subscribes to messages on a topic
   * @param topic - The topic to subscribe to
   * @param handler - Callback function to handle received messages
   * @returns A function to unsubscribe from the topic
   */
  subscribe(topic: string, handler: (payload: any) => void): () => void;

  /**
   * System tray API (TEST)
   */
  tray?: {
    /**
     * Minimize the window to the system tray
     */
    minimizeToTray(): void;

    /**
     * Restore the window from the system tray
     */
    restoreFromTray(): void;
  };

  /**
   * Raises an FDC3 intent with context
   * @param intent - The intent to raise (e.g., "ViewChart", "ViewNews", "Trade")
   * @param context - Context data to pass to the target application
   * @returns A promise that resolves to the intent resolution details
   */
  raiseIntent(intent: IntentName, context: IntentContext): Promise<IntentResolution>;
}

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}
