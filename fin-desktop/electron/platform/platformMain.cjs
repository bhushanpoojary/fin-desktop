// Standalone demo: drives real Electron WebContentsView windows using the Platform runtime.
//
// Run with `npm run dev:platform`. This is separate from the main app (electron/main.cjs)
// so it never interferes with the existing workspace flow. It proves the tested Platform
// core positions real OS-level web views: two sites split side-by-side, a third tabbed in.

const { app, BaseWindow, WebContentsView } = require('electron');
const { Platform } = require('./platform.bundle.cjs');
const { createWebContentsViewHost } = require('./webContentsViewHost.cjs');

let platform = null;

function start() {
  const host = createWebContentsViewHost({ BaseWindow, WebContentsView });
  platform = new Platform(host);

  const pwin = platform.createWindow({ x: 160, y: 100, width: 1280, height: 820 });
  const win = host.getWindow(pwin.id);

  const syncBounds = () => {
    const b = win.getContentBounds();
    pwin.setBounds({ x: 0, y: 0, width: b.width, height: b.height });
  };
  win.on('resize', syncBounds);
  win.on('resized', syncBounds);

  // Demo layout: split two sites, then tab a third into the right pane.
  const left = pwin.addView('https://example.com');
  pwin.splitView(left, 'right', 'https://www.wikipedia.org');
  pwin.addView('https://news.ycombinator.com');

  syncBounds();

  platform.on('view-created', ({ viewId }) => console.log('[platform] view created:', viewId));
  platform.on('layout-changed', () => console.log('[platform] layout changed'));

  win.on('closed', () => {
    platform = null;
  });
}

app.whenReady().then(start);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BaseWindow.getAllWindows().length === 0) start();
});
