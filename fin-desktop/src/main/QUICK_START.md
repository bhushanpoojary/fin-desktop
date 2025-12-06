# WindowManager Quick Start Guide

This guide shows you how to integrate the WindowManager into your FinDesktop Electron application in 5 minutes.

## Step 1: Import WindowManager in Main Process

In your `electron/main.cjs` (or `main.ts`), import the WindowManager:

```javascript
// If using CommonJS
const { windowManager } = require('../src/main/windowManager');
const { finDesktopConfig } = require('../src/config/FinDesktopConfig');

// If using TypeScript/ESM
import { windowManager } from '../src/main/windowManager';
import { finDesktopConfig } from '../src/config/FinDesktopConfig';
```

## Step 2: Initialize WindowManager

Initialize the WindowManager with your config when the app is ready:

```javascript
const { app } = require('electron');

app.whenReady().then(() => {
  // Initialize window manager with config
  windowManager.setConfig(finDesktopConfig);
  
  console.log('WindowManager initialized');
  
  // Create your main window
  createMainWindow();
});
```

## Step 3: Create Windows Using WindowManager

Replace your existing `new BrowserWindow()` calls with `windowManager.createAppWindow()`:

**Before:**
```javascript
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });
  
  mainWindow.loadURL('http://localhost:5173');
}
```

**After:**
```javascript
function createMainWindow() {
  const mainWindow = windowManager.createAppWindow(
    'MainWorkspace',  // Unique app ID
    'http://localhost:5173',  // URL to load
    {
      width: 1280,
      height: 800,
      title: 'FinDesktop',
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
      },
    }
  );
  
  return mainWindow;
}
```

## Step 4: Test Window Docking

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Test docking behavior:**
   - Drag a window to the **left edge** → Should snap to left half-screen
   - Drag a window to the **right edge** → Should snap to right half-screen  
   - Drag a window to the **top edge** → Should snap to fullscreen

3. **Adjust sensitivity** (optional):
   Edit `src/config/FinDesktopConfig.ts`:
   ```typescript
   windowDocking: {
     dockingEnabled: true,
     edgeThreshold: 15,  // Increase for less sensitive snapping
   }
   ```

## Step 5: Add More Windows

Create additional app windows easily:

```javascript
// Order Ticket window
function createOrderTicket() {
  return windowManager.createAppWindow(
    'OrderTicket',
    'http://localhost:5173/#/order-ticket',
    {
      width: 600,
      height: 800,
      title: 'Order Ticket',
    }
  );
}

// News window
function createNewsWindow() {
  return windowManager.createAppWindow(
    'News',
    'http://localhost:5173/#/news',
    {
      width: 800,
      height: 600,
      title: 'Market News',
    }
  );
}

// Launch from IPC or menu
ipcMain.on('launch-app', (event, appId) => {
  switch (appId) {
    case 'order-ticket':
      createOrderTicket();
      break;
    case 'news':
      createNewsWindow();
      break;
  }
});
```

## Optional: Add IPC Controls

Allow renderer processes to control windows via IPC:

### In Main Process:

```javascript
const { ipcMain } = require('electron');

ipcMain.handle('window:open-app', async (event, appId) => {
  // Check if already open
  const existing = windowManager.getWindowByAppId(appId);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return { success: true, windowId: existing.id };
  }
  
  // Create new window
  let win;
  switch (appId) {
    case 'order-ticket':
      win = createOrderTicket();
      break;
    case 'news':
      win = createNewsWindow();
      break;
    default:
      return { success: false, error: 'Unknown app' };
  }
  
  return { success: true, windowId: win.id };
});

ipcMain.handle('window:close-app', async (event, appId) => {
  windowManager.closeWindow(appId);
  return { success: true };
});
```

### In Preload Script:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openApp: (appId) => ipcRenderer.invoke('window:open-app', appId),
  closeApp: (appId) => ipcRenderer.invoke('window:close-app', appId),
});
```

### In Renderer (React):

```typescript
// Launcher button component
const AppLauncher = ({ appId, name }: { appId: string; name: string }) => {
  const handleLaunch = async () => {
    const result = await window.electronAPI.openApp(appId);
    if (result.success) {
      console.log(`Launched ${name}`);
    }
  };
  
  return <button onClick={handleLaunch}>Launch {name}</button>;
};

// Usage
<AppLauncher appId="order-ticket" name="Order Ticket" />
<AppLauncher appId="news" name="News" />
```

## Troubleshooting

### Docking Not Working

1. **Check config is loaded:**
   ```javascript
   console.log('Docking enabled:', finDesktopConfig.windowDocking?.dockingEnabled);
   console.log('Edge threshold:', finDesktopConfig.windowDocking?.edgeThreshold);
   ```

2. **Verify WindowManager is initialized:**
   ```javascript
   app.whenReady().then(() => {
     windowManager.setConfig(finDesktopConfig);
     console.log('WindowManager ready');
   });
   ```

3. **Test with larger threshold:**
   ```typescript
   windowDocking: {
     dockingEnabled: true,
     edgeThreshold: 50,  // Easier to trigger
   }
   ```

### Windows Not Tracked

Make sure you're using `windowManager.createAppWindow()` instead of `new BrowserWindow()`.

### TypeScript Errors

Ensure proper imports:
```typescript
import { windowManager } from './main/windowManager';
import type { FinDesktopConfig } from './config/FinDesktopConfig';
```

## Configuration Options

### Disable Docking

```typescript
// In FinDesktopConfig.ts
windowDocking: {
  dockingEnabled: false,
  edgeThreshold: 10,
}
```

### Adjust Sensitivity

```typescript
windowDocking: {
  dockingEnabled: true,
  edgeThreshold: 5,   // Very sensitive (5px)
  // or
  edgeThreshold: 20,  // Less sensitive (20px)
}
```

### Toggle at Runtime

```javascript
// In main process
ipcMain.handle('window:toggle-docking', async (event, enabled) => {
  finDesktopConfig.windowDocking.dockingEnabled = enabled;
  windowManager.setConfig(finDesktopConfig);
  return { success: true, enabled };
});

// From renderer
await window.electronAPI.toggleDocking(true);  // Enable
await window.electronAPI.toggleDocking(false); // Disable
```

## Next Steps

- **Persistent Bounds**: Implement window position/size saving (see TODO comments)
- **Multi-Monitor**: Add support for docking on secondary displays
- **Advanced Docking**: Quarter-screen, bottom-half, custom zones
- **Keyboard Shortcuts**: Add hotkeys for docking (e.g., Win+Left, Win+Right)
- **Visual Feedback**: Show dock zones during drag

## Complete Example

Here's a complete minimal `main.cjs`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Import WindowManager - adjust path as needed
// Note: You may need to use require or dynamic import depending on your setup
let windowManager, finDesktopConfig;

async function initialize() {
  const wm = await import('../src/main/windowManager.js');
  const config = await import('../src/config/FinDesktopConfig.js');
  
  windowManager = wm.windowManager;
  finDesktopConfig = config.finDesktopConfig;
}

function createWindow() {
  const mainWindow = windowManager.createAppWindow(
    'MainWindow',
    'http://localhost:5173',
    {
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
      },
    }
  );
  
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  await initialize();
  
  // Configure window manager
  windowManager.setConfig(finDesktopConfig);
  
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (windowManager) {
    windowManager.closeAllWindows();
  }
});
```

## Resources

- [Full Documentation](./README.md)
- [Integration Examples](./windowManager.example.ts)
- [Electron BrowserWindow API](https://www.electronjs.org/docs/latest/api/browser-window)
- [FinDesktop Config Guide](../config/README.md)
