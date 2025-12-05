/**
 * DefaultNotificationProvider
 * 
 * Default implementation of INotificationProvider for FinDesktop.
 * This provides basic browser notification functionality.
 * 
 * Customers can extend or replace this with their own implementation.
 */

import type {
  INotificationProvider,
  Notification,
  NotificationOptions,
} from '../interfaces/INotificationProvider';

export class DefaultNotificationProvider implements INotificationProvider {
  private notifications: Map<string, Notification> = new Map();
  private notificationIdCounter = 0;

  async initialize(): Promise<void> {
    console.log('DefaultNotificationProvider initialized');
    
    // Request notification permission if in browser
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  async notify(notification: Notification): Promise<void> {
    const id = notification.id || `notification-${++this.notificationIdCounter}`;
    const fullNotification = { ...notification, id };
    
    this.notifications.set(id, fullNotification);
    console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);

    // Show browser notification if supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title || notification.type.toUpperCase(), {
        body: notification.message,
        icon: this.getIconForType(notification.type),
      });
    }

    // Auto-clear after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => this.clear(id), notification.duration);
    }
  }

  async success(message: string, options?: NotificationOptions): Promise<void> {
    await this.notify({
      type: 'success',
      message,
      title: options?.title || 'Success',
      duration: options?.duration || 3000,
      action: options?.action,
    });
  }

  async error(message: string, options?: NotificationOptions): Promise<void> {
    await this.notify({
      type: 'error',
      message,
      title: options?.title || 'Error',
      duration: options?.duration || 5000,
      action: options?.action,
    });
  }

  async warning(message: string, options?: NotificationOptions): Promise<void> {
    await this.notify({
      type: 'warning',
      message,
      title: options?.title || 'Warning',
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  async info(message: string, options?: NotificationOptions): Promise<void> {
    await this.notify({
      type: 'info',
      message,
      title: options?.title || 'Info',
      duration: options?.duration || 3000,
      action: options?.action,
    });
  }

  clear(id: string): void {
    this.notifications.delete(id);
    console.log('Notification cleared:', id);
  }

  clearAll(): void {
    this.notifications.clear();
    console.log('All notifications cleared');
  }

  private getIconForType(type: string): string {
    // Return appropriate icon based on notification type
    const icons: Record<string, string> = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type] || 'ℹ';
  }
}
