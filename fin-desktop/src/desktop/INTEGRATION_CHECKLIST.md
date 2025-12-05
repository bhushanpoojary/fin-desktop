# TrayManager Integration Checklist

## ✅ Implementation Complete

- [x] TrayManager.ts - Core tray management implementation
- [x] DesktopEventBus.ts - Event bus for desktop events
- [x] IProductBranding.ts - Extended with tray methods
- [x] DefaultBranding.ts - Implemented tray methods
- [x] types.ts - TypeScript type definitions
- [x] README.md - Comprehensive documentation
- [x] Example files - Integration examples for all parts
- [x] Unit tests - Test examples

## 📋 Integration Tasks

### 1. Main Process Integration (electron/main.cjs)

- [ ] Import TrayManager and DesktopEventBus
  ```typescript
  const { TrayManager } = require('../src/desktop/TrayManager');
  const { DesktopEventBus } = require('../src/desktop/DesktopEventBus');
  ```

- [ ] Initialize TrayManager after app ready
  ```typescript
  const eventBus = new DesktopEventBus();
  const branding = new DefaultBranding();
  const trayManager = new TrayManager({
    branding,
    eventBus,
    getMainWindow: () => mainWindow,
  });
  ```

- [ ] Setup window event handlers
  ```typescript
  mainWindow.on('minimize', () => {
    trayManager.minimizeToTray();
  });
  ```

- [ ] Setup IPC handlers (use tray-ipc-handlers.example.cjs)

- [ ] Cleanup on app quit
  ```typescript
  app.on('before-quit', () => {
    trayManager.dispose();
  });
  ```

### 2. Preload Script (electron/preload.cjs)

- [ ] Expose desktop events API via contextBridge
  ```javascript
  contextBridge.exposeInMainWorld('desktopEvents', {
    subscribe: (handler) => { /* ... */ }
  });
  ```

- [ ] Expose tray API via contextBridge
  ```javascript
  contextBridge.exposeInMainWorld('tray', {
    minimizeToTray: () => { /* ... */ },
    restoreFromTray: () => { /* ... */ }
  });
  ```

- [ ] Setup IPC message forwarding

### 3. Renderer Process Integration

- [ ] Create useDesktopEvents hook (use example)

- [ ] Subscribe to desktop events in main App component
  ```typescript
  useDesktopEvents({
    onRestoreWindow: () => { /* ... */ },
    onOpenSettings: () => { /* ... */ },
  });
  ```

- [ ] Handle settings UI in response to OPEN_SETTINGS event

- [ ] Optional: Add minimize to tray button in UI

### 4. Assets

- [ ] Create tray icon image
  - Path: `public/icons/tray-icon.png`
  - Recommended sizes:
    - Windows: 16x16, 32x32
    - macOS: 16x16@1x, 16x16@2x (32x32)
    - Linux: 22x22

- [ ] Test tray icon appearance on target platforms

- [ ] Consider platform-specific icons if needed

### 5. Branding Customization (Optional)

- [ ] Create custom branding class if needed
  ```typescript
  export class CustomBranding implements IProductBranding {
    getTrayIconPath() { return '/icons/custom-tray.png'; }
    getTrayTooltip() { return 'My Custom App'; }
    // ... implement other methods
  }
  ```

- [ ] Use custom branding in TrayManager initialization

### 6. Testing

- [ ] Test minimize to tray on click
- [ ] Test minimize to tray on window minimize event
- [ ] Test restore from tray via double-click
- [ ] Test "Open" menu item
- [ ] Test "Settings" menu item
- [ ] Test "Exit" menu item
- [ ] Test on Windows
- [ ] Test on macOS
- [ ] Test on Linux (if supported)

### 7. Build Configuration

- [ ] Ensure TypeScript compilation includes desktop module
- [ ] Update tsconfig.json if needed
- [ ] Test production build with tray functionality

## 📝 Code Changes Required

### Files to Modify

1. **electron/main.cjs** (or main.ts)
   - Add TrayManager initialization
   - Add window event handlers
   - Add IPC handlers
   - Add cleanup on quit

2. **electron/preload.cjs** (or preload.ts)
   - Add desktop API exposure
   - Add IPC message forwarding

3. **src/App.tsx** (or main app component)
   - Add useDesktopEvents hook
   - Handle desktop events

### New Files to Create

1. **src/hooks/useDesktopEvents.ts**
   - Based on example file
   - Adapted to your app structure

2. **public/icons/tray-icon.png**
   - Tray icon asset

## 🔍 Verification Steps

### After Integration

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Check tray icon appears**
   - Should appear in system tray
   - Should show tooltip on hover

3. **Test minimize to tray**
   - Click minimize button
   - Window should hide
   - Tray icon should remain

4. **Test restore from tray**
   - Double-click tray icon
   - Window should show and focus

5. **Test context menu**
   - Right-click tray icon
   - Should see: "Open [App Name]", "Settings", "Exit"

6. **Test menu actions**
   - Click "Open" - should restore window
   - Click "Settings" - should trigger settings UI
   - Click "Exit" - should quit app cleanly

7. **Check console logs**
   - Should see `[TrayManager]` prefixed logs
   - Should see `[DesktopEventBus]` prefixed logs
   - No errors in console

## 🐛 Troubleshooting

### Tray icon not appearing
- Check icon path in `getTrayIconPath()`
- Ensure icon file exists at specified path
- Check console for errors
- Try absolute path instead of relative

### Context menu not showing
- Right-click instead of left-click (platform dependent)
- Check Menu.buildFromTemplate() call
- Verify tray.setContextMenu() is called

### Window not restoring
- Check getMainWindow() returns valid window
- Verify window.show() and window.focus() are called
- Check window state (hidden vs minimized)

### Events not received in renderer
- Verify preload script exposes API correctly
- Check IPC message forwarding is setup
- Verify renderer subscribes to events
- Check for IPC communication errors

### App not quitting on Exit
- Ensure app.quit() is called
- Check for window.preventDefault() in close handler
- Set app.isQuitting flag before quit

## 📚 Resources

- See `src/desktop/README.md` for detailed documentation
- See `src/desktop/example-integration.ts` for main process example
- See `src/desktop/useDesktopEvents.example.tsx` for renderer example
- See `src/desktop/preload.example.cjs` for preload example
- See `src/desktop/tray-ipc-handlers.example.cjs` for IPC example
- See `src/desktop/TrayManager.test.ts` for unit test examples

## 🎯 Success Criteria

- [x] TrayManager implementation complete
- [x] All TypeScript types defined
- [x] Documentation complete
- [x] Example files provided
- [x] No TypeScript errors
- [ ] Main process integrated
- [ ] Preload script updated
- [ ] Renderer integrated
- [ ] Tray icon asset created
- [ ] Manual testing passed
- [ ] Production build tested

## 📞 Support

If you encounter issues:
1. Check the console logs for `[TrayManager]` errors
2. Review the example files in `src/desktop/`
3. Verify all integration steps completed
4. Check Electron documentation for platform-specific issues

---

**Status**: Implementation complete, ready for integration ✅
