# FDC3 Phase 2 - Quick Start Guide

## Overview

FDC3 Phase 2 adds **intent-based application interoperability** to FinDesktop. This allows applications to communicate through standardized intents like "ViewChart", "ViewNews", and "Trade".

## 5-Minute Setup

### Step 1: Initialize FDC3 in Your App

Add this to your `src/main.tsx` before rendering:

```typescript
import { initializeFdc3Intents, createFdc3DesktopApi } from "./shared/fdc3DesktopApi";
import { appDirectory } from "./config/FinDesktopConfig";

// Initialize FDC3
if (window.desktopApi) {
  initializeFdc3Intents(appDirectory, window.desktopApi);
  window.desktopApi = createFdc3DesktopApi(window.desktopApi);
}
```

### Step 2: Wrap Your App with Intent Resolver Provider

```typescript
import { IntentResolverProvider } from "./shared/providers/IntentResolverProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IntentResolverProvider>
      <App />
    </IntentResolverProvider>
  </React.StrictMode>
);
```

### Step 3: Raise Intents from Your Components

```typescript
// Simple approach
const handleViewChart = async (symbol: string) => {
  await window.desktopApi.raiseIntent("ViewChart", { instrument: symbol });
};

// Or use the hook for better error handling
import { useIntent } from "./shared/hooks/useIntent";

const { raiseIntent, isLoading } = useIntent({
  onSuccess: (resolution) => console.log(`Opened in ${resolution.appTitle}`),
  onError: (error) => alert(error.message)
});

const handleViewChart = async (symbol: string) => {
  await raiseIntent("ViewChart", { instrument: symbol });
};
```

### Step 4: Listen for Intents in Target Apps

```typescript
import { useIntentListener } from "./shared/hooks/useIntent";

export const ChartApp = () => {
  const [symbol, setSymbol] = useState("AAPL");

  useIntentListener("chartApp", (intent, context) => {
    if (intent === "ViewChart" && "instrument" in context) {
      setSymbol(context.instrument);
    }
  });

  return <div>Chart for {symbol}</div>;
};
```

## Complete Example

See `src/apps/MarketGridApp.tsx` for a full working example that includes:

- ✅ Button-based intent raising
- ✅ Double-click intent triggering
- ✅ Context menu with multiple intents
- ✅ Error handling
- ✅ Loading states

## Available Intents

| Intent | Purpose | Context |
|--------|---------|---------|
| `ViewChart` | Display price chart | `{ instrument: string }` |
| `ViewNews` | Show news articles | `{ instrument: string }` |
| `Trade` | Open trade ticket | `{ instrument: string, side?: "BUY"\|"SELL", quantity?: number, price?: number }` |

## App Directory Configuration

Edit `src/config/FinDesktopConfig.ts` to define which apps handle which intents:

```typescript
export const appDirectory: AppDefinition[] = [
  {
    id: "chartApp",
    title: "Price Chart",
    componentId: "ChartApp",
    intents: ["ViewChart"],
    isDefaultForIntent: ["ViewChart"], // This app is the default for ViewChart
  },
  {
    id: "tradingView",
    title: "TradingView Chart",
    componentId: "TradingViewChart",
    intents: ["ViewChart"], // Also handles ViewChart - will show resolver dialog
  },
];
```

## Testing Your Implementation

1. **Test single app resolution**: Raise an intent that only one app handles
   - Should open that app directly without showing a dialog

2. **Test multiple app resolution**: Raise an intent that multiple apps handle
   - Should show a resolver dialog to select which app to use

3. **Test error handling**: Raise an intent with no registered apps
   - Should log error to console and reject the promise

4. **Check event bus**: Monitor FDC3 events in console
   ```typescript
   window.desktopApi.subscribe("FDC3_INTENT_RAISED", console.log);
   window.desktopApi.subscribe("FDC3_INTENT_ERROR", console.error);
   ```

## Common Patterns

### Pattern 1: Context Menu Actions

```typescript
<button onClick={(e) => {
  e.stopPropagation();
  window.desktopApi.raiseIntent("ViewChart", { instrument: row.symbol });
}}>
  View Chart
</button>
```

### Pattern 2: Double-Click to Open Chart

```typescript
<tr onDoubleClick={() => {
  window.desktopApi.raiseIntent("ViewChart", { instrument: row.symbol });
}}>
```

### Pattern 3: Trade Buttons with Context

```typescript
<button onClick={() => {
  window.desktopApi.raiseIntent("Trade", {
    instrument: symbol,
    side: "BUY",
    quantity: 100
  });
}}>
  Buy
</button>
```

## Next Steps

1. ✅ Implement intent listeners in your target apps
2. ✅ Customize the IntentResolverDialog styling
3. ✅ Add more apps to the app directory
4. ✅ Create custom intents for your domain
5. ✅ Implement intent result handling (future phase)

## Troubleshooting

**Problem**: `raiseIntent is not a function`
- **Solution**: Make sure you called `createFdc3DesktopApi` and replaced `window.desktopApi`

**Problem**: No apps found for intent
- **Solution**: Check that apps are registered in `appDirectory` with the correct intent names

**Problem**: Resolver dialog doesn't appear
- **Solution**: Ensure `IntentResolverProvider` wraps your app

**Problem**: Intent listener not receiving messages
- **Solution**: Verify the `appId` in `useIntentListener` matches the id in `appDirectory`

## Documentation

- Full guide: `FDC3_PHASE2_INTENTS_README.md`
- Example: `src/apps/MarketGridApp.tsx`
- Hooks: `src/shared/hooks/useIntent.ts`
- Types: `src/core/fdc3/Fdc3Intents.ts`
