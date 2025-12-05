/**
 * Example Preload Script for Desktop API Integration
 * 
 * This example shows how to expose the desktop API to the renderer process
 * using Electron's contextBridge API.
 * 
 * To use this, you would modify your existing electron/preload.cjs file
 * to include these desktop API exposures.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose Desktop Events API to renderer
 */
contextBridge.exposeInMainWorld('desktopEvents', {
  /**
   * Subscribe to desktop events from the main process
   * @param {Function} handler - Event handler function
   * @returns {Function} Unsubscribe function
   */
  subscribe: (handler) => {
    // Create a wrapper to handle IPC messages
    const ipcHandler = (event, desktopEvent) => {
      handler(desktopEvent);
    };

    // Listen for desktop events from main process
    ipcRenderer.on('desktop-event', ipcHandler);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('desktop-event', ipcHandler);
    };
  },
});

/**
 * Expose Tray API to renderer
 */
contextBridge.exposeInMainWorld('tray', {
  /**
   * Minimize window to tray
   */
  minimizeToTray: () => {
    ipcRenderer.send('tray-minimize');
  },

  /**
   * Restore window from tray
   */
  restoreFromTray: () => {
    ipcRenderer.send('tray-restore');
  },

  /**
   * Check if window is minimized to tray
   * @returns {Promise<boolean>} True if minimized to tray
   */
  isMinimized: () => {
    return ipcRenderer.invoke('tray-is-minimized');
  },
});

/**
 * Alternative: Expose a unified desktop API
 */
contextBridge.exposeInMainWorld('desktop', {
  events: {
    subscribe: (handler) => {
      const ipcHandler = (event, desktopEvent) => {
        handler(desktopEvent);
      };
      ipcRenderer.on('desktop-event', ipcHandler);
      return () => {
        ipcRenderer.removeListener('desktop-event', ipcHandler);
      };
    },
  },
  tray: {
    minimizeToTray: () => ipcRenderer.send('tray-minimize'),
    restoreFromTray: () => ipcRenderer.send('tray-restore'),
    isMinimized: () => ipcRenderer.invoke('tray-is-minimized'),
  },
});

console.log('[Preload] Desktop API exposed to renderer');
