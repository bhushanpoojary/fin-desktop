# Notification Center

A configurable notification system for FinDesktop with toast notifications, action buttons, and extensible handlers.

## Features

- 📢 **Event-based notification service** - Centralized notification management
- 🎨 **Styled toast notifications** - Bottom-right slide-in toasts with type variants (info, success, warning, error)
- 🔘 **Action buttons** - Configurable buttons with custom callbacks
- 🔧 **Extensible configuration** - Override action handlers in `/extensions`
- 📊 **Notification history** - Track and retrieve past notifications
- 🎯 **Desktop event integration** - Publishes `NOTIFICATION_ACTION_CLICKED` events

## Quick Start

### 1. Import the NotificationTray Component

Add `NotificationTray` to your main application layout:

```tsx
import { NotificationTray } from './ui/NotificationTray';

function App() {
  return (
    <div>
      {/* Your app content */}
      <NotificationTray />
    </div>
  );
}
```

### 2. Show a Notification

```tsx
import { notificationCenter } from './core/notifications';

// Simple notification
notificationCenter.show({
  id: crypto.randomUUID(),
  type: "info",
  title: "Welcome",
  message: "Welcome to FinDesktop!",
});

// Notification with actions
notificationCenter.show({
  id: crypto.randomUUID(),
  type: "success",
  title: "Trade Executed",
  message: "AAPL x 100 shares @ $150.00",
  actions: [
    { label: "View Details", actionId: "VIEW_TRADE_DETAILS" },
    { label: "Dismiss", actionId: "DISMISS" },
  ],
});
```

## Architecture

### Core Components

```
src/core/notifications/
├── NotificationTypes.ts      # TypeScript type definitions
├── NotificationCenter.ts     # Event-based notification service
└── index.ts                  # Module exports

src/ui/
├── NotificationTray.tsx      # React toast component
├── NotificationTray.css      # Toast styling
└── index.ts                  # Module exports

src/config/
└── FinDesktopConfig.ts       # Action handler configuration

src/extensions/
└── NotificationActions.config.ts  # Custom action handlers
```

### NotificationCenter API

The `NotificationCenter` is a singleton service that manages notifications.

#### Methods

##### `show(notification: Notification): void`

Display a notification to all subscribers.

```tsx
notificationCenter.show({
  id: "notif-123",
  type: "warning",
  title: "Price Alert",
  message: "AAPL reached $150.00",
  actions: [
    { label: "Open Chart", actionId: "OPEN_CHART" },
  ],
});
```

##### `onNotification(callback: (notification: Notification) => void): () => void`

Subscribe to notifications. Returns an unsubscribe function.

```tsx
const unsubscribe = notificationCenter.onNotification((notification) => {
  console.log("New notification:", notification);
});

// Later: unsubscribe()
```

##### `getHistory(): Notification[]`

Get all notifications from history.

```tsx
const history = notificationCenter.getHistory();
console.log("Past notifications:", history);
```

##### `clearHistory(): void`

Clear notification history.

```tsx
notificationCenter.clearHistory();
```

## Notification Types

```typescript
export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationAction {
  label: string;      // Button text
  actionId: string;   // Handler identifier
}

export interface Notification {
  id: string;                        // Unique identifier
  title: string;                     // Notification title
  message: string;                   // Notification body text
  type: NotificationType;            // Visual style variant
  actions?: NotificationAction[];    // Optional action buttons
}
```

## Configuration

### Default Action Handlers

Default handlers are defined in `src/config/FinDesktopConfig.ts`:

```typescript
export const DefaultNotificationActions: NotificationActionsMap = {
  "DISMISS": (notification) => {
    console.log("Notification dismissed:", notification.id);
  },
  "VIEW_DETAILS": (notification) => {
    console.log("View details for notification:", notification.id);
  },
};
```

### Custom Action Handlers

Override handlers in `src/extensions/NotificationActions.config.ts`:

