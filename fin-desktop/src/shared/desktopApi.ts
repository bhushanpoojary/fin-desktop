// TypeScript definitions for the Electron preload desktopApi

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
}

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}
