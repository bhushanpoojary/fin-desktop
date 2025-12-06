# Testing WindowManager in FinDesktop Demo App

This guide shows you how to test the window docking feature in your existing demo app.

## Quick Test (3 Steps)

### Option A: Integrate into Existing Main Process (Recommended)

Since your app uses CommonJS (`.cjs` files), we need to adapt the integration slightly.

#### Step 1: Update `electron/main.cjs`

Add WindowManager integration to your existing main process:

```javascript
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');
const { createWorkspaceWindow } = require('./workspaceWindow.cjs');
const { setupBusHandlers } = require('./bus.cjs');
const { SimpleTrayManager } = require('./simpleTrayManager.cjs');

// NEW: Import WindowManager (will need to transpile or use dynamic import)
let windowManager = null;
let finDesktopConfig = null;

// Global references
let mainWindow = null;
let trayManager = null;

async function initializeWindowManager() {
  try {
    // Dynamic import for ES modules
    const wmModule = await import('../src/main/windowManager.js');
    const configModule = await import('../src/config/FinDesktopConfig.js');
    
    windowManager = wmModule.windowManager;
    finDesktopConfig = configModule.finDesktopConfig;
    
    // Initialize with config
    windowManager.setConfig(finDesktopConfig);
    
    console.log('[WindowManager] Initialized with docking enabled:', 
      finDesktopConfig.windowDocking?.dockingEnabled);
    console.log('[WindowManager] Edge threshold:', 
      finDesktopConfig.windowDocking?.edgeThreshold, 'px');
      
    return true;
  } catch (error) {
    console.warn('[WindowManager] Could not load - using fallback:', error.message);
    return false;
  }
}

// NEW: Enhanced createAppWindow with WindowManager
async function createAppWindow(appId) {
  if (windowManager) {
    // Use WindowManager if available
    const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    const url = `${VITE_DEV_SERVER_URL}/?entry=app&appId=${encodeURIComponent(appId)}`;
    
    const win = windowManager.createAppWindow(appId, url, {
      width: 800,
      height: 600,
      backgroundColor: '#0a0a0a',
      titleBarStyle: 'default',
      darkTheme: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs')
      }
    });
    
    win.webContents.openDevTools();
    return win.id;
  } else {
    // Fallback to original method
    const { createAppWindow: originalCreate } = require('./appWindow.cjs');
    return originalCreate(appId);
  }
}

async function createMain() {
  // Force dark mode
  nativeTheme.themeSource = 'dark';
  
  // NEW: Initialize WindowManager
  const wmReady = await initializeWindowManager();
  
  // Create the workspace window
  mainWindow = await createWorkspaceWindow();

  // Initialize the global message bus
  setupBusHandlers();

  // Register handler for opening app windows
  ipcMain.handle('desktop-open-app', async (_event, appId) => {
    return await createAppWindow(appId);
  });

  // Initialize tray manager
  trayManager = new SimpleTrayManager({
    productName: 'Fin Desktop',
    getMainWindow: () => mainWindow,
  });

  // Setup tray IPC handlers (existing code)
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

  if (wmReady) {
    console.log('[Main] 🎯 WindowManager ready - drag windows to screen edges to test docking!');
  }
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
  // NEW: Cleanup WindowManager
  if (windowManager) {
    windowManager.closeAllWindows();
  }
});
```

#### Step 2: Build TypeScript Files

Since your project uses TypeScript, you need to compile the new files:

```powershell
# Compile TypeScript files
npm run build

# Or if using tsc directly
npx tsc
```

#### Step 3: Run the App

```powershell
npm run dev
```

---

### Option B: Simple Test Without Full Integration

If you want to test quickly without modifying main.cjs, create a test file:

#### Create `electron/main-with-docking.cjs`

