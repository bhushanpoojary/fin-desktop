# Testing TrayManager in the Demo

## Quick Start

The TrayManager has been integrated into your Electron app for testing!

## How to Test

### 1. Start the App

```bash
npm run dev
```

### 2. Test Methods

#### Method 1: Use the "Minimize to Tray" Button

1. Look at the top of the workspace window
2. Click the **"📍 Minimize to Tray"** button (next to "Save Layout")
3. The window will hide and minimize to the system tray

#### Method 2: Click the Window Minimize Button

1. Click the minimize button on the window title bar (—)
2. The window will automatically minimize to the tray instead of the taskbar

#### Method 3: Close the Window

1. Click the close button (X) on the window
2. The window will minimize to tray instead of closing the app

### 3. Restore from Tray

Once minimized to tray, you can restore the window by:

- **Double-clicking the tray icon** (small icon in system tray)
- **Right-clicking the tray icon** → Select "Open Fin Desktop"

### 4. Context Menu Actions

Right-click the tray icon to see:

- **"Open Fin Desktop"** - Restores the main window
- **"Settings"** - Restores window and logs to console
- **"Exit"** - Quits the application

## What to Look For

### Console Logs

Open DevTools (should auto-open) and watch for:

```
[TrayManager] Initializing tray icon...
[TrayManager] Tray icon initialized successfully
[Main] Tray manager initialized - minimize window to test!
[TrayManager] Minimizing window to tray
[TrayManager] Restoring window from tray
```

### System Tray Icon

- On **Windows**: Look in the system tray (bottom-right, near clock)
- On **macOS**: Look in the menu bar (top-right)
- On **Linux**: Look in the system tray area

**Note**: The tray icon will be a simple empty icon for this test (no custom image yet).

## Test Checklist

- [ ] App starts without errors
- [ ] Tray icon appears in system tray
- [ ] Click "Minimize to Tray" button → window hides
- [ ] Double-click tray icon → window restores
- [ ] Right-click tray icon → context menu appears
- [ ] Context menu shows: "Open Fin Desktop", "Settings", "Exit"
- [ ] Click "Open Fin Desktop" → window restores
- [ ] Click "Settings" → window restores + console log
- [ ] Click "Exit" → app quits cleanly
- [ ] Window minimize button (—) → hides to tray
- [ ] Window close button (X) → hides to tray (doesn't quit)
- [ ] Multiple minimize/restore cycles work correctly

## Troubleshooting

### Tray icon not visible

- Check console for `[TrayManager]` errors
- On Windows: Check if tray icons are hidden (click ^ arrow to show hidden icons)
- Try clicking the empty space in the system tray area

### Window doesn't restore

- Check console for errors
- Try manually calling: Open DevTools Console → Type: `window.desktopApi.tray.restoreFromTray()`

### Button not appearing

- Make sure you're on the workspace view (not an app window)
- Look in the top bar next to "Save Layout"

### Console errors

If you see errors, check:
1. Is Electron running? (`npm run dev`)
2. Are there any TypeScript compilation errors?
3. Check the main process logs in terminal

## What's Implemented

### Files Modified

1. **`electron/main.cjs`**
   - Added TrayManager initialization
   - Added window event handlers (minimize, close)
   - Added IPC handlers for tray actions

2. **`electron/preload.cjs`**
   - Added `tray` API with `minimizeToTray()` and `restoreFromTray()`

3. **`electron/simpleTrayManager.cjs`**
   - Simple CommonJS tray manager for testing
   - Context menu with 3 actions
   - Window show/hide functionality

4. **`src\workspace\WorkspaceShell.tsx`**
   - Added "Minimize to Tray" test button

5. **`src\shared\desktopApi.ts`**
   - Added TypeScript types for tray API

## Next Steps

After testing, you can:

1. **Add a custom tray icon**:
   - Create `public/icons/tray-icon.png`
   - Update `simpleTrayManager.cjs` to use it

2. **Use the full TypeScript implementation**:
   - Migrate to `src/desktop/TrayManager.ts`
   - Add branding integration
   - Add desktop event bus

3. **Add more features**:
   - Notification badges on tray icon
   - Flash icon on new notifications
   - Platform-specific menu items

## Demo Video Script

1. Start app: `npm run dev`
2. Show the workspace with the new button
3. Click "Minimize to Tray" → window hides
4. Point to tray icon in system tray
5. Double-click tray icon → window restores
6. Right-click tray icon → show context menu
7. Click minimize button (—) → window hides
8. Restore again
9. Click close (X) → window hides (doesn't quit)
10. Right-click tray → "Exit" → app quits

## Support

See the comprehensive documentation in `src/desktop/README.md` for the full TypeScript implementation details.

---

**Status**: Ready for testing! 🎉
