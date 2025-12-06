/**
 * Mock Desktop API for Browser Testing
 * 
 * Provides a mock implementation of the DesktopApi when running in a browser
 * without Electron. Useful for testing FDC3 intents in development.
 */

import type { DesktopApi } from "./desktopApi";

/**
 * Create a mock DesktopApi for browser testing
 */
export function createMockDesktopApi(): DesktopApi {
  const subscribers = new Map<string, Set<(payload: any) => void>>();

  const mockApi: DesktopApi = {
    openApp: async (appId: string) => {
      console.log(`[MockDesktopApi] Opening app: ${appId}`);
      // In a real implementation, this would open the app window
      // For now, just simulate success
      return Promise.resolve(Math.floor(Math.random() * 10000));
    },

    publish: (topic: string, payload: unknown) => {
      console.log(`[MockDesktopApi] Publishing to ${topic}:`, payload);
      const subs = subscribers.get(topic);
      if (subs) {
        subs.forEach((handler) => {
          try {
            handler(payload);
          } catch (error) {
            console.error(`[MockDesktopApi] Error in subscriber for ${topic}:`, error);
          }
        });
      }
    },

    subscribe: (topic: string, handler: (payload: any) => void) => {
      console.log(`[MockDesktopApi] Subscribing to ${topic}`);
      
      if (!subscribers.has(topic)) {
        subscribers.set(topic, new Set());
      }
      
      subscribers.get(topic)!.add(handler);

      // Return unsubscribe function
      return () => {
        console.log(`[MockDesktopApi] Unsubscribing from ${topic}`);
        const subs = subscribers.get(topic);
        if (subs) {
          subs.delete(handler);
          if (subs.size === 0) {
            subscribers.delete(topic);
          }
        }
      };
    },

    tray: {
      minimizeToTray: () => {
        console.log("[MockDesktopApi] Minimize to tray (not implemented in browser)");
      },
      restoreFromTray: () => {
        console.log("[MockDesktopApi] Restore from tray (not implemented in browser)");
      },
    },

    // raiseIntent will be added by createFdc3DesktopApi
    raiseIntent: async () => {
      throw new Error("raiseIntent not initialized. Call createFdc3DesktopApi first.");
    },
  };

  return mockApi;
}

/**
 * Initialize mock DesktopApi if not already present
 * Call this before initializing FDC3 intents
 */
export function ensureDesktopApi(): DesktopApi {
  if (!window.desktopApi) {
    console.warn("⚠️  Running in browser mode - using mock DesktopApi");
    window.desktopApi = createMockDesktopApi();
  }
  return window.desktopApi;
}
