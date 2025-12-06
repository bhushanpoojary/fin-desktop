# FDC3 Phase 1 Implementation

This is a minimal FDC3-style context layer for FinDesktop that enables app-to-app communication.

## Features

✅ **Instrument Context Broadcasting** - Apps can broadcast instrument selections  
✅ **Context Subscription** - Apps can subscribe to receive instrument updates  
✅ **Event Logging** - Debug panel shows all FDC3 context broadcasts  
✅ **Automatic Replay** - New subscribers immediately receive the last broadcast context  
✅ **Type-Safe** - Full TypeScript support with proper types

## Architecture

### Core Components

#### 1. **Fdc3Types.ts** - Type Definitions
```typescript
type InstrumentContext = {
  instrument: string;          // e.g. "AAPL"
  sourceAppId?: string;        // app that sent it
  timestamp?: number;          // Date.now()
};

type Fdc3Event = {
  type: "CONTEXT_BROADCAST";
  context: InstrumentContext;
};
```

#### 2. **Fdc3ContextBus.ts** - Pub/Sub Bus
Simple in-memory pub/sub bus for context communication:
- `subscribeContext()` - Listen for instrument context changes
- `subscribeEvents()` - Listen for raw FDC3 events (for logging)
- `broadcastInstrument()` - Broadcast new instrument context
- `getLastContext()` - Get the last broadcast context

#### 3. **Fdc3ContextProvider.tsx** - React Context
React context wrapper that provides the FDC3 bus to all child components:
- `<Fdc3Provider>` - Wrap your app with this provider
- `useFdc3()` - Hook to access the FDC3 bus

## Demo Apps

### SimpleInstrumentSource
**Location:** `src/apps/SimpleInstrumentSource.tsx`

Broadcasts instrument selections to all listening apps.

**Features:**
- Quick selection buttons for popular instruments (AAPL, MSFT, etc.)
- Custom symbol input for any instrument
- Shows last broadcast confirmation

**Usage:**
```typescript
import { useFdc3 } from "../core/fdc3";

const fdc3Bus = useFdc3();

fdc3Bus.broadcastInstrument({
  instrument: "AAPL",
  sourceAppId: "SimpleInstrumentSource",
  timestamp: Date.now(),
});
```

### SimpleInstrumentTarget
**Location:** `src/apps/SimpleInstrumentTarget.tsx`

Subscribes to instrument context and displays the currently selected instrument.

**Features:**
- Large display of selected instrument
- Shows source app and timestamp
- Connection status indicator
- Empty state when no instrument selected

**Usage:**
```typescript
import { useFdc3 } from "../core/fdc3";

const fdc3Bus = useFdc3();

useEffect(() => {
  const unsubscribe = fdc3Bus.subscribeContext((ctx) => {
    console.log("Received:", ctx.instrument);
  });
  return unsubscribe;
}, [fdc3Bus]);
```

### Fdc3EventLogPanel
**Location:** `src/apps/Fdc3EventLogPanel.tsx`

Real-time event log for debugging FDC3 context broadcasts.

**Features:**
- Shows all context broadcasts in real-time
- Displays timestamp, source app, and instrument for each event
- Auto-scroll option (enabled by default)
- Clear log button
- Event count statistics
- Expandable full context details

## Demo Workspace

**Location:** `src/shell/DemoWorkspace.tsx`

Pre-configured 3-panel layout demonstrating the full FDC3 Phase 1 workflow:

```
┌──────────────────┬──────────────────┬──────────────────┐
│  Instrument      │  Instrument      │  FDC3 Event      │
│  Source          │  Target          │  Log Panel       │
│  (Broadcasts)    │  (Receives)      │  (Monitoring)    │
└──────────────────┴──────────────────┴──────────────────┘
```

**Usage:**
```typescript
import { DemoWorkspace } from "./shell/DemoWorkspace";

function App() {
  return <DemoWorkspace />;
}
```

## Integration Guide

### Step 1: Wrap Your App with Fdc3Provider

```typescript
import { Fdc3Provider } from "./core/fdc3";

function App() {
  return (
    <Fdc3Provider>
      {/* Your app components */}
    </Fdc3Provider>
  );
}
```

### Step 2: Broadcasting Context from an App

```typescript
import { useFdc3 } from "./core/fdc3";

function MyBroadcasterApp() {
  const fdc3Bus = useFdc3();

  const handleSelectInstrument = (symbol: string) => {
    fdc3Bus.broadcastInstrument({
      instrument: symbol,
      sourceAppId: "MyBroadcasterApp",
      timestamp: Date.now(),
    });
  };

  return <button onClick={() => handleSelectInstrument("AAPL")}>
    Select AAPL
  </button>;
}
```

### Step 3: Subscribing to Context in an App

```typescript
import { useFdc3 } from "./core/fdc3";
import { useEffect, useState } from "react";

function MyListenerApp() {
  const fdc3Bus = useFdc3();
  const [instrument, setInstrument] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to context changes
    const unsubscribe = fdc3Bus.subscribeContext((ctx) => {
      setInstrument(ctx.instrument);
    });

    // Cleanup on unmount
    return unsubscribe;
  }, [fdc3Bus]);

  return <div>Selected: {instrument || "None"}</div>;
}
```

### Step 4: Monitoring Events (Optional)

