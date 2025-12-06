# FDC3 Phase 2 - Intents & App Directory

## Overview

FDC3 Phase 2 adds intent-based application interoperability to FinDesktop. Applications can now raise intents (like "ViewChart", "ViewNews", "Trade") and the system will resolve them to appropriate target applications.

## Architecture

### Core Components

1. **Fdc3Intents.ts** - Type definitions for intents and contexts
2. **Fdc3AppDirectory.ts** - App directory service for managing app definitions
3. **Fdc3IntentResolver.ts** - Intent resolution logic
4. **IntentResolverDialog.tsx** - UI component for multi-app selection
5. **fdc3DesktopApi.ts** - Integration layer for DesktopApi

### Key Concepts

- **Intent**: An action to perform (e.g., "ViewChart", "ViewNews", "Trade")
- **Context**: Data passed with the intent (e.g., instrument symbol, trade details)
- **Resolution**: The process of matching an intent to an application
- **App Directory**: Registry of applications and their intent capabilities

## Setup & Integration

### 1. Initialize the FDC3 System

In your application startup code (e.g., `main.tsx` or `App.tsx`):

```typescript
import { initializeFdc3Intents, createFdc3DesktopApi, setMultipleResolveCallback } from './shared/fdc3DesktopApi';
import { appDirectory } from './config/FinDesktopConfig';

// Initialize FDC3 intents with app directory
const baseDesktopApi = window.desktopApi;
initializeFdc3Intents(appDirectory, baseDesktopApi);

// Create enhanced API
const enhancedApi = createFdc3DesktopApi(baseDesktopApi);

// Replace window.desktopApi with enhanced version
window.desktopApi = enhancedApi;
```

### 2. Set Up Intent Resolver Dialog

Create a provider component to handle multi-app resolution:

```typescript
import React, { useState } from 'react';
import { IntentResolverDialog } from './ui/intent/IntentResolverDialog';
import { setMultipleResolveCallback } from './shared/fdc3DesktopApi';
import type { IntentName } from './core/fdc3/Fdc3Intents';
import type { AppDefinition } from './core/fdc3/Fdc3AppDirectory';

export const IntentResolverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<{
    intent: IntentName;
    apps: AppDefinition[];
    resolve: (appId: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  React.useEffect(() => {
    setMultipleResolveCallback((intent, apps) => {
      return new Promise((resolve, reject) => {
        setDialogState({ intent, apps, resolve, reject });
      });
    });
  }, []);

  const handleSelect = (appId: string) => {
    if (dialogState) {
      dialogState.resolve(appId);
      setDialogState(null);
    }
  };

  const handleCancel = () => {
    if (dialogState) {
      dialogState.reject(new Error('User cancelled intent resolution'));
      setDialogState(null);
    }
  };

  return (
    <>
      {children}
      {dialogState && (
        <IntentResolverDialog
          intent={dialogState.intent}
          apps={dialogState.apps}
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};
```

### 3. Wrap Your App

```typescript
<IntentResolverProvider>
  <App />
</IntentResolverProvider>
```

## Usage Examples

### Raising Intents from Applications

#### View Chart Intent

```typescript
// In any app component
const handleShowChart = async (symbol: string) => {
  try {
    const resolution = await window.desktopApi.raiseIntent("ViewChart", {
      instrument: symbol
    });
    console.log(`Chart opened in ${resolution.appTitle}`);
  } catch (error) {
    console.error("Failed to open chart:", error);
  }
};
```

#### View News Intent

```typescript
const handleShowNews = async (symbol: string) => {
  try {
    const resolution = await window.desktopApi.raiseIntent("ViewNews", {
      instrument: symbol
    });
    console.log(`News opened in ${resolution.appTitle}`);
  } catch (error) {
    console.error("Failed to open news:", error);
  }
};
```

#### Trade Intent with Extended Context

```typescript
const handleTrade = async (symbol: string, side: "BUY" | "SELL") => {
  try {
    const resolution = await window.desktopApi.raiseIntent("Trade", {
      instrument: symbol,
      side: side,
      quantity: 100,
      price: 150.25
    });
    console.log(`Trade ticket opened in ${resolution.appTitle}`);
  } catch (error) {
    console.error("Failed to open trade:", error);
  }
};
```

### Listening for Intents in Target Apps

Apps that handle intents should subscribe to intent messages:

```typescript
import React, { useEffect, useState } from 'react';
import type { IntentContext } from '../core/fdc3/Fdc3Intents';

export const ChartApp: React.FC<{ appId: string }> = ({ appId }) => {
  const [currentSymbol, setCurrentSymbol] = useState<string>('AAPL');

  useEffect(() => {
    // Subscribe to intents targeted at this app
    const unsubscribe = window.desktopApi.subscribe(
      `FDC3_INTENT_${appId}`,
      (data: { intent: string; context: IntentContext }) => {
        if (data.intent === 'ViewChart' && 'instrument' in data.context) {
          setCurrentSymbol(data.context.instrument);
        }
      }
    );

    return unsubscribe;
  }, [appId]);

  return (
    <div>
      <h2>Chart for {currentSymbol}</h2>
      {/* Chart rendering code */}
    </div>
  );
};
```

## App Directory Configuration

Edit `src/config/FinDesktopConfig.ts` to add or modify app definitions:

```typescript
export const appDirectory: AppDefinition[] = [
  {
    id: "myChartApp",
    title: "My Chart",
    componentId: "MyChartComponent",
    intents: ["ViewChart"],
    isDefaultForIntent: ["ViewChart"],
  },
  {
    id: "advancedChart",
    title: "Advanced Chart",
    componentId: "AdvancedChartComponent",
    intents: ["ViewChart"], // Will trigger resolver dialog
  },
  // ... more apps
];
```

## Event Bus Messages

The intent system publishes the following events:

### FDC3_INTENT_RAISED

Published when an intent is successfully raised:

```typescript
{
  intent: "ViewChart",
  context: { instrument: "AAPL" },
  appId: "chartApp",
  appTitle: "Price Chart",
  timestamp: "2025-12-06T..."
}
```

### FDC3_INTENT_ERROR

Published when intent resolution fails:

```typescript
{
  intent: "ViewChart",
  context: { instrument: "AAPL" },
  error: "No applications found to handle intent: ViewChart",
  timestamp: "2025-12-06T..."
}
```

### FDC3_INTENT_{appId}

Targeted message to specific app with intent context:

```typescript
{
  intent: "ViewChart",
  context: { instrument: "AAPL" }
}
```

## Adding New Intents

To add a new intent:

1. Update `IntentName` type in `src/core/fdc3/Fdc3Intents.ts`:
   ```typescript
   export type IntentName = "ViewChart" | "ViewNews" | "Trade" | "YourNewIntent";
   ```

2. Add context type if needed:
   ```typescript
   export interface YourNewContext extends InstrumentContext {
     // additional fields
   }
   
   export type IntentContext = InstrumentContext | TradeContext | YourNewContext;
   ```

3. Register apps that handle the intent in `appDirectory`

4. Use the new intent in your components:
   ```typescript
   await window.desktopApi.raiseIntent("YourNewIntent", context);
   ```

## Testing

See `src/apps/MarketGridApp.tsx` for a complete example that demonstrates:

- Raising intents on button click
- Raising intents on double-click
- Context menu with multiple intent options
- Error handling

## Next Steps

- Implement intent listening in target apps (ChartApp, NewsApp, TradeTicketApp)
- Add more sophisticated resolution strategies
- Implement intent history/logging UI
- Add intent discovery API
- Support for app-to-app intent results
