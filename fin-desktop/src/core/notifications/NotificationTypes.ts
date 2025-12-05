/**
 * Core notification types for FinDesktop Notification Center
 */

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationAction {
  label: string;
  actionId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  actions?: NotificationAction[];
}
