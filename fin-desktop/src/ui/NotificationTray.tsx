/**
 * NotificationTray - React component for displaying toast notifications
 * 
 * Subscribes to NotificationCenter and renders slide-in toast notifications
 * in the bottom-right corner of the screen with action buttons.
 */

import { useState, useEffect } from "react";
import type { Notification, NotificationAction } from "../core/notifications/NotificationTypes";
import { notificationCenter } from "../core/notifications/NotificationCenter";
import { useDesktopApi } from "../shared/hooks/useDesktopApi";
import { finDesktopConfig } from "../config/FinDesktopConfig";
import "./NotificationTray.css";

interface NotificationWithTimeout extends Notification {
  timeoutId?: number;
}

export function NotificationTray() {
  const [notifications, setNotifications] = useState<NotificationWithTimeout[]>([]);
  const { publish } = useDesktopApi();

  useEffect(() => {
    // Subscribe to notification center
    const unsubscribe = notificationCenter.onNotification((notification) => {
      setNotifications((prev) => [...prev, notification]);

      // Auto-dismiss after 5 seconds if no actions
      if (!notification.actions || notification.actions.length === 0) {
        const timeoutId = window.setTimeout(() => {
          handleDismiss(notification.id);
        }, 5000);

        // Store timeout ID for cleanup
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, timeoutId } : n
          )
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDismiss = (notificationId: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification?.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  };

  const handleActionClick = (notification: Notification, action: NotificationAction) => {
    // Publish desktop event for action
    publish("NOTIFICATION_ACTION_CLICKED", {
      notificationId: notification.id,
      actionId: action.actionId,
    });

    // Execute configured action handler if available
    const actionHandler = finDesktopConfig.notificationActions?.[action.actionId];
    if (actionHandler) {
      try {
        actionHandler(notification, action);
      } catch (error) {
        console.error(`Error executing notification action ${action.actionId}:`, error);
      }
    } else {
      console.warn(`No handler configured for notification action: ${action.actionId}`);
    }

    // Dismiss the notification after action
    handleDismiss(notification.id);
  };

  return (
    <div className="notification-tray">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification-toast notification-${notification.type}`}
        >
          <div className="notification-header">
            <h4 className="notification-title">{notification.title}</h4>
            <button
              className="notification-close"
              onClick={() => handleDismiss(notification.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
          <p className="notification-message">{notification.message}</p>
          {notification.actions && notification.actions.length > 0 && (
            <div className="notification-actions">
              {notification.actions.map((action) => (
                <button
                  key={action.actionId}
                  className="notification-action-button"
                  onClick={() => handleActionClick(notification, action)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
