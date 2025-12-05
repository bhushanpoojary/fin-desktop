/**
 * TrayManager
 * 
 * Handles system tray icon behavior and branding for Fin Desktop.
 * 
 * This manager integrates with Electron's Tray API to provide:
 * - System tray icon with custom branding
 * - Context menu with workspace actions
 * - Window minimize/restore to tray functionality
 * - Desktop event bus integration for UI notifications
 * 
 * Usage:
 * ```ts
 * import { TrayManager } from './TrayManager';
 * import { DesktopEventBus } from './DesktopEventBus';
 * import { DefaultBranding } from '../core/defaults/DefaultBranding';
 * 
 * const eventBus = new DesktopEventBus();
 * const branding = new DefaultBranding();
 * 
 * const trayManager = new TrayManager({
 *   branding,
 *   eventBus,
 *   getMainWindow: () => mainWindow,
 * });
 * 
 * // Minimize to tray
 * trayManager.minimizeToTray();
 * 
 * // Restore from tray
 * trayManager.restoreFromTray();
 * ```
 */

import { Tray, Menu, BrowserWindow, nativeImage, app } from 'electron';
import type { IProductBranding } from '../core/interfaces/IProductBranding';
import type { IDesktopEventBus } from './DesktopEventBus';

/**
 * Options for initializing the TrayManager
 */
export interface TrayManagerOptions {
  /**
   * Product branding configuration
   * Provides tray icon path, tooltip, and product name
   */
  branding: IProductBranding;

  /**
   * Desktop event bus for publishing tray events
   */
  eventBus: IDesktopEventBus;

  /**
   * Callback to get the main window instance
   * Keeps TrayManager decoupled from window ownership
   */
  getMainWindow: () => BrowserWindow | null;
}

/**
 * TrayManager Class
 * 
 * Manages the system tray icon and its associated context menu.
 * Integrates with IProductBranding for customizable branding.
 * 
 * Example renderer-side event subscription:
 * ```ts
 * eventBus.subscribe(evt => {
 *   if (evt.type === "RESTORE_MAIN_WINDOW") {
 *     // Bring workspace UI into view, if needed
 *   }
 *   if (evt.type === "OPEN_SETTINGS") {
 *     // Show settings dialog/panel
 *   }
 * });
 * ```
 */
export class TrayManager {
  private tray: Tray | null = null;
  private branding: IProductBranding;
  private eventBus: IDesktopEventBus;
  private getMainWindow: () => BrowserWindow | null;
  private isMinimizedToTray = false;

  /**
   * Creates a new TrayManager instance
   * 
   * @param options - Configuration options
   */
  constructor(options: TrayManagerOptions) {
    this.branding = options.branding;
    this.eventBus = options.eventBus;
    this.getMainWindow = options.getMainWindow;

    // Initialize the tray icon
    this.initializeTray();
  }

  /**
   * Initialize the system tray icon and context menu
   * 
   * Branding injection point: The tray icon and tooltip are pulled from
   * the IProductBranding interface, allowing customers to customize the
   * system tray appearance by providing their own branding implementation.
   */
  private initializeTray(): void {
    try {
      // Get tray icon path from branding (branding injection point)
      const iconPath = this.branding.getTrayIconPath();
      const tooltip = this.branding.getTrayTooltip();
      const productName = this.branding.getProductName();

      console.log(`[TrayManager] Initializing tray icon: ${iconPath}`);

      // Create the tray icon
      const icon = nativeImage.createFromPath(iconPath);
      this.tray = new Tray(icon);

      // Set tooltip (branding injection point)
      this.tray.setToolTip(tooltip);

      // Create context menu
      const contextMenu = Menu.buildFromTemplate([
        {
          label: `Open ${productName}`,
          click: () => this.handleRestoreWindow(),
        },
        {
          type: 'separator',
        },
        {
          label: 'Settings',
          click: () => this.handleOpenSettings(),
        },
        {
          type: 'separator',
        },
        {
          label: 'Exit',
          click: () => this.handleExit(),
        },
      ]);

      this.tray.setContextMenu(contextMenu);

      // Double-click on tray icon to restore window
      this.tray.on('double-click', () => {
        this.handleRestoreWindow();
      });

      console.log('[TrayManager] Tray icon initialized successfully');
    } catch (error) {
      console.error('[TrayManager] Failed to initialize tray icon:', error);
    }
  }

