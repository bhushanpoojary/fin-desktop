/**
 * Simple TrayManager for Testing (CommonJS)
 * 
 * This is a simplified CommonJS version for quick testing in the demo.
 * It doesn't require TypeScript compilation.
 */

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

class SimpleTrayManager {
  constructor(options) {
    this.getMainWindow = options.getMainWindow;
    this.productName = options.productName || 'Fin Desktop';
    this.isMinimizedToTray = false;
    
    this.initializeTray();
  }

  initializeTray() {
    try {
      console.log('[TrayManager] Initializing tray icon...');
      
      const fs = require('fs');
      let icon;
      
      // Try multiple icon paths
      const iconPaths = [
        path.join(__dirname, '../public/icons/tray-icon.png'),
        path.join(process.cwd(), 'public/icons/tray-icon.png'),
      ];
      
      for (const iconPath of iconPaths) {
        if (fs.existsSync(iconPath)) {
          console.log('[TrayManager] Found icon at:', iconPath);
          icon = nativeImage.createFromPath(iconPath);
          
          if (!icon.isEmpty()) {
            console.log('[TrayManager] Icon loaded successfully, size:', icon.getSize());
            break;
          }
        }
      }
      
      // Fallback: Create icon from base64 (16x16 orange square)
      if (!icon || icon.isEmpty()) {
        console.log('[TrayManager] Using fallback base64 icon');
        icon = nativeImage.createFromDataURL(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQ0lEQVR42mP8z8DwHwMTAEYYA5kzqgEyGtQAGQ1qgIwGNUBGgxogo0ENkNGgBshoUANkNKgBMhrUABkNaoD+GjBgAABrIQYCMtw7CAAAAABJRU5ErkJggg=='
        );
      }
      
      // Create tray with icon
      this.tray = new Tray(icon);
      console.log('[TrayManager] Tray icon created');
      
      this.tray.setToolTip(`${this.productName} - Workspace Demo`);
      
      // Create context menu
      const contextMenu = Menu.buildFromTemplate([
        {
          label: `Open ${this.productName}`,
          click: () => this.restoreFromTray(),
        },
        {
          type: 'separator',
        },
        {
          label: 'Settings',
          click: () => {
            console.log('[TrayManager] Settings clicked');
            this.restoreFromTray();
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Exit',
          click: () => {
            console.log('[TrayManager] Exit clicked');
            app.quit();
          },
        },
      ]);

      this.tray.setContextMenu(contextMenu);

      // Double-click to restore
      this.tray.on('double-click', () => {
        console.log('[TrayManager] Double-clicked tray icon');
        this.restoreFromTray();
      });

      console.log('[TrayManager] Tray icon initialized successfully');
    } catch (error) {
      console.error('[TrayManager] Failed to initialize tray:', error);
    }
  }

  minimizeToTray() {
    const mainWindow = this.getMainWindow();
    
    if (!mainWindow) {
      console.warn('[TrayManager] No main window to minimize');
      return;
    }

    if (this.isMinimizedToTray) {
      console.log('[TrayManager] Already minimized to tray');
      return;
    }

    console.log('[TrayManager] Minimizing window to tray');
    mainWindow.hide();
    this.isMinimizedToTray = true;
  }

  restoreFromTray() {
    const mainWindow = this.getMainWindow();
    
    if (!mainWindow) {
      console.warn('[TrayManager] No main window to restore');
      return;
    }

    console.log('[TrayManager] Restoring window from tray');
    
    mainWindow.show();
    mainWindow.focus();
    
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    this.isMinimizedToTray = false;
  }

  isMinimized() {
    return this.isMinimizedToTray;
  }

  dispose() {
    if (this.tray) {
      console.log('[TrayManager] Disposing tray');
      this.tray.destroy();
      this.tray = null;
    }
  }
}

module.exports = { SimpleTrayManager };
