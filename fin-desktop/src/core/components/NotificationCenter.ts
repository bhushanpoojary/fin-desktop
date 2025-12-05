/**
 * NotificationCenter - Core Component
 * 
 * Central hub for managing notifications through the configured INotificationProvider.
 * This is a core component - do not modify directly. Use extension points instead.
 */

import type { INotificationProvider, Notification } from '../interfaces/INotificationProvider';

export class NotificationCenter {
  private provider: INotificationProvider | null = null;
  private notificationQueue: Notification[] = [];

  /**
   * Initialize the notification center with a provider
   */
  async initialize(provider: INotificationProvider): Promise<void> {
    this.provider = provider;
    await provider.initialize();
    console.log('NotificationCenter initialized with provider');
    
    // Process any queued notifications
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        await this.provider.notify(notification);
      }
    }
  }

  /**
   * Show a notification
   */
  async notify(notification: Notification): Promise<void> {
    if (this.provider) {
      await this.provider.notify(notification);
    } else {
      // Queue notification if provider not ready
      this.notificationQueue.push(notification);
    }
  }

  /**
   * Show a success notification
   */
  async success(message: string, title?: string, duration?: number): Promise<void> {
    await this.notify({
      type: 'success',
      message,
      title,
      duration,
    });
  }

  /**
   * Show an error notification
   */
  async error(message: string, title?: string, duration?: number): Promise<void> {
    await this.notify({
      type: 'error',
      message,
      title,
      duration,
    });
  }

  /**
   * Show a warning notification
   */
  async warning(message: string, title?: string, duration?: number): Promise<void> {
    await this.notify({
      type: 'warning',
      message,
      title,
      duration,
    });
  }

  /**
   * Show an info notification
   */
  async info(message: string, title?: string, duration?: number): Promise<void> {
    await this.notify({
      type: 'info',
      message,
      title,
      duration,
    });
  }

  /**
   * Clear a notification
   */
  clear(id: string): void {
    if (this.provider) {
      this.provider.clear(id);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    if (this.provider) {
      this.provider.clearAll();
    }
    this.notificationQueue = [];
  }
}
