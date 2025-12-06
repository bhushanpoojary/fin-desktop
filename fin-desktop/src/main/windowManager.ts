/**
 * WindowManager - Manages BrowserWindow instances with OS-level docking support
 * 
 * This module provides window management functionality for FinDesktop apps,
 * including simple Electron-style window snapping (left/right half-screen,
 * full-screen on top edge drag).
 * 
 * Features:
 * - Create and track BrowserWindow instances for each app
 * - OS-style window docking/snapping based on screen edges
 * - Configurable docking behavior via FinDesktopConfig
 * - Automatic cleanup when windows are closed
 * 
 * Usage:
 * ```typescript
 * import { windowManager } from './windowManager';
 * 
 * const win = windowManager.createAppWindow(
 *   'OrderTicketApp',
 *   'http://localhost:3000/order-ticket'
 * );
 * ```
 */

import { BrowserWindow, screen } from 'electron';
import type { Rectangle } from 'electron';
import type { FinDesktopConfig, WindowDockingConfig } from '../config/FinDesktopConfig';

/**
 * Dock position type
 */
type DockPosition = 'LEFT' | 'RIGHT' | 'FULLSCREEN' | 'NONE';

const DockPosition = {
  LEFT: 'LEFT' as const,
  RIGHT: 'RIGHT' as const,
  FULLSCREEN: 'FULLSCREEN' as const,
  NONE: 'NONE' as const,
};

/**
 * Window metadata for tracking
 */
interface WindowMetadata {
  appId: string;
  window: BrowserWindow;
  url: string;
  isDocking: boolean; // Prevents recursive docking during setBounds
}

/**
 * Default window options
 */
const DEFAULT_WINDOW_OPTIONS = {
  width: 1024,
  height: 768,
  show: false, // Don't show until ready-to-show
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
  },
};

/**
 * WindowManager Class
 * 
 * Manages BrowserWindow instances with docking support for FinDesktop apps.
 * Implements OS-style window snapping based on configurable edge thresholds.
 */
export class WindowManager {
  private windows: Map<number, WindowMetadata> = new Map();
  private dockingConfig: WindowDockingConfig;

  constructor() {
    // Default docking config (will be overridden by setConfig)
    this.dockingConfig = {
      dockingEnabled: true,
      edgeThreshold: 10,
    };
  }

  /**
   * Set the FinDesktop configuration
   * Should be called during app initialization with the main config
   * 
   * @param config - FinDesktopConfig instance
   */
  public setConfig(config: FinDesktopConfig): void {
    
    // Update docking config from main config
    if (config.windowDocking) {
      this.dockingConfig = {
        dockingEnabled: config.windowDocking.dockingEnabled ?? true,
        edgeThreshold: config.windowDocking.edgeThreshold ?? 10,
      };
    }
  }

  /**
   * Create a new BrowserWindow for a FinDesktop app
   * 
   * @param appId - Unique identifier for the app
   * @param url - URL to load in the window
   * @param options - Optional BrowserWindow configuration (merged with defaults)
   * @returns The created BrowserWindow instance
   */
  public createAppWindow(
    appId: string,
    url: string,
    options: Electron.BrowserWindowConstructorOptions = {}
  ): BrowserWindow {
    // TODO: Restore last known bounds from persistent storage
    // const savedBounds = this.loadSavedBounds(appId);
    
    const windowOptions = {
      ...DEFAULT_WINDOW_OPTIONS,
      ...options,
      // Override with saved bounds if available
      // ...(savedBounds ? savedBounds : {}),
    };

    const win = new BrowserWindow(windowOptions);

    // Store window metadata
    const metadata: WindowMetadata = {
      appId,
      window: win,
      url,
      isDocking: false,
    };
    this.windows.set(win.id, metadata);

    // Load the URL
    win.loadURL(url).catch((err) => {
      console.error(`Failed to load URL for ${appId}:`, err);
    });

    // Show window when ready
    win.once('ready-to-show', () => {
      win.show();
    });

    // Set up docking listeners if enabled
    if (this.dockingConfig.dockingEnabled) {
      this.setupDockingListeners(win);
    }

    // Handle window close
    win.on('closed', () => {
      this.handleWindowClosed(win.id);
    });

    return win;
  }