```typescript
import type { NotificationActionsMap } from "../config/FinDesktopConfig";

export const CustomNotificationActions: NotificationActionsMap = {
  "OPEN_ORDER_TICKET": (notification, action) => {
    // Open order ticket window
    window.desktopApi?.openApp("order-ticket");
  },
  
  "ACKNOWLEDGE_ALERT": (notification, action) => {
    // Mark alert as acknowledged
    fetch('/api/alerts/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertId: notification.id }),
    });
  },
};
```

### Wire Up Custom Handlers

In `src/config/FinDesktopConfig.ts`:

```typescript
import { CustomNotificationActions } from '../extensions/NotificationActions.config';

export const finDesktopConfig: FinDesktopConfig = {
  // ... other config
  notificationActions: CustomNotificationActions,
  
  // Or merge with defaults:
  // notificationActions: {
  //   ...DefaultNotificationActions,
  //   ...CustomNotificationActions,
  // },
};
```

## UI Behavior

### Toast Display

- Notifications appear in the **bottom-right** corner
- Stack vertically with 12px gap
- Slide in from the right with smooth animation
- Each toast shows title, message, and optional action buttons

### Auto-dismiss

- Notifications **without actions** auto-dismiss after **5 seconds**
- Notifications **with actions** remain until user interacts
- Users can manually dismiss any notification via the close button (×)

### Type Variants

Visual styling based on notification type:

| Type      | Color  | Use Case                    |
|-----------|--------|-----------------------------|
| `info`    | Blue   | General information         |
| `success` | Green  | Successful operations       |
| `warning` | Orange | Warnings and alerts         |
| `error`   | Red    | Errors and critical issues  |

### Action Buttons

- Primary styled buttons below the message
- Click triggers both:
  1. Desktop event: `NOTIFICATION_ACTION_CLICKED`
  2. Configured action handler
- Notification auto-dismisses after action click

## Desktop Events

When an action button is clicked, the system publishes a desktop event:

```typescript
// Event topic
"NOTIFICATION_ACTION_CLICKED"

// Event payload
{
  notificationId: string,  // Notification ID
  actionId: string,        // Action identifier
}
```

Subscribe to these events:

```tsx
import { useDesktopApi } from './shared/hooks/useDesktopApi';

function MyComponent() {
  const { subscribe } = useDesktopApi();

  useEffect(() => {
    const unsubscribe = subscribe("NOTIFICATION_ACTION_CLICKED", (payload) => {
      console.log("Action clicked:", payload);
    });
    return unsubscribe;
  }, []);
}
```

## Examples

### Market Data Alert

```tsx
notificationCenter.show({
  id: crypto.randomUUID(),
  type: "warning",
  title: "Price Alert",
  message: "AAPL has reached your target price of $150.00",
  actions: [
    { label: "Open Chart", actionId: "OPEN_CHART" },
    { label: "Open Order Ticket", actionId: "OPEN_ORDER_TICKET" },
    { label: "Dismiss", actionId: "DISMISS" },
  ],
});
```

### Trade Execution

```tsx
notificationCenter.show({
  id: crypto.randomUUID(),
  type: "success",
  title: "Trade Executed",
  message: "Buy 100 AAPL @ $150.00 - Order #12345",
  actions: [
    { label: "View Details", actionId: "VIEW_TRADE_DETAILS" },
  ],
});
```

### System Error

```tsx
notificationCenter.show({
  id: crypto.randomUUID(),
  type: "error",
  title: "Connection Lost",
  message: "Unable to connect to market data feed. Retrying...",
  actions: [
    { label: "Retry Now", actionId: "RETRY_CONNECTION" },
    { label: "Contact Support", actionId: "CONTACT_SUPPORT" },
  ],
});
```

### Simple Info

```tsx
notificationCenter.show({
  id: crypto.randomUUID(),
  type: "info",
  title: "System Update",
  message: "A new version is available. Please restart to update.",
});
// No actions = auto-dismisses after 5 seconds
```

## Styling Customization

The notification tray uses CSS variables for easy theming:

```css
.notification-toast {
  background: var(--color-surface, #ffffff);
  color: var(--color-text-primary, #000000);
}

.notification-action-button {
  background-color: var(--color-primary, #2196f3);
}
```

