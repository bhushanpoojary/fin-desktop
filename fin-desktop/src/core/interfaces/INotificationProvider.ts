/**
 * INotificationProvider Interface
 * 
 * Public extension contract – do not break without major version bump.
 * 
 * This interface defines the notification system contract for FinDesktop.
 * Implement this interface to provide custom notification delivery mechanisms.
 */

export interface INotificationProvider {
  /**
   * Initialize the notification provider
   */
  initialize(): Promise<void>;

  /**
   * Show a notification to the user
   * @param notification Notification configuration
   */
  notify(notification: Notification): Promise<void>;

  /**
   * Show a success notification
   * @param message Success message
   * @param options Optional notification options
   */
  success(message: string, options?: NotificationOptions): Promise<void>;

  /**
   * Show an error notification
   * @param message Error message
   * @param options Optional notification options
   */
  error(message: string, options?: NotificationOptions): Promise<void>;

  /**
   * Show a warning notification
   * @param message Warning message
   * @param options Optional notification options
   */
  warning(message: string, options?: NotificationOptions): Promise<void>;

  /**
   * Show an info notification
   * @param message Info message
   * @param options Optional notification options
   */
  info(message: string, options?: NotificationOptions): Promise<void>;

  /**
   * Clear a specific notification
   * @param id Notification ID
   */
  clear(id: string): void;

  /**
   * Clear all notifications
   */
  clearAll(): void;
}

export interface Notification {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number; // milliseconds, 0 for persistent
  action?: NotificationAction;
}

export interface NotificationOptions {
  title?: string;
  duration?: number;
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}