```javascript
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// Simple inline window docking implementation for testing
class SimpleDocking {
  constructor() {
    this.edgeThreshold = 10;
    this.windows = new Map();
  }

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
        ...options.webPreferences
      }
    });

    this.windows.set(win.id, { appId, win });

    win.loadURL(url);
    win.once('ready-to-show', () => win.show());
    win.webContents.openDevTools();

    // Set up docking
    win.on('move', () => this.checkDocking(win));
    win.on('closed', () => this.windows.delete(win.id));

    return win;
  }

  checkDocking(win) {
    if (win.isMaximized()) return;

    const bounds = win.getBounds();
    const { screen } = require('electron');
    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;

    // Check top edge (fullscreen)
    if (Math.abs(bounds.y - workArea.y) <= this.edgeThreshold) {
      console.log('[Docking] Top edge detected - snapping to fullscreen');
      win.setBounds({
        x: workArea.x,
        y: workArea.y,
        width: workArea.width,
        height: workArea.height
      }, true);
      return;
    }

    // Check left edge
    if (Math.abs(bounds.x - workArea.x) <= this.edgeThreshold) {
      console.log('[Docking] Left edge detected - snapping to left half');
      win.setBounds({
        x: workArea.x,
        y: workArea.y,
        width: Math.floor(workArea.width / 2),
        height: workArea.height
      }, true);
      return;
    }

    // Check right edge
    const windowRightEdge = bounds.x + bounds.width;
    const workAreaRightEdge = workArea.x + workArea.width;
    if (Math.abs(windowRightEdge - workAreaRightEdge) <= this.edgeThreshold) {
      console.log('[Docking] Right edge detected - snapping to right half');
      win.setBounds({
        x: workArea.x + Math.floor(workArea.width / 2),
        y: workArea.y,
        width: Math.floor(workArea.width / 2),
        height: workArea.height
      }, true);
    }
  }
}

const docking = new SimpleDocking();
let mainWindow = null;

async function createMain() {
  nativeTheme.themeSource = 'dark';

  console.log('🎯 Starting FinDesktop with Window Docking Test');
  console.log('📍 Drag windows close to screen edges to test:');
  console.log('   - Left edge: Snap to left half');
  console.log('   - Right edge: Snap to right half');
  console.log('   - Top edge: Snap to fullscreen');
  console.log('   - Edge threshold: 10 pixels');

  // Create main workspace window
  mainWindow = docking.createWindow(
    'MainWorkspace',
    VITE_DEV_SERVER_URL,
    { width: 1200, height: 800, title: 'FinDesktop Workspace' }
  );

  // Handle app window creation
  ipcMain.handle('desktop-open-app', async (_event, appId) => {
    console.log('[Test] Opening app:', appId);
    const url = `${VITE_DEV_SERVER_URL}/?entry=app&appId=${encodeURIComponent(appId)}`;
    const appWin = docking.createWindow(appId, url, {
      title: `App: ${appId}`
    });
    return appWin.id;
  });
}

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
```

#### Run Test Version

```powershell
# Temporarily update package.json "main" field
# Or run directly:
npx electron electron/main-with-docking.cjs
```

---

## Testing Steps

### 1. Launch the App

```powershell
npm run dev
```

You should see console output:
```
🎯 Starting FinDesktop with Window Docking Test
📍 Drag windows close to screen edges to test:
   - Left edge: Snap to left half
   - Right edge: Snap to right half
   - Top edge: Snap to fullscreen
```

### 2. Test Left Half Docking

1. Click and hold the window title bar
2. Drag the window toward the **left edge** of your screen
3. When you get within 10 pixels, release the mouse
4. ✅ Window should snap to left half-screen

**Expected Result:**
```
[Docking] Left edge detected - snapping to left half
```

Window bounds: Left 50% of screen, full height

### 3. Test Right Half Docking

1. Click and hold the window title bar
2. Drag the window toward the **right edge** of your screen
3. When you get within 10 pixels, release
4. ✅ Window should snap to right half-screen

**Expected Result:**
```
[Docking] Right edge detected - snapping to right half
```

