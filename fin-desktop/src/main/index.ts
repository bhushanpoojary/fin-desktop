/**
 * FinDesktop Main Process Exports
 * 
 * Central export point for Electron main process modules.
 */

// WindowManager - Primary export
export { WindowManager, windowManager } from './windowManager';

// Type exports
export type { FinDesktopConfig, WindowDockingConfig } from '../config/FinDesktopConfig';

/**
 * Usage Example:
 * 
 * ```typescript
 * import { windowManager } from '@/main';
 * import { finDesktopConfig } from '@/config/FinDesktopConfig';
 * 
 * // Initialize
 * windowManager.setConfig(finDesktopConfig);
 * 
 * // Create windows
 * const win = windowManager.createAppWindow('MyApp', 'http://localhost:3000');
 * ```
 */
