# FinDesktop Main Process

This directory contains Electron main process code for FinDesktop.

## Overview

The main process in Electron is responsible for:
- Creating and managing BrowserWindow instances
- Handling native OS integrations (menus, tray, notifications)
- Managing app lifecycle
- Providing IPC communication with renderer processes

## Files

### `windowManager.ts`

**WindowManager class** - Core window management with OS-level docking support.

Features:
- ✅ Create and track BrowserWindow instances
- ✅ OS-style window snapping (left/right half, fullscreen)
- ✅ Configurable via `FinDesktopConfig`
- ✅ Automatic cleanup on window close
- 🔄 TODO: Persistent window bounds storage
- 🔄 TODO: Multi-monitor support
- 🔄 TODO: Per-monitor docking calculations

**Key APIs:**
```typescript
// Singleton instance
import { windowManager } from './windowManager';

// Initialize with config
windowManager.setConfig(finDesktopConfig);

// Create a window
const win = windowManager.createAppWindow(
  'OrderTicketApp',
  'http://localhost:3000/order-ticket'
);

// Get all windows
const windows = windowManager.getWindows();

// Get specific window
const win = windowManager.getWindowByAppId('OrderTicketApp');

// Close window
windowManager.closeWindow('OrderTicketApp');
```

### `windowManager.example.ts`

Complete integration examples showing:
- How to initialize WindowManager in your main process
- Creating different types of app windows
- Setting up IPC handlers for window management
- Preload script APIs
- Renderer process usage examples

## Window Docking

### How It Works

The WindowManager implements simple OS-style window snapping:

1. **Edge Detection**: When a window moves, the manager checks if any edge is within the configured threshold (default: 10px) of screen edges

2. **Docking Positions**:
   - **Left Half**: Window left edge near screen left edge
   - **Right Half**: Window right edge near screen right edge  
   - **Fullscreen**: Window top edge near screen top edge (takes priority)

3. **Snap Animation**: Windows smoothly animate to their docked position

### Configuration

Configure docking behavior in `src/config/FinDesktopConfig.ts`:

```typescript
export const finDesktopConfig: FinDesktopConfig = {
  // ... other config
  windowDocking: {
    dockingEnabled: true,    // Enable/disable docking
    edgeThreshold: 10,       // Distance in pixels to trigger snap
  },
};
```

### Disabling Docking

To disable docking:
```typescript
windowDocking: {
  dockingEnabled: false,
  edgeThreshold: 10,
}
```

Or toggle at runtime:
```typescript
// From renderer
await window.electronAPI.toggleDocking(false);
```

## Integration Steps

1. **Import and Initialize** (in `electron/main.cjs` or similar):
   ```typescript
   import { windowManager } from './windowManager';
   import { finDesktopConfig } from '../config/FinDesktopConfig';
   
   app.whenReady().then(() => {
     windowManager.setConfig(finDesktopConfig);
     // ... create windows
   });
   ```

2. **Create Windows**:
   ```typescript
   const mainWin = windowManager.createAppWindow(
     'MainWorkspace',
     'http://localhost:5173',
     {
       width: 1280,
       height: 800,
       webPreferences: {
         preload: path.join(__dirname, 'preload.cjs'),
       },
     }
   );
   ```

3. **Set Up IPC** (optional, for renderer control):
   See `windowManager.example.ts` for complete IPC handler examples

4. **Clean Up**:
   ```typescript
   app.on('before-quit', () => {
     windowManager.closeAllWindows();
   });
   ```

## Future Enhancements

### TODO: Persistent Window Bounds
Store and restore window positions/sizes across app restarts:
```typescript
// Load saved bounds
const savedBounds = loadSavedBounds(appId);
const win = windowManager.createAppWindow(appId, url, {
  ...savedBounds,
});

// Save on close
win.on('close', () => {
  saveBounds(appId, win.getBounds());
});
```

### TODO: Multi-Monitor Support
Dock windows to the display they're currently on:
```typescript
// Detect which display
const display = getWindowDisplay(win);
const workArea = display.workArea;

// Dock to that display's edges
dockWindow(win, position, display);
```

### TODO: Advanced Docking
- Bottom half-screen docking
- Quarter-screen docking (corners)
- Custom docking zones
- Keyboard shortcuts for docking
- Visual indicators during drag

### TODO: Window Grouping
- Tab groups within windows
- Linked window movement
- Workspace presets

## Testing

To test docking behavior:

1. **Enable Docking**: Ensure `windowDocking.dockingEnabled = true` in config

2. **Create Test Window**:
   ```typescript
   const testWin = windowManager.createAppWindow(
     'TestApp',
     'http://localhost:5173/test'
   );
   ```

3. **Test Snap Positions**:
   - Drag window to left edge → snaps to left half
   - Drag window to right edge → snaps to right half
   - Drag window to top edge → snaps to fullscreen

4. **Adjust Threshold**: Modify `edgeThreshold` to change sensitivity

5. **Disable Docking**: Set `dockingEnabled = false` to verify it disables properly

## Architecture Notes

### Design Decisions

1. **Singleton Pattern**: The `windowManager` singleton ensures a single source of truth for all windows

2. **Metadata Tracking**: Each window is tracked with `WindowMetadata` containing:
   - App ID for identification
   - Original URL
   - Docking state flag (prevents recursion)

3. **Event-Based Docking**: Uses Electron's `move` event rather than polling for performance

4. **Recursion Prevention**: The `isDocking` flag prevents infinite loops during `setBounds`

5. **Priority Order**: Top-edge (fullscreen) takes priority over left/right half

### Performance Considerations

- **Event Throttling**: Move events fire rapidly; consider throttling if needed
- **Display Queries**: `screen.getPrimaryDisplay()` is called on each move; cache if expensive
- **Animation**: `setBounds(bounds, true)` uses native OS animation

### Security

- Window creation requires explicit app ID
- No dynamic URL injection without validation
- IPC handlers should validate input from renderer

## Related Documentation

- [Electron BrowserWindow API](https://www.electronjs.org/docs/latest/api/browser-window)
- [Electron Screen API](https://www.electronjs.org/docs/latest/api/screen)
- [FinDesktop Config](../config/README.md)
- [Desktop Integration](../desktop/README.md)