### 4. Test Fullscreen Docking

1. Click and hold the window title bar
2. Drag the window toward the **top edge** of your screen
3. When you get within 10 pixels, release
4. ✅ Window should snap to fullscreen

**Expected Result:**
```
[Docking] Top edge detected - snapping to fullscreen
```

### 5. Test with Multiple Windows

1. Open an app from the launcher (e.g., "Order Ticket", "News")
2. Try docking the app window
3. Open another app
4. Dock it to the opposite side
5. ✅ Both windows should dock independently

### 6. Test Configuration Changes

Edit `src/config/FinDesktopConfig.ts`:

```typescript
windowDocking: {
  dockingEnabled: true,
  edgeThreshold: 50,  // Change to 50 pixels for easier testing
}
```

Rebuild and test - docking should trigger from farther away.

---

## Visual Testing Checklist

- [ ] **Main window docks** when dragged to edges
- [ ] **App windows dock** when launched via launcher
- [ ] **Left half snap** works correctly
- [ ] **Right half snap** works correctly
- [ ] **Fullscreen snap** works correctly
- [ ] **Top edge takes priority** over left/right
- [ ] **Maximized windows don't dock** (no interference)
- [ ] **Multiple windows** dock independently
- [ ] **Console shows docking messages**
- [ ] **Smooth animation** during snap

---

## Troubleshooting

### Issue: "Cannot find module '../src/main/windowManager.js'"

**Solution:** The TypeScript files need to be compiled first.

```powershell
# Check if you have a build script
npm run build

# Or compile manually
npx tsc

# Check output directory
ls dist/  # or wherever your compiled files go
```

### Issue: Docking not triggering

**Possible causes:**
1. Window is maximized (docking disabled for maximized windows)
2. Edge threshold too small - try increasing to 20-50 pixels
3. Not dragging close enough to edge

**Debug:**
```javascript
// Add more logging in checkDocking method
console.log('Window position:', bounds.x, bounds.y);
console.log('Distance from left:', Math.abs(bounds.x - workArea.x));
```

### Issue: Window snaps too aggressively

**Solution:** Increase edge threshold:
```typescript
windowDocking: {
  edgeThreshold: 5,  // Less aggressive
}
```

### Issue: Using CommonJS in Electron but TypeScript in src/

**Solution:** Use Option B (simple test) or set up proper TypeScript compilation:

```json
// tsconfig.json - ensure proper output
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "ESNext",
    "target": "ES2020"
  }
}
```

---

## Advanced Testing

### Test on Different Screen Resolutions

1. Change display resolution
2. Test docking still works correctly
3. Verify work area calculations

### Test with Taskbar

**Windows:**
- Move taskbar to different edges
- Verify work area respects taskbar position

**macOS:**
- Verify menu bar is respected

### Test Edge Cases

- [ ] Drag very fast to edge
- [ ] Drag slowly to edge
- [ ] Drag and release just outside threshold
- [ ] Multiple rapid docks
- [ ] Dock, undock, redock same window

---

## Demo Video Script

Want to show it off? Here's a demo script:

1. **Launch app**: "Starting FinDesktop with window docking..."
2. **Left snap**: "Dragging to left edge... snap! Left half."
3. **Right snap**: "Dragging to right edge... snap! Right half."
4. **Fullscreen**: "Dragging to top... snap! Fullscreen."
5. **Multiple windows**: "Open Order Ticket app... dock left. Open News app... dock right. Perfect side-by-side!"
6. **Show config**: "Easy to configure - enable/disable, adjust sensitivity..."

---

## Next Steps After Testing

Once you verify it works:

1. ✅ Integrate fully into main.cjs
2. ✅ Add IPC handlers for renderer control
3. ✅ Add user preferences for docking on/off
4. ✅ Consider adding keyboard shortcuts
5. ✅ Add visual indicators during drag
6. ✅ Implement persistent window positions

Ready to test? Start with **Option B** for quickest results!
