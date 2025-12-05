/**
 * NotificationCenter - Event-based notification service
 * 
 * Provides a singleton service for managing notifications across the application.
 * Supports subscribing to notifications and maintaining history.
 */

import type { Notification } from "./NotificationTypes";

type NotificationCallback = (notification: Notification) => void;

class NotificationCenter {
  private listeners: NotificationCallback[] = [];
  private history: Notification[] = [];

  /**
   * Display a notification to all subscribers
   * @param notification The notification to show
   */
  show(notification: Notification): void {
    // Add to history
    this.history.push(notification);

    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("Error in notification callback:", error);
      }
    });
  }

  /**
   * Subscribe to notifications
   * @param callback Function to call when a notification is shown
   * @returns Unsubscribe function
   */
  onNotification(callback: NotificationCallback): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get all notifications from history
   * @returns Array of all notifications
   */
  getHistory(): Notification[] {
    return [...this.history];
  }

  /**
   * Clear notification history
   */
  clearHistory(): void {
    this.history = [];
  }
}

// Export singleton instance
export const notificationCenter = new NotificationCenter();
