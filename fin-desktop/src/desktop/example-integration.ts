/**
 * TrayManager Integration Example
 * 
 * This example shows how to integrate TrayManager into the Electron main process.
 * 
 * To use this in your electron/main.cjs file, you would need to:
 * 1. Convert this to CommonJS or use a build step
 * 2. Import the necessary modules
 * 3. Initialize the TrayManager after the app is ready
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { TrayManager } from './TrayManager';
import { DesktopEventBus } from './DesktopEventBus';
import { DefaultBranding } from '../core/defaults/DefaultBranding';

// Global references
let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let eventBus: DesktopEventBus | null = null;

/**
 * Create the main application window
 */
function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return window;
}

/**
 * Initialize the TrayManager with branding
 */
function initializeTrayManager(): void {
  // Create event bus
  eventBus = new DesktopEventBus();

  // Use default branding (or custom branding implementation)
  const branding = new DefaultBranding();

  // Create TrayManager
  trayManager = new TrayManager({
    branding,
    eventBus,
    getMainWindow: () => mainWindow,
  });

  console.log('[Main] TrayManager initialized');
}

/**
 * Setup window event handlers for tray integration
 */
function setupWindowEventHandlers(): void {
  if (!mainWindow) return;

  // Minimize to tray when window is minimized
  mainWindow.on('minimize', () => {
    trayManager?.minimizeToTray();
  });

  // Minimize to tray when window is closed (instead of quitting)
  mainWindow.on('close', (event) => {
    // Check if we're actually quitting the app
    if (!(app as any).isQuitting) {
      event.preventDefault();
      trayManager?.minimizeToTray();
    }
  });

  // Handle window show/hide events
  mainWindow.on('show', () => {
    console.log('[Main] Window shown');
  });

  mainWindow.on('hide', () => {
    console.log('[Main] Window hidden');
  });
}

/**
 * Setup desktop event bus handlers
 */
function setupEventBusHandlers(): void {
  if (!eventBus) return;

  // Subscribe to desktop events
  eventBus.subscribe((event: { type: string }) => {
    console.log('[Main] Desktop event received:', event.type);

    switch (event.type) {
      case 'RESTORE_MAIN_WINDOW':
        console.log('[Main] Restoring main window...');
        break;

      case 'OPEN_SETTINGS':
        console.log('[Main] Opening settings...');
        // You could open a settings window here
        // or send an IPC message to the renderer to show settings UI
        if (mainWindow) {
          mainWindow.webContents.send('show-settings');
        }
        break;

      case 'EXIT_REQUESTED':
        console.log('[Main] Exit requested, cleaning up...');
        // Perform any cleanup here
        break;
    }
  });
}

/**
 * Main initialization function
 */
function initializeApp(): void {
  // Create the main window
  mainWindow = createMainWindow();

  // Initialize tray manager
  initializeTrayManager();

  // Setup window event handlers
  setupWindowEventHandlers();

  // Setup event bus handlers
  setupEventBusHandlers();
}

// App lifecycle
app.whenReady().then(() => {
  initializeApp();
});

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  } else if (mainWindow) {
    trayManager?.restoreFromTray();
  }
});

app.on('before-quit', () => {
  // Mark that we're quitting so the close handler doesn't prevent exit
  (app as any).isQuitting = true;

  // Clean up tray manager
  if (trayManager) {
    trayManager.dispose();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught exception:', error);
});

// Export for testing
export { mainWindow, trayManager, eventBus };
