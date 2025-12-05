# Channels API

Finsemble-style inter-app communication channels for FinDesktop.

## Overview

The Channels API provides named, colored channels that windows/apps can join to receive broadcasts scoped to that channel. This is similar to Finsemble's channel system and enables loose coupling between applications.

## Key Concepts

- **Channel**: A named communication bus with a visual color (e.g., "Red", "Green", "Orders")
- **Join/Leave**: Windows explicitly join channels to receive broadcasts
- **Broadcast**: Send data to all windows on a specific channel
- **Scoped**: Only windows on a channel receive its broadcasts

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Desktop Event Bus                     │
│                  (window.desktopApi)                     │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
┌──────────────────────────┼──────────────────────────────┐
│                    ChannelService                        │
│  • Loads channel config                                  │
│  • Tracks window → channel mappings                      │
│  • Publishes/subscribes via event bus                    │
│  • Filters broadcasts by channel                         │
└──────────────────────────────────────────────────────────┘
                           ▲
                           │
            ┌──────────────┴──────────────┐
            │                             │
┌───────────┴───────────┐   ┌─────────────┴─────────────┐
│   ChannelContext      │   │     ChannelPicker UI      │
│   (React Provider)    │   │   (Colored pill buttons)  │
│   • useChannels()     │   │                           │
│   • useChannelBroadcasts() │                          │
└───────────────────────┘   └───────────────────────────┘
```

## Quick Start

### 1. Define Your Channels

Edit `src/config/channels.config.ts`:

```typescript
export const channelConfig: ChannelConfig[] = [
  { id: "red", name: "Red", color: "#ff4d4f" },
  { id: "green", name: "Green", color: "#52c41a" },
  { id: "blue", name: "Blue", color: "#1890ff" },
  // Add your custom channels:
  { id: "orders", name: "Orders", color: "#faad14" },
];
```

### 2. Wrap Your App with ChannelProvider

```tsx
import { ChannelProvider } from './core/channels';

function App() {
  const windowId = "window-1"; // Get from your app context
  
  return (
    <ChannelProvider windowId={windowId}>
      <YourApp />
    </ChannelProvider>
  );
}
```

### 3. Add the ChannelPicker UI

```tsx
import { useChannels } from './core/channels';
import { ChannelPicker } from './ui';

function AppHeader() {
  const { activeChannelId, channelService } = useChannels();
  const windowId = "window-1"; // Same as provider
  
  return (
    <header>
      <h1>My App</h1>
      <ChannelPicker
        windowId={windowId}
        channelService={channelService}
        activeChannelId={activeChannelId}
      />
    </header>
  );
}
```

### 4. Send Data on a Channel

```tsx
import { useChannels } from './core/channels';

function InstrumentSelector() {
  const { activeChannelId, broadcast } = useChannels();
  
  const handleSelectInstrument = (ticker: string) => {
    if (activeChannelId) {
      broadcast(activeChannelId, {
        type: "fdc3.instrument",
        id: { ticker },
      });
    }
  };
  
  return (
    <button onClick={() => handleSelectInstrument("AAPL")}>
      Select AAPL
    </button>
  );
}
```

### 5. Receive Data from a Channel

```tsx
import { useChannelBroadcasts } from './core/channels';

function InstrumentViewer() {
  const [instrument, setInstrument] = useState(null);
  
  useChannelBroadcasts((event) => {
    if (event.context.type === "fdc3.instrument") {
      setInstrument(event.context.id);
    }
  });
  
  return (
    <div>
      Current Instrument: {instrument?.ticker || "None"}
    </div>
  );
}
```

## API Reference

### ChannelService

Core service for channel management.

```typescript
const channelService = new ChannelService();

// Get available channels
const channels = channelService.getChannels();

// Join a channel
channelService.joinChannel("window-1", "red");

// Broadcast to a channel
channelService.broadcast("red", { type: "instrument", id: { ticker: "AAPL" } });

// Leave a channel
channelService.leaveChannel("window-1");

// Subscribe to broadcasts
const unsubscribe = channelService.subscribeToBroadcasts("window-1", (event) => {
  console.log("Received:", event.context);
});
```

### React Hooks

#### useChannels()

Access channel context and operations.

```typescript
const {
  activeChannelId,    // Current channel ID or null
  channels,           // All available channels
  joinChannel,        // (channelId: string) => void
  leaveChannel,       // () => void
  broadcast,          // (channelId: string, context: any) => void
  getChannel,         // (channelId: string) => Channel | undefined
} = useChannels();
```

#### useChannelBroadcasts()

Listen for broadcasts on the current window's channel.

```typescript
useChannelBroadcasts((event: ChannelBroadcastEvent) => {
  console.log("Channel:", event.channelId);
  console.log("Context:", event.context);
  console.log("Sender:", event.sender?.windowId);
});
```

#### useActiveChannel()

Get the current channel object (not just the ID).

```typescript
const activeChannel = useActiveChannel();
// { id: "red", name: "Red", color: "#ff4d4f" } or null
```

#### useChannelMembers()

Get all windows on a specific channel.

```typescript
const members = useChannelMembers("red");
// ["window-1", "window-2", "window-3"]
```

### UI Components

#### ChannelPicker

Pill-style channel selector.

```tsx
<ChannelPicker
  windowId="window-1"
  channelService={channelService}
  activeChannelId={activeChannelId}
  onChannelChanged={(id) => console.log("Changed to:", id)}
  size="medium"           // "small" | "medium" | "large"
  showLabels={true}       // Show channel names
  className="my-picker"
