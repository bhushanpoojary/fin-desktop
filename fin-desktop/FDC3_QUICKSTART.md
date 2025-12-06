# FDC3 Phase 1 - Quick Start Guide

## 🚀 Quick Start (2 Minutes)

### Step 1: Import the Demo Workspace

```typescript
import { DemoWorkspace } from "./shell/DemoWorkspace";
```

### Step 2: Render It

```typescript
function App() {
  return <DemoWorkspace />;
}
```

### Step 3: Test It

1. Click any instrument button in the left panel (e.g., "AAPL")
2. Watch it appear in the center panel
3. See the event logged in the right panel

**That's it!** You now have a working FDC3 Phase 1 demo.

---

## 📱 Use Individual Apps

### In Your Workspace

```typescript
import { Fdc3Provider } from "./core/fdc3";
import { SimpleInstrumentSource } from "./apps/SimpleInstrumentSource";
import { SimpleInstrumentTarget } from "./apps/SimpleInstrumentTarget";

function MyWorkspace() {
  return (
    <Fdc3Provider>
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        <SimpleInstrumentSource />
        <SimpleInstrumentTarget />
      </div>
    </Fdc3Provider>
  );
}
```

---

## 🛠️ Build Your Own FDC3 App

### Broadcasting Context

```typescript
import { useFdc3 } from "./core/fdc3";

function MyBroadcaster() {
  const fdc3 = useFdc3();

  const sendInstrument = (symbol: string) => {
    fdc3.broadcastInstrument({
      instrument: symbol,
      sourceAppId: "MyBroadcaster",
      timestamp: Date.now(),
    });
  };

  return <button onClick={() => sendInstrument("TSLA")}>Send TSLA</button>;
}
```

### Receiving Context

```typescript
import { useFdc3 } from "./core/fdc3";
import { useEffect, useState } from "react";

function MyListener() {
  const fdc3 = useFdc3();
  const [instrument, setInstrument] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = fdc3.subscribeContext((ctx) => {
      setInstrument(ctx.instrument);
    });
    return unsubscribe;
  }, [fdc3]);

  return <div>Instrument: {instrument || "None"}</div>;
}
```

### Wrap with Provider

```typescript
import { Fdc3Provider } from "./core/fdc3";

function App() {
  return (
    <Fdc3Provider>
      <MyBroadcaster />
      <MyListener />
    </Fdc3Provider>
  );
}
```

---

## 📋 Available Apps

### 1. SimpleInstrumentSource
- **Location:** `src/apps/SimpleInstrumentSource.tsx`
- **Purpose:** Broadcasts instrument selections
- **Features:** Quick-select buttons + custom input
- **App ID:** `simple-instrument-source`

### 2. SimpleInstrumentTarget
- **Location:** `src/apps/SimpleInstrumentTarget.tsx`
- **Purpose:** Displays selected instrument
- **Features:** Large display + metadata + connection status
- **App ID:** `simple-instrument-target`

### 3. Fdc3EventLogPanel
- **Location:** `src/apps/Fdc3EventLogPanel.tsx`
- **Purpose:** Monitors all FDC3 events
- **Features:** Real-time log + auto-scroll + clear button
- **App ID:** `fdc3-event-log`

---

## 🎯 Testing Checklist

- [ ] Open Demo Workspace
- [ ] Click instrument in Source app
- [ ] Verify it appears in Target app
- [ ] Check Event Log shows the broadcast
- [ ] Open another Target app
- [ ] Verify it shows the same instrument (replay)
- [ ] Change instrument in Source
- [ ] Verify all Target apps update

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `src/core/fdc3/Fdc3ContextBus.ts` | Core pub/sub bus |
| `src/core/fdc3/Fdc3ContextProvider.tsx` | React provider |
| `src/core/fdc3/Fdc3Types.ts` | Type definitions |
| `src/shell/DemoWorkspace.tsx` | Demo layout |
| `src/workspace/appRegistry.ts` | App registration |

---

## 💡 Common Patterns

### Pattern 1: Broadcast on Button Click
```typescript
<button onClick={() => fdc3.broadcastInstrument({
  instrument: "AAPL",
  sourceAppId: "MyApp",
  timestamp: Date.now()
})}>
  Send AAPL
</button>
```

### Pattern 2: Subscribe in useEffect
```typescript
useEffect(() => {
  const unsubscribe = fdc3.subscribeContext(ctx => {
    console.log("Received:", ctx.instrument);
  });
  return unsubscribe; // Cleanup
}, [fdc3]);
```

### Pattern 3: Monitor Events for Debugging
```typescript
useEffect(() => {
  const unsubscribe = fdc3.subscribeEvents(evt => {
    console.log("Event:", evt.type, evt.context);
  });
  return unsubscribe;
}, [fdc3]);
```

---

## 🐛 Troubleshooting

### Error: "useFdc3 must be used inside Fdc3Provider"
**Fix:** Wrap your component tree with `<Fdc3Provider>`

### Target app not updating
**Fix:** Ensure both apps share the same `<Fdc3Provider>` instance

### Events not logging
**Fix:** Use `subscribeEvents()` not `subscribeContext()` for event log

---

## 📖 Full Documentation

- **Full README:** `FDC3_PHASE1_README.md`
- **Integration Examples:** `src/FDC3_INTEGRATION_EXAMPLES.tsx`
- **Implementation Summary:** `FDC3_PHASE1_SUMMARY.md`

---

**Ready to go!** 🎉

Start with the Demo Workspace and expand from there.
