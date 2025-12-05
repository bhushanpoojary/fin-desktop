/**
 * Notification Center - Integration Example
 * 
 * This file demonstrates how to integrate the Notification Center
 * into your FinDesktop application.
 */

import React from 'react';
import { NotificationTray } from '../../ui/NotificationTray';
import { notificationCenter } from './index';

/**
 * Example 1: Add NotificationTray to your main App component
 */
export function AppWithNotifications() {
  return (
    <div className="app">
      {/* Your app content */}
      <main>
        <h1>FinDesktop Application</h1>
        {/* ... other components ... */}
      </main>

      {/* Add NotificationTray at the root level */}
      <NotificationTray />
    </div>
  );
}

/**
 * Example 2: Showing notifications from anywhere in your app
 */
export function ExampleComponent() {
  const handleShowInfoNotification = () => {
    notificationCenter.show({
      id: crypto.randomUUID(),
      type: "info",
      title: "Information",
      message: "This is an informational notification.",
    });
  };

  const handleShowSuccessNotification = () => {
    notificationCenter.show({
      id: crypto.randomUUID(),
      type: "success",
      title: "Success!",
      message: "Operation completed successfully.",
    });
  };

  const handleShowWarningNotification = () => {
    notificationCenter.show({
      id: crypto.randomUUID(),
      type: "warning",
      title: "Warning",
      message: "Please review this important information.",
      actions: [
        { label: "View Details", actionId: "VIEW_DETAILS" },
        { label: "Dismiss", actionId: "DISMISS" },
      ],
    });
  };

  const handleShowErrorNotification = () => {
    notificationCenter.show({
      id: crypto.randomUUID(),
      type: "error",
      title: "Error",
      message: "An error occurred. Please try again.",
      actions: [
        { label: "Retry", actionId: "RETRY_CONNECTION" },
        { label: "Contact Support", actionId: "CONTACT_SUPPORT" },
      ],
    });
  };

  return (
    <div>
      <h2>Notification Examples</h2>
      <button onClick={handleShowInfoNotification}>Show Info</button>
      <button onClick={handleShowSuccessNotification}>Show Success</button>
      <button onClick={handleShowWarningNotification}>Show Warning</button>
      <button onClick={handleShowErrorNotification}>Show Error</button>
    </div>
  );
}

/**
 * Example 3: Trade execution notification
 */
export function showTradeExecutionNotification(trade: {
  symbol: string;
  quantity: number;
  price: number;
  orderId: string;
}) {
  notificationCenter.show({
    id: crypto.randomUUID(),
    type: "success",
    title: "Trade Executed",
    message: `${trade.symbol} x ${trade.quantity} shares @ $${trade.price.toFixed(2)}`,
    actions: [
      { label: "View Trade", actionId: "VIEW_TRADE_DETAILS" },
      { label: "Open Blotter", actionId: "OPEN_ORDER_TICKET" },
    ],
  });
}

/**
 * Example 4: Market alert notification
 */
export function showMarketAlertNotification(alert: {
  symbol: string;
  condition: string;
  value: number;
}) {
  notificationCenter.show({
    id: crypto.randomUUID(),
    type: "warning",
    title: "Price Alert",
    message: `${alert.symbol} ${alert.condition} $${alert.value.toFixed(2)}`,
    actions: [
      { label: "View Chart", actionId: "OPEN_CHART" },
      { label: "Acknowledge", actionId: "ACKNOWLEDGE_ALERT" },
    ],
  });
}

/**
 * Example 5: System notification
 */
export function showSystemNotification(message: string, type: "info" | "error" = "info") {
  notificationCenter.show({
    id: crypto.randomUUID(),
    type,
    title: "System",
    message,
  });
}

/**
 * Example 6: Notification with custom action handling
 */
export function showApprovalRequestNotification(request: {
  id: string;
  type: string;
  description: string;
}) {
  notificationCenter.show({
    id: request.id,
    type: "info",
    title: "Approval Required",
    message: `${request.type}: ${request.description}`,
    actions: [
      { label: "Approve", actionId: "APPROVE_REQUEST" },
      { label: "Reject", actionId: "REJECT_REQUEST" },
    ],
  });
}

/**
 * Example 7: Using notification history
 */
export function NotificationHistoryViewer() {
  const [history, setHistory] = React.useState<any[]>([]);

  const loadHistory = () => {
    const allNotifications = notificationCenter.getHistory();
    setHistory(allNotifications);
  };

  const clearHistory = () => {
    notificationCenter.clearHistory();
    setHistory([]);
  };

  return (
    <div>
      <h2>Notification History</h2>
      <button onClick={loadHistory}>Load History</button>
      <button onClick={clearHistory}>Clear History</button>
      <ul>
        {history.map((notification) => (
          <li key={notification.id}>
            [{notification.type}] {notification.title}: {notification.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 8: Integration with desktop events
 */
export function useNotificationActionHandler() {
  React.useEffect(() => {
    // Subscribe to notification action events
    const handleActionClicked = (payload: any) => {
      console.log('Notification action clicked:', payload);
      
      // You can handle specific actions here if needed
      switch (payload.actionId) {
        case 'OPEN_CHART':
          console.log('Opening chart for notification:', payload.notificationId);
          break;
        case 'VIEW_TRADE_DETAILS':
          console.log('Viewing trade details:', payload.notificationId);
          break;
        // ... other cases
      }
    };

    // Subscribe to desktop event
    const unsubscribe = window.desktopApi?.subscribe?.(
      'NOTIFICATION_ACTION_CLICKED',
      handleActionClicked
    );

    return () => {
      unsubscribe?.();
    };
  }, []);
}
