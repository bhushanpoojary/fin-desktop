/**
 * WindowManager Integration Example
 * 
 * This file demonstrates how to integrate the WindowManager into your
 * Electron main process (main.cjs or main.ts).
 * 
 * Copy the relevant sections into your actual main process file.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { app, BrowserWindow } from 'electron';
import { windowManager } from './windowManager';
import { finDesktopConfig } from '../config/FinDesktopConfig';

// ============================================================================
// APP INITIALIZATION
// ============================================================================

/**
 * Initialize the WindowManager with FinDesktop configuration
 * Call this early in your app initialization, before creating any windows
 */
function initializeWindowManager(): void {
  // Set the configuration - this enables docking if configured
  windowManager.setConfig(finDesktopConfig);
  
  console.log('WindowManager initialized with config:', {
    dockingEnabled: finDesktopConfig.windowDocking?.dockingEnabled,
    edgeThreshold: finDesktopConfig.windowDocking?.edgeThreshold,
  });
}

// ============================================================================
// WINDOW CREATION EXAMPLES
// ============================================================================

/**
 * Example: Create a main workspace window
 */
function createMainWorkspace(): BrowserWindow {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev 
    ? 'http://localhost:5173'  // Vite dev server
    : `file://${__dirname}/../renderer/index.html`;

  return windowManager.createAppWindow(
    'MainWorkspace',
    baseUrl,
    {
      width: 1280,
      height: 800,
      title: 'FinDesktop Workspace',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: `${__dirname}/preload.cjs`, // Adjust path as needed
      },
    }
  );
}

/**
 * Example: Create an Order Ticket app window
 */
function createOrderTicketWindow(): BrowserWindow {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev 
    ? 'http://localhost:5173'
    : `file://${__dirname}/../renderer/index.html`;
  
  const url = `${baseUrl}#/order-ticket`; // Assuming hash-based routing

  return windowManager.createAppWindow(
    'OrderTicketApp',
    url,
    {
      width: 600,
      height: 800,
      title: 'Order Ticket',
      resizable: true,
    }
  );
}

/**
 * Example: Create a News app window
 */
function createNewsWindow(): BrowserWindow {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev 
    ? 'http://localhost:5173'
    : `file://${__dirname}/../renderer/index.html`;
  
  const url = `${baseUrl}#/news`;

  return windowManager.createAppWindow(
    'NewsApp',
    url,
    {
      width: 800,
      height: 600,
      title: 'News',
    }
  );
}

// ============================================================================
// IPC HANDLERS FOR WINDOW MANAGEMENT
// ============================================================================

import { ipcMain } from 'electron';

/**
 * Set up IPC handlers for renderer-to-main window management requests
 */
function setupWindowManagementIPC(): void {
  /**
   * Handle request to open a new app window
   * 
   * Usage from renderer:
   * window.electronAPI.openApp('OrderTicketApp')
   */
  ipcMain.handle('window:open-app', async (event, appId: string) => {
    try {
      let win: BrowserWindow;

      // Check if window already exists
      const existingWin = windowManager.getWindowByAppId(appId);
      if (existingWin && !existingWin.isDestroyed()) {
        existingWin.focus();
        return { success: true, windowId: existingWin.id };
      }

      // Create new window based on app type
      switch (appId) {
        case 'OrderTicketApp':
          win = createOrderTicketWindow();
          break;
        case 'NewsApp':
          win = createNewsWindow();
          break;
        default:
          throw new Error(`Unknown app: ${appId}`);
      }

      return { success: true, windowId: win.id };
    } catch (error) {
      console.error('Failed to open app:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Handle request to close a window by app ID
   */
  ipcMain.handle('window:close-app', async (event, appId: string) => {
    try {
      windowManager.closeWindow(appId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  /**
   * Handle request to get all open windows
   */
  ipcMain.handle('window:get-all', async () => {
    const windows = windowManager.getWindows();
    return windows.map(win => ({
      id: win.id,
      title: win.getTitle(),
      bounds: win.getBounds(),
    }));
  });

  /**
   * Handle request to toggle docking feature
   * Useful for user preferences
   */
  ipcMain.handle('window:toggle-docking', async (event, enabled: boolean) => {
    try {
      // Update the config
      if (finDesktopConfig.windowDocking) {
        finDesktopConfig.windowDocking.dockingEnabled = enabled;
      }
      
      // Re-initialize window manager with updated config
      windowManager.setConfig(finDesktopConfig);
      
      return { success: true, enabled };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}

// ============================================================================
// APP LIFECYCLE
// ============================================================================

/**
 * Main app ready handler
 */
app.whenReady().then(() => {
  // Initialize window manager first
  initializeWindowManager();
  
  // Set up IPC handlers
  setupWindowManagementIPC();
  
  // Create main workspace window
  createMainWorkspace();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWorkspace();
    }
  });
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Clean up before quit
 */
app.on('before-quit', () => {
  // Close all managed windows
  windowManager.closeAllWindows();
});

// ============================================================================
// PRELOAD API EXAMPLE
// ============================================================================

/**
 * Add these to your preload script (preload.cjs or preload.ts)
 * to expose window management to the renderer process
 */

/*
// In preload.cjs:

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window management APIs
  openApp: (appId) => ipcRenderer.invoke('window:open-app', appId),
  closeApp: (appId) => ipcRenderer.invoke('window:close-app', appId),
  getAllWindows: () => ipcRenderer.invoke('window:get-all'),
  toggleDocking: (enabled) => ipcRenderer.invoke('window:toggle-docking', enabled),
});
*/

// ============================================================================
// USAGE IN RENDERER PROCESS
// ============================================================================

/*
// TypeScript type definitions for renderer
interface ElectronAPI {
  openApp: (appId: string) => Promise<{ success: boolean; windowId?: number; error?: string }>;
  closeApp: (appId: string) => Promise<{ success: boolean; error?: string }>;
  getAllWindows: () => Promise<Array<{ id: number; title: string; bounds: Rectangle }>>;
  toggleDocking: (enabled: boolean) => Promise<{ success: boolean; enabled?: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Example usage in React component:
const LauncherButton = ({ appId, appName }) => {
  const handleLaunch = async () => {
    const result = await window.electronAPI.openApp(appId);
    if (result.success) {
      console.log(`Opened ${appName}`);
    } else {
      console.error(`Failed to open ${appName}:`, result.error);
    }
  };

  return <button onClick={handleLaunch}>Launch {appName}</button>;
};
*/
