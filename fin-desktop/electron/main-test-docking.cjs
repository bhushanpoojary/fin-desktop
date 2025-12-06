/**
 * Simple Test Main Process with Window Docking
 * 
 * This is a standalone test file to quickly verify window docking functionality
 * without modifying your existing main.cjs.
 * 
 * Usage:
 *   npx electron electron/main-test-docking.cjs
 * 
 * Or update package.json temporarily:
 *   "main": "electron/main-test-docking.cjs"
 */

const { app, BrowserWindow, ipcMain, nativeTheme, screen } = require('electron');
const path = require('node:path');

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

/**
 * Simple Window Docking Manager for Testing
 */
class TestWindowManager {
  constructor() {
    this.edgeThreshold = 10; // pixels from edge to trigger docking
    this.windows = new Map();
    this.isDocking = new Set(); // Track windows currently docking (prevent recursion)
  }

  /**
   * Create a window with docking support
   */
  createWindow(appId, url, options = {}) {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      backgroundColor: '#0a0a0a',
      titleBarStyle: 'default',
      darkTheme: true,
      ...options,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        ...options.webPreferences
      }
    });

    // Store window metadata
    this.windows.set(win.id, { appId, win, url });

    // Load URL
    win.loadURL(url).catch(err => {
      console.error(`[TestWM] Failed to load ${url}:`, err);
    });

    // Show when ready
    win.once('ready-to-show', () => {
      win.show();
      console.log(`[TestWM] Window ready: ${appId}`);
    });

    // Open DevTools for debugging
    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools();
    }

    // Set up docking listener
    win.on('move', () => this.handleWindowMove(win));

    // Clean up on close
    win.on('closed', () => {
      this.windows.delete(win.id);
      this.isDocking.delete(win.id);
      console.log(`[TestWM] Window closed: ${appId}`);
    });

    console.log(`[TestWM] Created window: ${appId} (ID: ${win.id})`);
    return win;
  }

  /**
   * Handle window move event - check for docking
   */
  handleWindowMove(win) {
    // Skip if already docking (prevents recursion)
    if (this.isDocking.has(win.id)) {
      return;
    }

    // Skip if maximized
    if (win.isMaximized()) {
      return;
    }

    const dockPosition = this.detectDockPosition(win);
    
    if (dockPosition) {
      this.dockWindow(win, dockPosition);
    }
  }

  /**
   * Detect if window should dock
   */
  detectDockPosition(win) {
    const bounds = win.getBounds();
    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;
    const threshold = this.edgeThreshold;

    // Calculate distances from all edges
    const distanceFromTop = Math.abs(bounds.y - workArea.y);
    const distanceFromLeft = Math.abs(bounds.x - workArea.x);
    const windowRightEdge = bounds.x + bounds.width;
    const workAreaRightEdge = workArea.x + workArea.width;
    const distanceFromRight = Math.abs(windowRightEdge - workAreaRightEdge);

    // Only trigger fullscreen if ONLY top edge is close (not corners)
    // This prevents false positives when dragging to left/right edges
    const isNearTopOnly = distanceFromTop <= threshold && 
                          distanceFromLeft > threshold * 3 && 
                          distanceFromRight > threshold * 3;
    
    if (isNearTopOnly) {
      return 'FULLSCREEN';
    }

    // Check left edge (prioritize left/right over top when at corners)
    if (distanceFromLeft <= threshold) {
      return 'LEFT';
    }

    // Check right edge
    if (distanceFromRight <= threshold) {
      return 'RIGHT';
    }

    return null;
  }

  /**
   * Dock window to position
   */
  dockWindow(win, position) {
    // Mark as docking
    this.isDocking.add(win.id);

    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;

    let targetBounds;

    switch (position) {
      case 'LEFT':
        targetBounds = {
          x: workArea.x,
          y: workArea.y,
          width: Math.floor(workArea.width / 2),
          height: workArea.height
        };
        console.log('🔷 [Docking] LEFT HALF - Window snapped to left side');
        break;

      case 'RIGHT':
        targetBounds = {
          x: workArea.x + Math.floor(workArea.width / 2),
          y: workArea.y,
          width: Math.floor(workArea.width / 2),
          height: workArea.height
        };
        console.log('🔶 [Docking] RIGHT HALF - Window snapped to right side');
        break;

      case 'FULLSCREEN':
        targetBounds = {
          x: workArea.x,
          y: workArea.y,
          width: workArea.width,
          height: workArea.height
        };
        console.log('🔳 [Docking] FULLSCREEN - Window snapped to fullscreen');
        break;

      default:
        this.isDocking.delete(win.id);
        return;
    }

    // Apply bounds with animation
    win.setBounds(targetBounds, true);

    // Clear docking flag after delay
    setTimeout(() => {
      this.isDocking.delete(win.id);
    }, 100);
  }

  /**
   * Get all windows
   */
  getAllWindows() {
    return Array.from(this.windows.values()).map(meta => meta.win);
  }

  /**
   * Get window by app ID
   */
  getWindowByAppId(appId) {
    for (const meta of this.windows.values()) {
      if (meta.appId === appId) {
        return meta.win;
      }
    }
    return null;
  }

  /**
   * Close all windows
   */
  closeAll() {
    for (const meta of this.windows.values()) {
      if (!meta.win.isDestroyed()) {
        meta.win.close();
      }
    }
  }

  /**
   * Change edge threshold at runtime
   */
  setEdgeThreshold(pixels) {
    this.edgeThreshold = pixels;
    console.log(`[TestWM] Edge threshold set to ${pixels}px`);
  }
}

