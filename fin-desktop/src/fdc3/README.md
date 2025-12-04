# FDC3 Layer - Phase 1: Selected Instrument Context

A minimal FDC3-like layer for instrument selection context sharing across apps.

## Architecture

### Core Components

1. **`types.ts`** - Domain types for FDC3 events and contexts
   - `SelectedInstrumentContext`: Represents an instrument selection (e.g., "AAPL")
   - `Fdc3Event`: Generic event wrapper
   - `Fdc3EventType`: Type definitions for events

2. **`Fdc3Bus.ts`** - In-memory event bus (publish/subscribe)
   - `publishSelectedInstrument(context)`: Broadcast an instrument selection
   - `subscribeSelectedInstrument(handler)`: Listen for instrument changes
   - `getCurrentInstrumentContext()`: Get the current selection

3. **`Fdc3Context.tsx`** - React integration
   - `<Fdc3Provider>`: Provides the FDC3 bus via React context
   - `useFdc3Bus()`: Access the bus directly
   - `useSelectedInstrument()`: Subscribe to instrument changes (React hook)

## Demo Apps

### 1. InstrumentSourceApp (Publisher)
- Displays a list of instruments: AAPL, MSFT, GOOG, TSLA
- Publishes `SelectedInstrumentContext` when user clicks an instrument
- Logs events via `useLogger`

### 2. InstrumentTargetApp (Subscriber)
- Listens for instrument selection changes
- Displays current instrument, source app ID, and timestamp
- Shows "No instrument selected yet" when no context is available

### 3. Fdc3EventsLogScreen (Event Log)
- Subscribes to all instrument selection events
- Maintains a list of last 100 events (most recent first)
- Displays events in a table with time, instrument, and source

## Usage

### Quick Start

The entire app is already wrapped with `<Fdc3Provider>` in `main.tsx`, so FDC3 is available everywhere.

### Using in Your Apps

```tsx
import { useFdc3Bus, useSelectedInstrument } from "../fdc3";

// To publish an instrument selection:
const bus = useFdc3Bus();
bus.publishSelectedInstrument({
  instrument: "AAPL",
  sourceAppId: "my-app"
});

// To subscribe to changes:
const context = useSelectedInstrument();
// context updates automatically when a new instrument is published
```

### Demo Layout

Use `Fdc3DemoLayout` to see all three apps side-by-side:

```tsx
import { Fdc3DemoLayout } from "./fdc3";

<Fdc3DemoLayout />
```

Or register the three apps individually in your layout system:
- `instrument-source` → `<InstrumentSourceApp />`
- `instrument-target` → `<InstrumentTargetApp />`
- `fdc3-events-log` → `<Fdc3EventsLogScreen />`

## Key Design Decisions

1. **Type Safety**: All types are explicit, no `any` types
2. **Composable**: Easy to extend with new context types and intents
3. **Minimal**: Only implements what's needed for Phase 1
4. **React Integration**: Uses hooks and context for clean integration
5. **Logging**: Integrates with existing `useLogger` system

## Future Extensions

This minimal implementation can be extended to support:

- **Multiple context types**: Trade, order, chart, news, etc.
- **Intents**: raiseIntent, addIntentListener
- **Channels**: User channels (red, blue, green) and app channels
- **App Directory**: Integration with app catalog
- **Desktop Agent API**: Full FDC3 2.0+ compliance

## Testing

1. Run the app with the demo layout
2. Click an instrument in the Source app (left panel)
3. Verify it appears immediately in the Target app (center panel)
4. Check the Events Log (right panel) shows the event with timestamp

The flow should be instant - no delays or polling.