Override in your `theme.css`:

```css
:root {
  --color-surface: #1e1e1e;
  --color-text-primary: #ffffff;
  --color-primary: #007acc;
}
```

## Advanced Usage

### Programmatic Dismiss

Store notification IDs and dismiss programmatically:

```tsx
const notificationId = crypto.randomUUID();

notificationCenter.show({
  id: notificationId,
  type: "info",
  title: "Processing",
  message: "Please wait...",
});

// Later: dismiss by publishing an event or implementing custom logic
```

### Notification with Metadata

Extend notifications with custom metadata:

```tsx
interface CustomNotification extends Notification {
  metadata?: {
    tradeId?: string;
    instrument?: string;
    [key: string]: any;
  };
}

notificationCenter.show({
  id: crypto.randomUUID(),
  type: "success",
  title: "Trade Complete",
  message: "Order executed",
  actions: [{ label: "View", actionId: "VIEW_TRADE_DETAILS" }],
  metadata: {
    tradeId: "TRD-12345",
    instrument: "AAPL",
  },
} as CustomNotification);

// Handler can access metadata
"VIEW_TRADE_DETAILS": (notification, action) => {
  const metadata = (notification as CustomNotification).metadata;
  console.log("Trade ID:", metadata?.tradeId);
}
```

## Testing

### Manual Testing

```tsx
// Show test notification
import { notificationCenter } from './core/notifications';

notificationCenter.show({
  id: "test-1",
  type: "info",
  title: "Test Notification",
  message: "This is a test",
  actions: [
    { label: "Action 1", actionId: "TEST_ACTION_1" },
    { label: "Action 2", actionId: "TEST_ACTION_2" },
  ],
});
```

### Unit Testing

```typescript
import { notificationCenter } from './core/notifications/NotificationCenter';

describe('NotificationCenter', () => {
  it('should notify subscribers', () => {
    const callback = jest.fn();
    const unsubscribe = notificationCenter.onNotification(callback);

    notificationCenter.show({
      id: 'test',
      type: 'info',
      title: 'Test',
      message: 'Test message',
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test' })
    );

    unsubscribe();
  });
});
```

## Troubleshooting

### Actions Not Working

1. Check that handler is registered in `FinDesktopConfig.notificationActions`
2. Verify `actionId` matches between notification and handler map
3. Check browser console for warnings about missing handlers

### Toasts Not Appearing

1. Ensure `<NotificationTray />` is rendered in your component tree
2. Check that notifications have unique IDs
3. Verify CSS is loaded (check for `.notification-tray` styles)

### Styling Issues

1. Check CSS variables are defined in your theme
2. Verify `NotificationTray.css` is imported
3. Check z-index conflicts (default: 9999)

## Future Enhancements

Potential improvements:

- 🔔 **Sound notifications** - Audio alerts for important notifications
- 📍 **Position customization** - Top/bottom, left/right positioning
- ⏱️ **Custom timeouts** - Per-notification auto-dismiss timing
- 📦 **Notification queue** - Limit concurrent toasts
- 💾 **Persistence** - Save/restore notification history
- 🎭 **Animation options** - Configurable animation styles
- 📱 **Responsive design** - Mobile-optimized layouts

## API Reference Summary

### NotificationCenter

| Method | Description | Returns |
|--------|-------------|---------|
| `show(notification)` | Display a notification | `void` |
| `onNotification(callback)` | Subscribe to notifications | `() => void` (unsubscribe) |
| `getHistory()` | Get notification history | `Notification[]` |
| `clearHistory()` | Clear history | `void` |

### Types

```typescript
type NotificationType = "info" | "success" | "warning" | "error";
type NotificationActionHandler = (notification: Notification, action: NotificationAction) => void;

interface NotificationAction {
  label: string;
  actionId: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  actions?: NotificationAction[];
}

interface NotificationActionsMap {
  [actionId: string]: NotificationActionHandler;
}
```

## License

Part of the FinDesktop framework.
