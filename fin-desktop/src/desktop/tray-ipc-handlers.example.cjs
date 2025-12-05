/**
 * Main Process IPC Handlers for TrayManager
 * 
 * This module sets up IPC handlers in the Electron main process to bridge
 * the TrayManager functionality to the renderer process.
 * 
 * Usage in electron/main.cjs:
 * ```js
 * const { setupTrayIpcHandlers } = require('./tray-ipc-handlers.cjs');
 * setupTrayIpcHandlers(trayManager, eventBus, mainWindow);
 * ```
 */

const { ipcMain } = require('electron');

/**
 * Setup IPC handlers for tray manager functionality
 * 
 * @param {import('../src/desktop/TrayManager').TrayManager} trayManager - TrayManager instance
 * @param {import('../src/desktop/DesktopEventBus').DesktopEventBus} eventBus - DesktopEventBus instance
 * @param {import('electron').BrowserWindow} mainWindow - Main window instance
 */
function setupTrayIpcHandlers(trayManager, eventBus, mainWindow) {
  console.log('[TrayIPC] Setting up tray IPC handlers');

  // Handle minimize to tray request from renderer
  ipcMain.on('tray-minimize', () => {
    console.log('[TrayIPC] Minimize to tray requested');
    trayManager.minimizeToTray();
  });

  // Handle restore from tray request from renderer
  ipcMain.on('tray-restore', () => {
    console.log('[TrayIPC] Restore from tray requested');
    trayManager.restoreFromTray();
  });

  // Handle is-minimized query from renderer
  ipcMain.handle('tray-is-minimized', () => {
    const isMinimized = trayManager.isMinimized();
    console.log('[TrayIPC] Is minimized query:', isMinimized);
    return isMinimized;
  });

  // Subscribe to desktop events and forward to renderer
  eventBus.subscribe((event) => {
    console.log('[TrayIPC] Forwarding desktop event to renderer:', event.type);
    
    // Send event to renderer process
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('desktop-event', event);
    }
  });

  console.log('[TrayIPC] Tray IPC handlers registered');
}

/**
 * Remove tray IPC handlers (cleanup)
 */
function removeTrayIpcHandlers() {
  console.log('[TrayIPC] Removing tray IPC handlers');
  ipcMain.removeHandler('tray-is-minimized');
  ipcMain.removeAllListeners('tray-minimize');
  ipcMain.removeAllListeners('tray-restore');
}

module.exports = {
  setupTrayIpcHandlers,
  removeTrayIpcHandlers,
};
