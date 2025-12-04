const { BrowserWindow } = require('electron');
const path = require('node:path');

async function createWorkspaceWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  await win.loadURL('http://localhost:5173/?entry=workspace');
  
  return win;
}

async function createAppWindow(appId) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  await win.loadURL(`http://localhost:5173/?entry=app&appId=${encodeURIComponent(appId)}`);
  
  return win.id;
}

module.exports = {
  createWorkspaceWindow,
  createAppWindow
};