  /**
   * Get all managed BrowserWindow instances
   * 
   * @returns Array of all BrowserWindow instances
   */
  public getWindows(): BrowserWindow[] {
    return Array.from(this.windows.values()).map((meta) => meta.window);
  }

  /**
   * Get a specific window by ID
   * 
   * @param windowId - The BrowserWindow ID
   * @returns The BrowserWindow instance or undefined
   */
  public getWindow(windowId: number): BrowserWindow | undefined {
    return this.windows.get(windowId)?.window;
  }

  /**
   * Get a window by app ID
   * 
   * @param appId - The app identifier
   * @returns The BrowserWindow instance or undefined
   */
  public getWindowByAppId(appId: string): BrowserWindow | undefined {
    for (const metadata of this.windows.values()) {
      if (metadata.appId === appId) {
        return metadata.window;
      }
    }
    return undefined;
  }

  /**
   * Close a window by app ID
   * 
   * @param appId - The app identifier
   */
  public closeWindow(appId: string): void {
    const win = this.getWindowByAppId(appId);
    if (win && !win.isDestroyed()) {
      win.close();
    }
  }

  /**
   * Close all managed windows
   */
  public closeAllWindows(): void {
    for (const metadata of this.windows.values()) {
      if (!metadata.window.isDestroyed()) {
        metadata.window.close();
      }
    }
  }

  /**
   * Set up docking listeners for a window
   * Subscribes to 'move' and 'resize' events to trigger docking behavior
   * 
   * @param win - BrowserWindow instance
   */
  private setupDockingListeners(win: BrowserWindow): void {
    // Handle window move events for docking
    win.on('move', () => {
      this.handleWindowMove(win);
    });

    // Handle resize events (in case we want to detect edge proximity during resize)
    // Currently not used, but kept for future enhancements
    win.on('resize', () => {
      // TODO: Add resize-based docking logic if needed
    });
  }

  /**
   * Handle window move event - check for docking
   * 
   * @param win - BrowserWindow instance
   */
  private handleWindowMove(win: BrowserWindow): void {
    if (!this.dockingConfig.dockingEnabled) {
      return;
    }

    const metadata = this.windows.get(win.id);
    if (!metadata || metadata.isDocking) {
      // Skip if we're already in a docking operation (prevents recursion)
      return;
    }

    // Check if window is maximized - don't dock if already maximized
    if (win.isMaximized()) {
      return;
    }

    const dockPosition = this.detectDockPosition(win);
    
    if (dockPosition !== DockPosition.NONE) {
      this.dockWindow(win, dockPosition);
    }
  }

  /**
   * Detect if window should dock based on edge proximity
   * 
   * @param win - BrowserWindow instance
   * @returns The detected dock position
   */
  private detectDockPosition(win: BrowserWindow): DockPosition {
    const bounds = win.getBounds();
    
    // TODO: Multi-monitor support - detect which display the window is on
    // For now, use primary display
    const display = screen.getPrimaryDisplay();
    const workArea = display.workArea;
    const threshold = this.dockingConfig.edgeThreshold;

    // Calculate distances from all edges
    const distanceFromTop = Math.abs(bounds.y - workArea.y);
    const distanceFromLeft = Math.abs(bounds.x - workArea.x);
    const windowRightEdge = bounds.x + bounds.width;
    const workAreaRightEdge = workArea.x + workArea.width;
    const distanceFromRight = Math.abs(windowRightEdge - workAreaRightEdge);

    // Only trigger fullscreen if ONLY top edge is close (not corners)
    // This prevents false positives when dragging to left/right edges
    // Require top edge to be close AND far from left/right edges
    const isNearTopOnly = distanceFromTop <= threshold && 
                          distanceFromLeft > threshold * 3 && 
                          distanceFromRight > threshold * 3;
    
    if (isNearTopOnly) {
      return DockPosition.FULLSCREEN;
    }

    // Check left edge (prioritize left/right over top when at corners)
    if (distanceFromLeft <= threshold) {
      return DockPosition.LEFT;
    }

    // Check right edge
    if (distanceFromRight <= threshold) {
      return DockPosition.RIGHT;
    }

    return DockPosition.NONE;
  }

