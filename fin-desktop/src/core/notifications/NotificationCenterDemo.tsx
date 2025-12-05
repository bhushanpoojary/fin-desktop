/**
 * Notification Center - Demo/Test Page
 * 
 * A standalone demo page to test and showcase the notification system.
 * This can be used for manual testing or as a demo for stakeholders.
 */

import React from 'react';
import { NotificationTray } from '../../ui/NotificationTray';
import { notificationCenter } from './NotificationCenter';
import type { NotificationType } from './NotificationTypes';

export function NotificationCenterDemo() {
  const [notificationCount, setNotificationCount] = React.useState(0);

  const showNotification = (
    type: NotificationType,
    title: string,
    message: string,
    withActions: boolean = false
  ) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    
    notificationCenter.show({
      id,
      type,
      title,
      message,
      actions: withActions ? [
        { label: 'Primary Action', actionId: 'VIEW_DETAILS' },
        { label: 'Secondary', actionId: 'DISMISS' },
      ] : undefined,
    });

    setNotificationCount((prev) => prev + 1);
  };

  const showMultipleNotifications = () => {
    const types: NotificationType[] = ['info', 'success', 'warning', 'error'];
    types.forEach((type, index) => {
      setTimeout(() => {
        showNotification(
          type,
          `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
          `This is a ${type} notification message with some additional details.`
        );
      }, index * 300);
    });
  };

  const showRealWorldExamples = () => {
    // Trade execution
    setTimeout(() => {
      notificationCenter.show({
        id: `trade-${Date.now()}`,
        type: 'success',
        title: 'Trade Executed',
        message: 'AAPL x 100 shares @ $150.00 - Order #12345',
        actions: [
          { label: 'View Trade', actionId: 'VIEW_TRADE_DETAILS' },
          { label: 'Open Blotter', actionId: 'OPEN_ORDER_TICKET' },
        ],
      });
    }, 0);

    // Price alert
    setTimeout(() => {
      notificationCenter.show({
        id: `alert-${Date.now()}`,
        type: 'warning',
        title: 'Price Alert',
        message: 'AAPL has reached your target price of $150.00',
        actions: [
          { label: 'View Chart', actionId: 'OPEN_CHART' },
          { label: 'Acknowledge', actionId: 'ACKNOWLEDGE_ALERT' },
        ],
      });
    }, 500);

    // System update
    setTimeout(() => {
      notificationCenter.show({
        id: `system-${Date.now()}`,
        type: 'info',
        title: 'System Update Available',
        message: 'A new version is available. Please restart to update.',
      });
    }, 1000);

    // Error
    setTimeout(() => {
      notificationCenter.show({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Connection Lost',
        message: 'Unable to connect to market data feed. Retrying...',
        actions: [
          { label: 'Retry Now', actionId: 'RETRY_CONNECTION' },
          { label: 'Contact Support', actionId: 'CONTACT_SUPPORT' },
        ],
      });
    }, 1500);
  };

  const clearHistory = () => {
    notificationCenter.clearHistory();
    setNotificationCount(0);
  };

  const viewHistory = () => {
    const history = notificationCenter.getHistory();
    console.log('Notification History:', history);
    alert(`View console for ${history.length} notifications in history`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>🔔 Notification Center Demo</h1>
        <p style={styles.subtitle}>
          Test and showcase the FinDesktop notification system
        </p>
        <p style={styles.info}>
          Total notifications shown: <strong>{notificationCount}</strong>
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Notifications</h2>
          <div style={styles.buttonGrid}>
            <button
              style={{ ...styles.button, ...styles.infoButton }}
              onClick={() => showNotification('info', 'Information', 'This is an info notification')}
            >
              Show Info
            </button>
            <button
              style={{ ...styles.button, ...styles.successButton }}
              onClick={() => showNotification('success', 'Success', 'Operation completed successfully')}
            >
              Show Success
            </button>
            <button
              style={{ ...styles.button, ...styles.warningButton }}
              onClick={() => showNotification('warning', 'Warning', 'Please review this warning')}
            >
              Show Warning
            </button>
            <button
              style={{ ...styles.button, ...styles.errorButton }}
              onClick={() => showNotification('error', 'Error', 'An error occurred')}
            >
              Show Error
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Notifications with Actions</h2>
          <div style={styles.buttonGrid}>
            <button
              style={{ ...styles.button, ...styles.infoButton }}
              onClick={() => showNotification('info', 'Info with Actions', 'Click a button below', true)}
            >
              Info + Actions
            </button>
            <button
              style={{ ...styles.button, ...styles.successButton }}
              onClick={() => showNotification('success', 'Success with Actions', 'Choose an action', true)}
            >
              Success + Actions
            </button>
            <button
              style={{ ...styles.button, ...styles.warningButton }}
              onClick={() => showNotification('warning', 'Warning with Actions', 'Take action now', true)}
            >
              Warning + Actions
            </button>
            <button
              style={{ ...styles.button, ...styles.errorButton }}
              onClick={() => showNotification('error', 'Error with Actions', 'Error requires action', true)}
            >
              Error + Actions
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Real-World Examples</h2>
          <div style={styles.buttonGrid}>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={showRealWorldExamples}
            >
              Show Real-World Scenarios
            </button>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={showMultipleNotifications}
            >
              Show Multiple Notifications
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>History Management</h2>
          <div style={styles.buttonGrid}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={viewHistory}
            >
              View History (Console)
            </button>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={clearHistory}
            >
              Clear History
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Features</h2>
          <ul style={styles.featureList}>
            <li>✅ 4 notification types: info, success, warning, error</li>
            <li>✅ Bottom-right toast positioning with slide-in animation</li>
            <li>✅ Optional action buttons with configurable callbacks</li>
            <li>✅ Auto-dismiss after 5 seconds (notifications without actions)</li>
            <li>✅ Manual dismiss via close button</li>
            <li>✅ Desktop event integration (NOTIFICATION_ACTION_CLICKED)</li>
            <li>✅ Notification history tracking</li>
            <li>✅ Extensible action handler configuration</li>
          </ul>
        </div>
      </div>

      {/* NotificationTray component */}
      <NotificationTray />
    </div>
  );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '16px',
  },
  info: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    borderLeft: '4px solid #2196f3',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  button: {
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'white',
  },
  infoButton: {
    backgroundColor: '#2196f3',
  },
  successButton: {
    backgroundColor: '#4caf50',
  },
  warningButton: {
    backgroundColor: '#ff9800',
  },
  errorButton: {
    backgroundColor: '#f44336',
  },
  primaryButton: {
    backgroundColor: '#673ab7',
  },
  secondaryButton: {
    backgroundColor: '#607d8b',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
};

// Add hover styles via CSS-in-JS is limited, but we can add a global style
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    button:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(styleSheet);
}
