# Testing FDC3 Intents - Quick Guide

## ✅ Setup Complete!

The FDC3 intent system is now integrated into your demo app.

## How to Test

### 1. Start the Demo App

```bash
npm run dev
```

### 2. Open the Market Grid Demo

Navigate to: **http://localhost:5173/?entry=app&appId=market-grid**

You should see a market grid with stock data (AAPL, MSFT, GOOGL, etc.)

### 3. Test Intent Actions

**Option A: Use the Button Actions**
- Click the **📈 button** → Raises `ViewChart` intent
- Click the **📰 button** → Raises `ViewNews` intent  
- Click the **BUY button** → Raises `Trade` intent with BUY side

**Option B: Double-Click a Row**
- Double-click any stock row → Raises `ViewChart` intent

**Option C: Right-Click Context Menu**
- Right-click any row → Opens context menu
- Select from: View Chart, View News, or Trade options

### 4. What Should Happen

Since multiple apps can handle some intents (see config below), you'll see:

1. **Intent Resolver Dialog** appears
2. Shows list of apps that can handle the intent
3. You can select which app to open
4. The selected app opens with the context

### 5. Current App Directory

From `FinDesktopConfig.ts`:

- **chartApp** → Handles `ViewChart` (default)
- **newsApp** → Handles `ViewNews` (default)
- **tradeTicketApp** → Handles `Trade` + `ViewChart` (default for Trade)
- **liveMarketApp** → Handles `ViewChart` + `ViewNews`
- **orderTicketApp** → Handles `Trade`

### 6. Console Testing

Open browser DevTools (F12) and run:

```javascript
// Test ViewChart intent
await window.desktopApi.raiseIntent("ViewChart", { instrument: "AAPL" });

// Test ViewNews intent
await window.desktopApi.raiseIntent("ViewNews", { instrument: "MSFT" });

// Test Trade intent
await window.desktopApi.raiseIntent("Trade", { 
  instrument: "GOOGL", 
  side: "BUY", 
  quantity: 100 
});
```

### 7. Monitor Intent Events

Subscribe to intent events in the console:

```javascript
// Listen for successful intent resolutions
window.desktopApi.subscribe("FDC3_INTENT_RAISED", (data) => {
  console.log("✅ Intent raised:", data);
});

// Listen for errors
window.desktopApi.subscribe("FDC3_INTENT_ERROR", (error) => {
  console.error("❌ Intent error:", error);
});
```

### 8. Expected Behavior

**ViewChart Intent:**
- Shows resolver dialog (chartApp vs liveMarketApp vs tradeTicketApp)
- Default: chartApp

**ViewNews Intent:**
- Shows resolver dialog (newsApp vs liveMarketApp)
- Default: newsApp

**Trade Intent:**
- Shows resolver dialog (tradeTicketApp vs orderTicketApp)
- Default: tradeTicketApp

## Troubleshooting

**"Unknown appId: market-grid"** → ✅ FIXED - MarketGridApp now registered

**Dialog doesn't appear** → Check console for initialization message:
```
✅ FDC3 Intent system initialized with 5 apps
```

**raiseIntent is not a function** → Refresh the page after changes

**Apps don't open** → These are mock apps in the directory. To make them actually open, you need to:
1. Create the actual app components (ChartApp, NewsApp, etc.)
2. Update `desktopApi.openApp()` to launch them
3. Add intent listeners in those apps using `useIntentListener` hook

## Next Steps

To make apps actually respond to intents:

1. **Create ChartApp.tsx:**
```typescript
import { useIntentListener } from '../shared/hooks/useIntent';

export const ChartApp = () => {
  const [symbol, setSymbol] = useState('AAPL');
  
  useIntentListener('chartApp', (intent, context) => {
    if (intent === 'ViewChart' && 'instrument' in context) {
      setSymbol(context.instrument);
    }
  });
  
  return <div>Chart for {symbol}</div>;
};
```

2. **Register in AppHost.tsx**
3. **Add to demo-apps.json**

## Live Demo

The Market Grid app demonstrates all intent patterns:
- ✅ Button-based intents
- ✅ Double-click intents
- ✅ Context menu intents
- ✅ Error handling
- ✅ Loading states

Have fun testing! 🚀