  /**
   * Dock window to specified position
   * 
   * @param win - BrowserWindow instance
   * @param position - Target dock position
   */
  private dockWindow(win: BrowserWindow, position: DockPosition): void {
    const metadata = this.windows.get(win.id);
    if (!metadata) {
      return;
    }

    // Set flag to prevent recursive docking
    metadata.isDocking = true;

    try {
      // TODO: Multi-monitor support - dock to the display the window is currently on
      const display = screen.getPrimaryDisplay();
      const workArea = display.workArea;

      let targetBounds: Rectangle;

      switch (position) {
        case DockPosition.LEFT:
          targetBounds = {
            x: workArea.x,
            y: workArea.y,
            width: Math.floor(workArea.width / 2),
            height: workArea.height,
          };
          break;

        case DockPosition.RIGHT:
          targetBounds = {
            x: workArea.x + Math.floor(workArea.width / 2),
            y: workArea.y,
            width: Math.floor(workArea.width / 2),
            height: workArea.height,
          };
          break;

        case DockPosition.FULLSCREEN:
          targetBounds = {
            x: workArea.x,
            y: workArea.y,
            width: workArea.width,
            height: workArea.height,
          };
          break;

        default:
          return;
      }

      // Apply the bounds
      win.setBounds(targetBounds, true); // animate = true for smooth transition

      // TODO: Save docked state to persistent storage
      // this.saveDockState(win.id, position);
      
    } finally {
      // Reset the flag after a short delay to allow setBounds to complete
      setTimeout(() => {
        metadata.isDocking = false;
      }, 100);
    }
  }

  /**
   * Handle window closed event
   * Clean up metadata and listeners
   * 
   * @param windowId - BrowserWindow ID
   */
  private handleWindowClosed(windowId: number): void {
    const metadata = this.windows.get(windowId);
    
    if (metadata) {
      // TODO: Save window bounds before closing for restoration
      // this.saveWindowBounds(metadata.appId, metadata.window.getBounds());
      
      // Remove from tracking
      this.windows.delete(windowId);
    }
  }

  /**
   * TODO: Load saved window bounds from persistent storage
   * 
   * @param appId - App identifier
   * @returns Saved bounds or undefined
   */
  // private loadSavedBounds(appId: string): Rectangle | undefined {
  //   // Implementation: Load from electron-store or similar
  //   return undefined;
  // }

  /**
   * TODO: Save window bounds to persistent storage
   * 
   * @param appId - App identifier
   * @param bounds - Window bounds to save
   */
  // private saveWindowBounds(appId: string, bounds: Rectangle): void {
  //   // Implementation: Save to electron-store or similar
  // }

  /**
   * TODO: Save docked state to persistent storage
   * 
   * @param windowId - Window ID
   * @param position - Dock position
   */
  // private saveDockState(windowId: number, position: DockPosition): void {
  //   // Implementation: Track docking history for analytics or restoration
  // }

  /**
   * TODO: Multi-monitor support
   * Detect which display a window is primarily on
   * 
   * @param win - BrowserWindow instance
   * @returns Display the window is on
   */
  // private getWindowDisplay(win: BrowserWindow): Electron.Display {
  //   const bounds = win.getBounds();
  //   const displays = screen.getAllDisplays();
  //   
  //   // Find display with most window area overlap
  //   // For now, just return primary display
  //   return screen.getPrimaryDisplay();
  // }
}

/**
 * Singleton instance of WindowManager
 * Export this for use throughout the Electron main process
 */
export const windowManager = new WindowManager();

/**
 * Export the class for testing or custom instantiation
 */
export default WindowManager;