// Global instances
const windowManager = new TestWindowManager();
let mainWindow = null;

/**
 * Create main workspace window
 */
async function createMain() {
  nativeTheme.themeSource = 'dark';

  // Print test instructions
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FinDesktop Window Docking Test');
  console.log('='.repeat(60));
  console.log('\n📋 Test Instructions:');
  console.log('   1. Drag window close to LEFT edge → Snaps to left half');
  console.log('   2. Drag window close to RIGHT edge → Snaps to right half');
  console.log('   3. Drag window close to TOP edge → Snaps to fullscreen');
  console.log(`\n⚙️  Settings: Edge threshold = ${windowManager.edgeThreshold}px`);
  console.log('   (Window must be within 10 pixels of edge to snap)');
  console.log('\n💡 Tips:');
  console.log('   - Open app windows from the launcher');
  console.log('   - Each window docks independently');
  console.log('   - Watch console for docking events');
  console.log('   - Use DevTools to inspect window behavior');
  console.log('\n' + '='.repeat(60) + '\n');

  // Create main workspace window
  mainWindow = windowManager.createWindow(
    'MainWorkspace',
    VITE_DEV_SERVER_URL,
    {
      width: 1200,
      height: 800,
      title: 'FinDesktop Workspace (Test Docking)',
      minWidth: 600,
      minHeight: 400
    }
  );
}

/**
 * Set up IPC handlers
 */
function setupIPC() {
  // Handle app window creation
  ipcMain.handle('desktop-open-app', async (_event, appId) => {
    console.log(`[Test] Opening app: ${appId}`);
    
    // Check if already open
    const existing = windowManager.getWindowByAppId(appId);
    if (existing && !existing.isDestroyed()) {
      existing.focus();
      console.log(`[Test] App already open, focusing: ${appId}`);
      return existing.id;
    }

    // Create new window
    const url = `${VITE_DEV_SERVER_URL}/?entry=app&appId=${encodeURIComponent(appId)}`;
    const appWin = windowManager.createWindow(appId, url, {
      width: 800,
      height: 600,
      title: `App: ${appId}`,
      minWidth: 400,
      minHeight: 300
    });

    return appWin.id;
  });

  // Handle edge threshold changes (for testing)
  ipcMain.handle('test-set-threshold', async (_event, pixels) => {
    windowManager.setEdgeThreshold(pixels);
    return { success: true, threshold: pixels };
  });

  // Get current settings
  ipcMain.handle('test-get-settings', async () => {
    return {
      edgeThreshold: windowManager.edgeThreshold,
      windowCount: windowManager.windows.size
    };
  });
}

/**
 * App lifecycle
 */
app.whenReady().then(() => {
  setupIPC();
  createMain();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMain();
  } else if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  console.log('\n[Test] Shutting down...');
  windowManager.closeAll();
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('[Test] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Test] Unhandled rejection:', reason);
});

console.log('[Test] Starting FinDesktop with Window Docking Test...');
