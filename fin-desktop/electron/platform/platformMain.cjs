// Interactive Platform demo: a React "controller" window drives real Electron
// WebContentsView "stage" windows via an IPC bridge, using the tested Platform runtime.
//
// Run with `npm run dev:platform`. Separate from the main app (electron/main.cjs).
//   - Stage window (BaseWindow + WebContentsView): real web views arranged by the Platform.
//   - Controller window (React, ?test=platform-control): palette + drag-dock surface.
// Drag a tile onto a pane in the controller → the real views split/tab live in the stage.

const { app, BaseWindow, BrowserWindow, WebContentsView, ipcMain } = require('electron');
const path = require('node:path');
const { Platform, findStack, dropRegionToSplitDirection } = require('./platform.bundle.cjs');
const { createWebContentsViewHost } = require('./webContentsViewHost.cjs');

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// Palette of demo apps → real URLs loaded as WebContentsViews.
const APPS = {
  Chart: { url: 'https://www.tradingview.com/chart/', color: '#ff8c00' },
  News: { url: 'https://news.ycombinator.com', color: '#4a9eff' },
  Blotter: { url: 'https://example.com', color: '#00a86b' },
  Orders: { url: 'https://httpbin.org/forms/post', color: '#dc143c' },
  Watchlist: { url: 'https://www.wikipedia.org', color: '#a855f7' },
};

let platform = null;
let host = null;
let pwin = null;
let stageWin = null;
let controlWin = null;
let meta = {}; // viewId -> { label, color }

function currentState() {
  return {
    layout: pwin ? pwin.getLayout() : null,
    meta,
    apps: Object.entries(APPS).map(([label, a]) => ({ label, color: a.color })),
  };
}

function broadcast() {
  if (controlWin && !controlWin.isDestroyed()) {
    controlWin.webContents.send('platform:state', currentState());
  }
}

function handleCommand(cmd) {
  if (!pwin) return 'no-window';

  switch (cmd.type) {
    case 'drop': {
      const appDef = APPS[cmd.label];
      if (!appDef) break;
      const layout = pwin.getLayout();
      let viewId;
      if (!layout) {
        viewId = pwin.addView(appDef.url);
      } else if (cmd.region === 'center') {
        viewId = pwin.addView(appDef.url, cmd.targetStackId || undefined);
      } else {
        const direction = dropRegionToSplitDirection(cmd.region);
        const stack = findStack(layout, cmd.targetStackId);
        const targetView = stack && stack.activeViewId;
        viewId =
          direction && targetView
            ? pwin.splitView(targetView, direction, appDef.url)
            : pwin.addView(appDef.url, cmd.targetStackId || undefined);
      }
      if (viewId) meta[viewId] = { label: cmd.label, color: appDef.color };
      break;
    }
    case 'activate':
      pwin.activateView(cmd.viewId);
      break;
    case 'close':
      pwin.closeView(cmd.viewId);
      delete meta[cmd.viewId];
      break;
    case 'reset':
      for (const v of pwin.listViews()) pwin.closeView(v.id);
      meta = {};
      break;
    case 'snapshot-save':
      return JSON.stringify({ window: pwin.getSnapshot(), meta }, null, 2);
    case 'snapshot-restore':
      try {
        const parsed = JSON.parse(cmd.json);
        pwin.applyLayout(parsed.window.layout, parsed.window.views);
        meta = parsed.meta || {};
      } catch (err) {
        return `error: ${err.message}`;
      }
      break;
    default:
      break;
  }

  broadcast();
  return 'ok';
}

async function start() {
  host = createWebContentsViewHost({
    BaseWindow,
    WebContentsView,
    windowOptions: { title: 'FinDesktop Stage' },
  });
  platform = new Platform(host);
  pwin = platform.createWindow({ x: 960, y: 80, width: 920, height: 840 });
  stageWin = host.getWindow(pwin.id);

  const syncBounds = () => {
    const b = stageWin.getContentBounds();
    pwin.setBounds({ x: 0, y: 0, width: b.width, height: b.height });
  };
  stageWin.on('resize', syncBounds);
  stageWin.on('resized', syncBounds);
  syncBounds();

  controlWin = new BrowserWindow({
    x: 40,
    y: 80,
    width: 880,
    height: 840,
    backgroundColor: '#0a0a0b',
    title: 'FinDesktop Controller',
    darkTheme: true,
    webPreferences: { preload: path.join(__dirname, 'platformPreload.cjs') },
  });
  await controlWin.loadURL(`${VITE_DEV_SERVER_URL}/?test=platform-control`);
  controlWin.webContents.on('did-finish-load', broadcast);
  broadcast();
}

ipcMain.handle('platform:command', (_event, cmd) => handleCommand(cmd));
ipcMain.handle('platform:getState', () => currentState());

app.whenReady().then(start);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BaseWindow.getAllWindows().length === 0) start();
});