/>
```

#### ChannelPickerDropdown

Dropdown variant for limited space.

```tsx
<ChannelPickerDropdown
  windowId="window-1"
  channelService={channelService}
  activeChannelId={activeChannelId}
  onChannelChanged={(id) => console.log("Changed to:", id)}
/>
```

## Events

The channel system publishes events on the desktop event bus:

### CHANNEL_JOINED

Fired when a window joins a channel.

```typescript
{
  type: "CHANNEL_JOINED",
  payload: {
    windowId: "window-1",
    channelId: "red",
    timestamp: 1234567890
  }
}
```

### CHANNEL_LEFT

Fired when a window leaves a channel.

```typescript
{
  type: "CHANNEL_LEFT",
  payload: {
    windowId: "window-1",
    channelId: "red",
    timestamp: 1234567890
  }
}
```

### CHANNEL_BROADCAST

Fired when data is broadcast to a channel.

```typescript
{
  type: "CHANNEL_BROADCAST",
  payload: {
    channelId: "red",
    windowId: "window-1",    // Target window
    context: { ... },         // Broadcast data
    sender: {
      windowId: "window-2"   // Sender window
    },
    timestamp: 1234567890
  }
}
```

## Configuration

### Adding Custom Channels

Edit `src/config/channels.config.ts`:

```typescript
export const channelConfig: ChannelConfig[] = [
  // Standard color channels
  { id: "red", name: "Red", color: "#ff4d4f" },
  { id: "green", name: "Green", color: "#52c41a" },
  
  // Business-specific channels
  { id: "orders", name: "Order Desk", color: "#faad14" },
  { id: "positions", name: "Positions", color: "#13c2c2" },
  
  // Team channels
  { id: "trading-desk-1", name: "Trading Desk 1", color: "#722ed1" },
  { id: "trading-desk-2", name: "Trading Desk 2", color: "#eb2f96" },
];
```

### Channel Configuration Rules

- **id**: Unique identifier (alphanumeric, hyphens, underscores)
- **name**: Display name shown in UI
- **color**: Any valid CSS color (hex, rgb, named)

### Validation

Channel config is validated at runtime:

```typescript
import { validateChannelConfig } from '../config/channels.config';

// Throws error if config is invalid
validateChannelConfig();
```

## Integration with FDC3

Channels work seamlessly with FDC3 context types:

```typescript
// Send FDC3 instrument context
broadcast("red", {
  type: "fdc3.instrument",
  id: { ticker: "AAPL" }
});

// Send FDC3 contact context
broadcast("green", {
  type: "fdc3.contact",
  name: "John Doe",
  id: { email: "john@example.com" }
});
```

## Best Practices

### 1. Use Descriptive Channel IDs

```typescript
// Good
{ id: "orders", name: "Order Desk", color: "#faad14" }

// Avoid
{ id: "ch1", name: "Channel 1", color: "#ff0000" }
```

### 2. Keep Channel Count Manageable

5-10 channels is typical. Too many channels reduce usability.

### 3. Use Consistent Colors

Choose visually distinct colors that are easy to identify at a glance.

### 4. Document Your Channel Schema

If using business-specific channels, document what data flows on each:

```typescript
// ORDERS channel: Order ticket context
// Expected format: { type: "order", symbol: string, quantity: number }

// POSITIONS channel: Position updates
// Expected format: { type: "position", symbol: string, pnl: number }
```

### 5. Handle Missing Channels Gracefully

```typescript
const { activeChannelId, broadcast } = useChannels();

const handleSend = () => {
  if (!activeChannelId) {
    toast.warn("Please select a channel first");
    return;
  }
  broadcast(activeChannelId, data);
};
```

## Troubleshooting

### Broadcasts not received

- Check that both windows are on the same channel
- Verify windowId is consistent and unique
- Check browser console for errors

### Channel changes not reflected in UI

- Ensure you're using `onChannelChanged` callback
- Check that ChannelProvider wraps your components
- Verify activeChannelId is passed correctly

### TypeScript errors

- Make sure to import types from `'./core/channels'`
- Check that window.desktopApi is properly typed in `shared/desktopApi.ts`

## Examples

See `src/apps/` for example implementations:

- `InstrumentSourceApp.tsx` - Broadcasts instrument data
- `InstrumentTargetApp.tsx` - Receives instrument data
- `OrderTicketApp.tsx` - Bidirectional channel communication

## Testing

```typescript
import { ChannelService } from './core/channels/ChannelService';

describe('ChannelService', () => {
  it('should track channel membership', () => {
    const service = new ChannelService();
    service.joinChannel('window-1', 'red');
    
    expect(service.getWindowChannel('window-1')).toBe('red');
    expect(service.getChannelMembers('red')).toContain('window-1');
  });
});
```

## Migration from DefaultChannelProvider

If you were using the old `DefaultChannelProvider`, migration is straightforward:

**Before:**
```typescript
const channelProvider = new DefaultChannelProvider();
await channelProvider.initialize();
await channelProvider.joinChannel('red');
await channelProvider.broadcast('red', context);
```

**After:**
```typescript
const channelService = new ChannelService();
channelService.joinChannel('window-1', 'red');
channelService.broadcast('red', context, 'window-1');
```

Key differences:
- ChannelService is window-aware (requires windowId)
- No async initialization needed
- Direct integration with desktop event bus
- React hooks for easier integration
