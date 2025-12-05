/**
 * Custom Notification Actions Configuration
 * 
 * This file demonstrates how to override notification action handlers
 * in the FinDesktop extensions folder.
 * 
 * Usage:
 * 1. Import this file in src/config/FinDesktopConfig.ts
 * 2. Use it to override the default notificationActions:
 * 
 *    import { CustomNotificationActions } from '../extensions/NotificationActions.config';
 *    
 *    export const finDesktopConfig: FinDesktopConfig = {
 *      // ... other config
 *      notificationActions: CustomNotificationActions,
 *    };
 * 
 * 3. Or merge with defaults:
 * 
 *    notificationActions: {
 *      ...DefaultNotificationActions,
 *      ...CustomNotificationActions,
 *    },
 */

import type { NotificationActionsMap } from "../config/FinDesktopConfig";
import type { Notification, NotificationAction } from "../core/notifications/NotificationTypes";

/**
 * Custom Notification Action Handlers
 * 
 * Add your application-specific notification actions here.
 */
export const CustomNotificationActions: NotificationActionsMap = {
  /**
   * Open Order Ticket
   * Opens the order ticket window when user clicks the action button
   */
  "OPEN_ORDER_TICKET": (notification: Notification, _action: NotificationAction) => {
    console.log("Opening order ticket from notification:", notification.id);
    
    // Example: Open order ticket window
    // window.desktopApi?.openApp("order-ticket");
    
    // Example: Parse instrument from notification metadata
    // const instrument = (notification as any).metadata?.instrument;
    // if (instrument) {
    //   window.desktopApi?.publish("INSTRUMENT_SELECTED", { instrument });
    // }
  },

  /**
   * Acknowledge Alert
   * Marks an alert as acknowledged in your alert management system
   */
  "ACKNOWLEDGE_ALERT": (notification: Notification, _action: NotificationAction) => {
    console.log("Acknowledging alert:", notification.id);
    
    // Example: Call your API to mark alert as read
    // fetch('/api/alerts/acknowledge', {
    //   method: 'POST',
    //   body: JSON.stringify({ alertId: notification.id }),
    // });
  },

  /**
   * View Trade Details
   * Opens detailed view of a trade execution
   */
  "VIEW_TRADE_DETAILS": (notification: Notification, _action: NotificationAction) => {
    console.log("Viewing trade details:", notification.id);
    
    // Example: Open trade blotter filtered to this trade
    // const tradeId = (notification as any).metadata?.tradeId;
    // window.desktopApi?.openApp("trade-blotter", { tradeId });
  },

  /**
   * Snooze Reminder
   * Snoozes a reminder notification for a specified time
   */
  "SNOOZE_REMINDER": (notification: Notification, _action: NotificationAction) => {
    console.log("Snoozing reminder:", notification.id);
    
    // Example: Re-schedule the notification
    // const snoozeMinutes = 5;
    // setTimeout(() => {
    //   notificationCenter.show(notification);
    // }, snoozeMinutes * 60 * 1000);
  },

  /**
   * Approve Request
   * Approves a pending request (workflow, trade, etc.)
   */
  "APPROVE_REQUEST": (notification: Notification, _action: NotificationAction) => {
    console.log("Approving request:", notification.id);
    
    // Example: Call approval API
    // const requestId = (notification as any).metadata?.requestId;
    // fetch('/api/requests/approve', {
    //   method: 'POST',
    //   body: JSON.stringify({ requestId }),
    // });
  },

  /**
   * Reject Request
   * Rejects a pending request
   */
  "REJECT_REQUEST": (notification: Notification, _action: NotificationAction) => {
    console.log("Rejecting request:", notification.id);
    
    // Example: Call rejection API
    // const requestId = (notification as any).metadata?.requestId;
    // fetch('/api/requests/reject', {
    //   method: 'POST',
    //   body: JSON.stringify({ requestId }),
    // });
  },

  /**
   * Contact Support
   * Opens support chat or email client
   */
  "CONTACT_SUPPORT": (notification: Notification, _action: NotificationAction) => {
    console.log("Opening support for notification:", notification.id);
    
    // Example: Open support window with context
    // window.desktopApi?.openApp("support-chat", {
    //   context: notification.message,
    //   notificationId: notification.id,
    // });
  },
};

/**
 * Example: How to use custom actions when showing a notification
 * 
 * import { notificationCenter } from '../core/notifications/NotificationCenter';
 * 
 * notificationCenter.show({
 *   id: crypto.randomUUID(),
 *   type: "info",
 *   title: "New Trade Execution",
 *   message: "AAPL x 100 shares @ $150.00",
 *   actions: [
 *     { label: "View Details", actionId: "VIEW_TRADE_DETAILS" },
 *     { label: "Dismiss", actionId: "DISMISS" },
 *   ],
 * });
 */