  /**
   * Handle "Open/Restore Window" action from tray menu
   */
  private handleRestoreWindow(): void {
    console.log('[TrayManager] Restore window action triggered');

    // Restore the window
    this.restoreFromTray();

    // Publish event to the event bus so renderer can react
    this.eventBus.publish({ type: 'RESTORE_MAIN_WINDOW' });
  }

  /**
   * Handle "Settings" action from tray menu
   * 
   * Publishes an event to the event bus, allowing the renderer process
   * to decide how to handle the settings UI (e.g., open a modal, navigate to a settings page)
   */
  private handleOpenSettings(): void {
    console.log('[TrayManager] Open settings action triggered');

    // Publish event to event bus (renderer can handle this)
    this.eventBus.publish({ type: 'OPEN_SETTINGS' });

    // Also restore the main window so user can see the settings
    this.restoreFromTray();
  }

  /**
   * Handle "Exit" action from tray menu
   * 
   * Cleanly shuts down the application
   */
  private handleExit(): void {
    console.log('[TrayManager] Exit action triggered');

    // Publish event to event bus (allows cleanup before exit)
    this.eventBus.publish({ type: 'EXIT_REQUESTED' });

    // Clean up tray icon
    this.dispose();

    // Quit the application
    app.quit();
  }

  /**
   * Minimize the main window to the system tray
   * 
   * Hides the main window and keeps the app running in the tray.
   * This is idempotent - calling it multiple times is safe.
   * 
   * @param windowId - Optional window ID (currently unused, for future multi-window support)
   */
  minimizeToTray(windowId?: string): void {
    const mainWindow = this.getMainWindow();

    if (!mainWindow) {
      console.warn('[TrayManager] Cannot minimize to tray: main window is null');
      return;
    }

    if (this.isMinimizedToTray) {
      console.log('[TrayManager] Already minimized to tray, skipping');
      return;
    }

    console.log('[TrayManager] Minimizing window to tray', windowId ? `(windowId: ${windowId})` : '');

    // Hide the window
    mainWindow.hide();

    this.isMinimizedToTray = true;
  }

  /**
   * Restore the main window from the system tray
   * 
   * Shows and focuses the main window.
   * This is idempotent - calling it multiple times is safe.
   */
  restoreFromTray(): void {
    const mainWindow = this.getMainWindow();

    if (!mainWindow) {
      console.warn('[TrayManager] Cannot restore from tray: main window is null');
      return;
    }

    if (!this.isMinimizedToTray && mainWindow.isVisible()) {
      console.log('[TrayManager] Window is already visible, just focusing');
      mainWindow.focus();
      return;
    }

    console.log('[TrayManager] Restoring window from tray');

    // Show and focus the window
    mainWindow.show();
    mainWindow.focus();

    // Restore if minimized
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    this.isMinimizedToTray = false;
  }

  /**
   * Check if the window is currently minimized to tray
   */
  isMinimized(): boolean {
    return this.isMinimizedToTray;
  }

  /**
   * Get the tray instance (for advanced usage)
   */
  getTray(): Tray | null {
    return this.tray;
  }

  /**
   * Clean up the tray icon
   * 
   * Call this when the application is exiting to properly dispose of the tray icon.
   */
  dispose(): void {
    if (this.tray) {
      console.log('[TrayManager] Disposing tray icon');
      this.tray.destroy();
      this.tray = null;
    }
  }
}
