const { BrowserWindow } = require('electron');
const path = require('node:path');

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

async function createWorkspaceWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'default',
    darkTheme: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Load without parameters to show AppShell with splash screen
  // To bypass splash and go directly to workspace, use: ?entry=workspace
  await win.loadURL(`${VITE_DEV_SERVER_URL}/`);
  
  // Open DevTools for debugging (only in development)
  // Uncomment the line below if you want DevTools to open automatically:
  // win.webContents.openDevTools();
  
  return win;
}

async function createAppWindow(appId) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'default',
    darkTheme: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  await win.loadURL(`${VITE_DEV_SERVER_URL}/?entry=app&appId=${encodeURIComponent(appId)}`);
  
  return win.id;
}

module.exports = {
  createWorkspaceWindow,
  createAppWindow
};
