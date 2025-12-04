const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');
const { createWorkspaceWindow } = require('./workspaceWindow.cjs');
const { createAppWindow } = require('./appWindow.cjs');
const { setupBusHandlers } = require('./bus.cjs');

function createMain() {
  // Force dark mode
  nativeTheme.themeSource = 'dark';
  
  // Create the workspace window
  createWorkspaceWindow();

  // Initialize the global message bus
  setupBusHandlers();

  // Register handler for opening app windows
  ipcMain.handle('desktop-open-app', async (_event, appId) => {
    const appWindow = createAppWindow(appId);
    return appWindow.id;
  });
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
  }
});
