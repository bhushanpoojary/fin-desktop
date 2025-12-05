# Desktop Module

Desktop-level functionality for Fin Desktop, providing system tray integration and desktop event bus.

## Overview

The Desktop module provides:

- **TrayManager**: System tray icon management with context menu
- **DesktopEventBus**: Event bus for desktop-level events (tray actions, window state changes)

## Components

### TrayManager

Manages the system tray icon and its associated context menu. Integrates with `IProductBranding` for customizable branding.

**Features:**
- System tray icon with custom branding (icon, tooltip)
- Context menu with workspace actions (Open, Settings, Exit)
- Window minimize/restore to tray functionality
- Desktop event bus integration

**Usage:**

```typescript
import { TrayManager } from './desktop/TrayManager';
import { DesktopEventBus } from './desktop/DesktopEventBus';
import { DefaultBranding } from './core/defaults/DefaultBranding';

const eventBus = new DesktopEventBus();
const branding = new DefaultBranding();

const trayManager = new TrayManager({
  branding,
  eventBus,
  getMainWindow: () => mainWindow,
});

// Minimize to tray
trayManager.minimizeToTray();

// Restore from tray
trayManager.restoreFromTray();
```

**Branding Integration:**

The tray icon and tooltip are pulled from the `IProductBranding` interface:

```typescript
export interface IProductBranding {
  // ... other methods
  getTrayIconPath(): string;  // Path to tray icon image
  getTrayTooltip(): string;   // Tooltip text for tray icon
}
```

Customers can customize the tray appearance by providing their own branding implementation.

### DesktopEventBus

Simple event bus for desktop-level events. Used by TrayManager to publish events that the renderer process can subscribe to.

**Event Types:**

- `RESTORE_MAIN_WINDOW`: User clicked "Open" in tray menu
- `OPEN_SETTINGS`: User clicked "Settings" in tray menu
- `EXIT_REQUESTED`: User clicked "Exit" in tray menu

**Usage (Renderer Process):**

```typescript
import { DesktopEventBus } from './desktop/DesktopEventBus';

const eventBus = new DesktopEventBus();

// Subscribe to events
const unsubscribe = eventBus.subscribe(evt => {
  if (evt.type === "RESTORE_MAIN_WINDOW") {
    // Bring workspace UI into view
    console.log('Main window restored from tray');
  }
  
  if (evt.type === "OPEN_SETTINGS") {
    // Show settings dialog/panel
    setShowSettings(true);
  }
  
  if (evt.type === "EXIT_REQUESTED") {
    // Perform cleanup before exit
    console.log('Application exit requested');
  }
});

// Later: unsubscribe
unsubscribe();
```

## Integration Example

### Main Process (Electron)

```typescript
// electron/main.cjs or electron/main.ts
import { app, BrowserWindow } from 'electron';
import { TrayManager } from '../src/desktop/TrayManager';
import { DesktopEventBus } from '../src/desktop/DesktopEventBus';
import { DefaultBranding } from '../src/core/defaults/DefaultBranding';

let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Initialize tray manager
  const eventBus = new DesktopEventBus();
  const branding = new DefaultBranding();
  
  trayManager = new TrayManager({
    branding,
    eventBus,
    getMainWindow: () => mainWindow,
  });

  // Handle window minimize to tray
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    trayManager?.minimizeToTray();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      trayManager?.minimizeToTray();
    }
  });

  mainWindow.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

app.on('before-quit', () => {
  app.isQuitting = true;
  trayManager?.dispose();
});
```

### Renderer Process (React)

```typescript
// src/hooks/useDesktopEvents.ts
import { useEffect } from 'react';
import { DesktopEventBus } from '../desktop/DesktopEventBus';

const eventBus = new DesktopEventBus();

export function useDesktopEvents() {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(evt => {
      if (evt.type === "RESTORE_MAIN_WINDOW") {
        // Handle window restore
      }
      if (evt.type === "OPEN_SETTINGS") {
        // Show settings UI
      }
    });

    return unsubscribe;
  }, []);
}
```

## Customization

### Custom Branding

To customize the tray icon and tooltip, implement `IProductBranding`:

```typescript
import { IProductBranding } from '../core/interfaces/IProductBranding';

export class AcmeBranding implements IProductBranding {
  // ... implement other methods
  
  getTrayIconPath(): string {
    return '/icons/acme-tray.png';
  }

  getTrayTooltip(): string {
    return 'Acme Financial Desktop - Your Trading Platform';
  }
}
```

### Custom Context Menu

To add custom menu items, extend `TrayManager`:

```typescript
export class CustomTrayManager extends TrayManager {
  protected createContextMenu(): Menu {
    const baseMenu = super.createContextMenu();
    // Add custom items
    return Menu.buildFromTemplate([
      ...baseMenu.items,
      { type: 'separator' },
      { label: 'Custom Action', click: () => this.handleCustomAction() },
    ]);
  }
}
```

## Testing

### Unit Tests

```typescript
import { TrayManager } from './TrayManager';
import { DesktopEventBus } from './DesktopEventBus';
import { DefaultBranding } from '../core/defaults/DefaultBranding';

describe('TrayManager', () => {
  it('should initialize tray icon', () => {
    const eventBus = new DesktopEventBus();
    const branding = new DefaultBranding();
    const trayManager = new TrayManager({
      branding,
      eventBus,
      getMainWindow: () => null,
    });
    
    expect(trayManager.getTray()).toBeDefined();
  });
  
  it('should publish events on tray actions', (done) => {
    const eventBus = new DesktopEventBus();
    
    eventBus.subscribe(evt => {
      if (evt.type === 'OPEN_SETTINGS') {
        done();
      }
    });
    
    eventBus.publish({ type: 'OPEN_SETTINGS' });
  });
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Main Process                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │              TrayManager                         │   │
│  │  - System tray icon                              │   │
│  │  - Context menu                                  │   │
│  │  - Window minimize/restore                       │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                     │
│                    ▼                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │         DesktopEventBus                          │   │
│  │  - Publish/Subscribe events                      │   │
│  │  - Cross-process communication                   │   │
│  └─────────────────┬───────────────────────────────┘   │
└────────────────────┼─────────────────────────────────────┘
                     │
                     │ IPC / Context Bridge
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  Renderer Process                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │           React Components                       │    │
│  │  - Subscribe to desktop events                   │    │
│  │  - Handle UI updates                             │    │
│  └──────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## Notes

- TrayManager is designed to be used in the Electron main process only
- DesktopEventBus can be used in both main and renderer processes
- The tray icon remains visible even when the main window is hidden
- Double-clicking the tray icon restores the main window
- The "Exit" action cleanly shuts down the application

## Future Enhancements

- [ ] Support for tray icon badges/overlays (notifications count)
- [ ] Animated tray icons
- [ ] Platform-specific menu items (Windows vs macOS)
- [ ] Tray icon flash/blink on notifications
- [ ] Multiple tray icons for different workspace states
