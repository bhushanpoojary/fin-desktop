/**
 * Desktop API Type Definitions
 * 
 * Type definitions for the desktop APIs exposed to the renderer process
 * via the Electron preload script.
 * 
 * These types should be used in conjunction with the preload script that
 * exposes the desktop APIs using contextBridge.exposeInMainWorld().
 */

import type { DesktopEventHandler } from './DesktopEventBus';

/**
 * Desktop Events API
 * 
 * Allows the renderer process to subscribe to desktop events from the main process.
 */
export interface DesktopEventsAPI {
  /**
   * Subscribe to desktop events
   * @param handler - Function to call when a desktop event is received
   * @returns Unsubscribe function
   */
  subscribe(handler: DesktopEventHandler): () => void;
}

/**
 * Tray API
 * 
 * Allows the renderer process to interact with the system tray.
 */
export interface TrayAPI {
  /**
   * Minimize the window to the system tray
   */
  minimizeToTray(): void;

  /**
   * Restore the window from the system tray
   */
  restoreFromTray(): void;

  /**
   * Check if the window is currently minimized to tray
   */
  isMinimized(): Promise<boolean>;
}

/**
 * Desktop API
 * 
 * Main API object exposed to the renderer process.
 */
export interface DesktopAPI {
  /**
   * Desktop events API
   */
  desktopEvents: DesktopEventsAPI;

  /**
   * Tray API
   */
  tray: TrayAPI;
}

/**
 * Global window augmentation for TypeScript
 * 
 * Augment the Window interface to include the desktop API.
 * This provides type safety when accessing window.desktopEvents, etc.
 */
declare global {
  interface Window {
    /**
     * Desktop events API (exposed via preload script)
     */
    desktopEvents?: DesktopEventsAPI;

    /**
     * Tray API (exposed via preload script)
     */
    tray?: TrayAPI;

    /**
     * Full desktop API (alternative approach)
     */
    desktop?: DesktopAPI;
  }
}

export {};
