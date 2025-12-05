/**
 * useDesktopEvents Hook
 * 
 * React hook for subscribing to desktop events from the TrayManager.
 * This allows React components to respond to tray actions and other desktop-level events.
 * 
 * Usage:
 * ```tsx
 * import { useDesktopEvents } from './hooks/useDesktopEvents';
 * 
 * function App() {
 *   useDesktopEvents({
 *     onRestoreWindow: () => {
 *       console.log('Window restored from tray');
 *     },
 *     onOpenSettings: () => {
 *       setShowSettings(true);
 *     },
 *     onExitRequested: () => {
 *       // Perform cleanup
 *       console.log('App exit requested');
 *     },
 *   });
 * 
 *   return <div>My App</div>;
 * }
 * ```
 */

import { useEffect } from 'react';
import type { DesktopEvent } from '../desktop/DesktopEventBus';

/**
 * Desktop event handlers
 */
export interface DesktopEventHandlers {
  /**
   * Called when the main window is restored from the tray
   */
  onRestoreWindow?: () => void;

  /**
   * Called when the user clicks "Settings" in the tray menu
   */
  onOpenSettings?: () => void;

  /**
   * Called when the user clicks "Exit" in the tray menu
   */
  onExitRequested?: () => void;
}

/**
 * Hook for subscribing to desktop events
 * 
 * Note: In a real implementation, you would need to bridge the desktop event bus
 * from the main process to the renderer process using IPC (Inter-Process Communication).
 * 
 * For example, in your preload script:
 * ```ts
 * contextBridge.exposeInMainWorld('desktopEvents', {
 *   subscribe: (handler: (event: DesktopEvent) => void) => {
 *     ipcRenderer.on('desktop-event', (_, event) => handler(event));
 *   }
 * });
 * ```
 * 
 * Then in the main process:
 * ```ts
 * eventBus.subscribe(event => {
 *   mainWindow.webContents.send('desktop-event', event);
 * });
 * ```
 */
export function useDesktopEvents(handlers: DesktopEventHandlers): void {
  useEffect(() => {
    // Check if desktop events API is available (exposed via preload script)
    if (typeof window === 'undefined' || !(window as any).desktopEvents) {
      console.warn('[useDesktopEvents] Desktop events API not available');
      return;
    }

    const handleDesktopEvent = (event: DesktopEvent) => {
      console.log('[useDesktopEvents] Received event:', event.type);

      switch (event.type) {
        case 'RESTORE_MAIN_WINDOW':
          handlers.onRestoreWindow?.();
          break;

        case 'OPEN_SETTINGS':
          handlers.onOpenSettings?.();
          break;

        case 'EXIT_REQUESTED':
          handlers.onExitRequested?.();
          break;
      }
    };

    // Subscribe to desktop events
    const unsubscribe = (window as any).desktopEvents.subscribe(handleDesktopEvent);

    console.log('[useDesktopEvents] Subscribed to desktop events');

    // Cleanup on unmount
    return () => {
      console.log('[useDesktopEvents] Unsubscribed from desktop events');
      unsubscribe?.();
    };
  }, [handlers.onRestoreWindow, handlers.onOpenSettings, handlers.onExitRequested]);
}

/**
 * Example component using the hook
 */
export function ExampleComponent() {
  useDesktopEvents({
    onRestoreWindow: () => {
      console.log('Window restored!');
      // Maybe show a welcome message or refresh data
    },

    onOpenSettings: () => {
      console.log('Settings requested!');
      // Navigate to settings page or open settings modal
    },

    onExitRequested: () => {
      console.log('Exit requested!');
      // Save any unsaved work, close connections, etc.
    },
  });

  return (
    <div>
      <h1>My Application</h1>
      <p>Listening for desktop events...</p>
    </div>
  );
}
