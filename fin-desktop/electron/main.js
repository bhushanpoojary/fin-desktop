const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { createWorkspaceWindow } = require('./workspaceWindow');
const { createAppWindow } = require('./appWindow');
const { setupBusHandlers } = require('./bus');

function createMain() {
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
