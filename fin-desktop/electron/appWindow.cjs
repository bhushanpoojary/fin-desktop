const { BrowserWindow } = require('electron');
const path = require('node:path');

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

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
  
  // Open DevTools for debugging
  win.webContents.openDevTools();
  
  return win.id;
}

module.exports = {
  createAppWindow
};
