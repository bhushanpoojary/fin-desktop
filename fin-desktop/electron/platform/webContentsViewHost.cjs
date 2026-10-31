// WebContentsView implementation of the Platform `PlatformHost` contract.
//
// The Platform runtime (bundled from src/platform) decides *what* views exist and *where*
// they go; this adapter realizes them as real Electron WebContentsView instances inside a
// BaseWindow. It is deliberately dumb — all layout math lives in the tested TS core.

function createWebContentsViewHost({ BaseWindow, WebContentsView, windowOptions = {} }) {
  const windows = new Map();
  const views = new Map();

  const round = (b) => ({
    x: Math.round(b.x),
    y: Math.round(b.y),
    width: Math.round(b.width),
    height: Math.round(b.height),
  });

  return {
    getWindow(id) {
      return windows.get(id);
    },

    createWindowHost(id, bounds) {
      const win = new BaseWindow({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        backgroundColor: '#0a0a0b',
        title: 'FinDesktop Platform',
        ...windowOptions,
      });
      windows.set(id, win);
    },

    destroyWindowHost(id) {
      const win = windows.get(id);
      if (win) {
        win.destroy();
        windows.delete(id);
      }
    },

    setWindowHostBounds(id, bounds) {
      const win = windows.get(id);
      if (win) win.setBounds(round(bounds));
    },

    createView(windowId, viewId, url) {
      const win = windows.get(windowId);
      if (!win) return;
      const view = new WebContentsView();
      view.setVisible(false);
      win.contentView.addChildView(view);
      view.webContents.loadURL(url).catch(() => {});
      views.set(viewId, view);
    },

    destroyView(viewId) {
      const view = views.get(viewId);
      if (!view) return;
      for (const win of windows.values()) {
        try {
          win.contentView.removeChildView(view);
        } catch {
          /* already detached */
        }
      }
      try {
        view.webContents.close();
      } catch {
        /* already closed */
      }
      views.delete(viewId);
    },

    setViewBounds(viewId, bounds) {
      const view = views.get(viewId);
      if (view) view.setBounds(round(bounds));
    },

    setViewVisible(viewId, visible) {
      const view = views.get(viewId);
      if (view) view.setVisible(visible);
    },
  };
}

module.exports = { createWebContentsViewHost };
