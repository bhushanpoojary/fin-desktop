const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');
const { createWorkspaceWindow } = require('./workspaceWindow.cjs');
const { createAppWindow } = require('./appWindow.cjs');
const { setupBusHandlers } = require('./bus.cjs');
const { SimpleTrayManager } = require('./simpleTrayManager.cjs');

// Global references
let mainWindow = null;
let trayManager = null;

async function createMain() {
  // Force dark mode
  nativeTheme.themeSource = 'dark';
  
  // Create the workspace window
  mainWindow = await createWorkspaceWindow();

  // Initialize the global message bus
  setupBusHandlers();

  // Register handler for opening app windows
  ipcMain.handle('desktop-open-app', async (_event, appId) => {
    const appWindow = createAppWindow(appId);
    return appWindow.id;
  });

  // Initialize tray manager
  trayManager = new SimpleTrayManager({
    productName: 'Fin Desktop',
    getMainWindow: () => mainWindow,
  });

  // Setup tray IPC handlers
  ipcMain.on('tray-minimize', () => {
    console.log('[Main] Minimize to tray requested from renderer');
    trayManager.minimizeToTray();
  });

  ipcMain.on('tray-restore', () => {
    console.log('[Main] Restore from tray requested from renderer');
    trayManager.restoreFromTray();
  });

  // Setup window event handlers
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    trayManager.minimizeToTray();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      trayManager.minimizeToTray();
    }
  });

  console.log('[Main] Tray manager initialized - minimize window to test!');
}

// Electron app lifecycle
app.whenReady().then(createMain);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMain();
  } else if (trayManager) {
    trayManager.restoreFromTray();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (trayManager) {
    trayManager.dispose();
  }
});