```typescript
import { useFdc3 } from "./core/fdc3";
import { useEffect } from "react";

function MyMonitorApp() {
  const fdc3Bus = useFdc3();

  useEffect(() => {
    const unsubscribe = fdc3Bus.subscribeEvents((evt) => {
      console.log("FDC3 Event:", evt.type, evt.context);
    });
    return unsubscribe;
  }, [fdc3Bus]);

  return <div>Monitoring FDC3 events...</div>;
}
```

## Testing the Demo

### Option 1: Use the Demo Workspace

1. Import the DemoWorkspace component:
   ```typescript
   import { DemoWorkspace } from "./shell/DemoWorkspace";
   ```

2. Render it in your app:
   ```typescript
   <DemoWorkspace />
   ```

3. Test the workflow:
   - Click an instrument in the **Source** panel
   - See it appear in the **Target** panel
   - See the event logged in the **Event Log** panel

### Option 2: Use Individual Apps in Workspace

The apps are registered in `src/workspace/appRegistry.ts`:

```typescript
{
  "simple-instrument-source": SimpleInstrumentSource,
  "simple-instrument-target": SimpleInstrumentTarget,
  "fdc3-event-log": Fdc3EventLogPanel,
}
```

Open them from the launcher by their IDs.

### Option 3: Test with App Launcher

The apps are defined in `public/config/demo-apps.json`:

- **Simple Instrument Source (FDC3)** - Category: "FDC3 Phase 1"
- **Simple Instrument Target (FDC3)** - Category: "FDC3 Phase 1"
- **FDC3 Event Log (Phase 1)** - Category: "FDC3 Phase 1"

## Verification Checklist

✅ **Context Broadcasting Works**
1. Open Source app
2. Click an instrument (e.g., "AAPL")
3. Confirm "Last broadcast" message appears

✅ **Context Reception Works**
1. Open Target app
2. Broadcast an instrument from Source app
3. Confirm Target app updates with the selected instrument

✅ **Event Logging Works**
1. Open Event Log panel
2. Broadcast an instrument from Source app
3. Confirm event appears in log with:
   - Timestamp
   - Source app ID
   - Instrument symbol

✅ **Automatic Replay Works**
1. Broadcast an instrument from Source app
2. Open a new Target app
3. Confirm Target app immediately shows the last instrument

## File Structure

```
src/
├── core/fdc3/
│   ├── Fdc3Types.ts              # Type definitions
│   ├── Fdc3ContextBus.ts         # Pub/sub bus implementation
│   ├── Fdc3ContextProvider.tsx   # React context provider
│   └── index.ts                  # Exports
│
├── apps/
│   ├── SimpleInstrumentSource.tsx  # Source app
│   ├── SimpleInstrumentTarget.tsx  # Target app
│   └── Fdc3EventLogPanel.tsx       # Event log
│
└── shell/
    └── DemoWorkspace.tsx          # Pre-configured demo layout
```

## Next Steps (Future Phases)

### Phase 2: Multi-Context Support
- Support for different context types (trade, position, chart, etc.)
- Context type filtering
- Multiple simultaneous contexts

### Phase 3: Channels
- User channels (Red, Green, Blue, etc.)
- Channel joining/leaving
- Per-channel context isolation

### Phase 4: Intents
- Raised intents (ViewChart, PlaceOrder, etc.)
- Intent resolution
- Intent handlers

### Phase 5: App Directory
- App metadata
- App discovery
- Inter-app launching with context

## API Reference

### `useFdc3()` Hook

Returns the `Fdc3ContextBus` instance.

**Example:**
```typescript
const fdc3Bus = useFdc3();
```

### `Fdc3ContextBus.broadcastInstrument(context)`

Broadcasts a new instrument context.

**Parameters:**
- `context: InstrumentContext` - The context to broadcast

**Example:**
```typescript
fdc3Bus.broadcastInstrument({
  instrument: "AAPL",
  sourceAppId: "MyApp",
  timestamp: Date.now(),
});
```

### `Fdc3ContextBus.subscribeContext(handler)`

Subscribes to instrument context changes.

**Parameters:**
- `handler: (ctx: InstrumentContext) => void` - Callback for context updates

**Returns:**
- `() => void` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = fdc3Bus.subscribeContext((ctx) => {
  console.log("New instrument:", ctx.instrument);
});

// Later, to unsubscribe:
unsubscribe();
```

### `Fdc3ContextBus.subscribeEvents(handler)`

Subscribes to raw FDC3 events (for logging/debugging).

**Parameters:**
- `handler: (evt: Fdc3Event) => void` - Callback for events

**Returns:**
- `() => void` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = fdc3Bus.subscribeEvents((evt) => {
  console.log("FDC3 Event:", evt.type, evt.context);
});
```

### `Fdc3ContextBus.getLastContext()`

Gets the last broadcast context (if any).

**Returns:**
- `InstrumentContext | null`

**Example:**
```typescript
const lastContext = fdc3Bus.getLastContext();
if (lastContext) {
  console.log("Last instrument:", lastContext.instrument);
}
```

## Troubleshooting

### "useFdc3 must be used inside Fdc3Provider"
**Solution:** Ensure your component is wrapped with `<Fdc3Provider>`.

### Context not updating in Target app
**Solution:** Check that both apps are wrapped in the same `<Fdc3Provider>` instance.

### Events not appearing in log
**Solution:** Verify the Event Log panel is subscribed using `subscribeEvents()`, not `subscribeContext()`.

## Contributing

When extending this implementation:

1. Keep `Fdc3Types.ts` up-to-date with new context types
2. Add new context methods to `Fdc3ContextBus.ts`
3. Update this README with new features
4. Add tests for new functionality

## License

MIT
