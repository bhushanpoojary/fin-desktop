# Workspace Docking Module

This module provides in-workspace docking using [FlexLayout](https://github.com/caplin/FlexLayout) with full integration into the existing layout management system.

## Features

- **Tab Groups**: Organize multiple apps in tabbed interfaces
- **Drag-to-Dock**: Drag tabs to split views or create new tab groups
- **Split Views**: Horizontal and vertical splits for multi-app viewing
- **Floating Windows**: Pop out tabs into floating windows
- **Layout Persistence**: Save and restore layouts via `ILayoutManager`

## Installation

### 1. Install FlexLayout

Run the following command in your terminal:

```bash
npm install flexlayout-react
```

This will install:
- `flexlayout-react` - React bindings for FlexLayout
- TypeScript types are included in the package

### 2. Verify Installation

Check that `flexlayout-react` appears in your `package.json` dependencies.

## Architecture

### Components

#### `appRegistry.ts`
Maps app IDs (strings) to React components. All workspace apps must be registered here.

```typescript
export const defaultAppRegistry: AppComponentRegistry = {
  "instrument-source": InstrumentSourceApp,
  "instrument-target": InstrumentTargetApp,
  "fdc3-events-log": Fdc3EventsLogScreen,
  // ... add more apps
};
```

#### `WorkspaceDock.tsx`
Core docking component that wraps FlexLayout's `<Layout>` component.

**Props:**
- `initialModelJson?: FlexLayout.IJsonModel` - Initial layout configuration
- `onLayoutChange?: (model: FlexLayout.IJsonModel) => void` - Called when layout changes
- `appRegistry?: AppComponentRegistry` - Custom app registry (defaults to `defaultAppRegistry`)

**Imperative API (via ref):**
```typescript
interface WorkspaceDockHandle {
  openApp(appId: string, options?: {
    title?: string;
    float?: boolean;
  }): void;
}
```

#### `WorkspaceShell.tsx`
Integration layer that connects `WorkspaceDock` with `ILayoutManager`.

**Features:**
- Loads initial layout from `useActiveLayout()`
- Auto-saves layout changes (debounced by 1 second)
- Provides manual save button
- Displays active layout name

## Integration Guide

### Step 1: Add Apps to Registry

Edit `src/workspace/appRegistry.ts` to include all your workspace apps:

```typescript
import MyNewApp from "../apps/MyNewApp";

export const defaultAppRegistry: AppComponentRegistry = {
  // ... existing apps
  "my-new-app": MyNewApp,
};
```

### Step 2: Use WorkspaceShell in Your App

Replace your main workspace rendering with `WorkspaceShell`:

```typescript
import { WorkspaceShell } from "./workspace";

function App() {
  return <WorkspaceShell />;
}
```

### Step 3: Connect Launcher to WorkspaceDock

To open apps from the Launcher, you need access to the `WorkspaceDock` ref. There are two approaches:

#### Option A: Context API (Recommended)

Create a workspace context:

```typescript
// src/workspace/WorkspaceContext.tsx
import React, { createContext, useContext, useRef } from "react";
import type { WorkspaceDockHandle } from "./WorkspaceDock";

const WorkspaceContext = createContext<{
  dockRef: React.RefObject<WorkspaceDockHandle | null>;
} | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dockRef = useRef<WorkspaceDockHandle | null>(null);
  
  return (
    <WorkspaceContext.Provider value={{ dockRef }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
};
```

Then modify `WorkspaceShell` to use the context:

```typescript
export const WorkspaceShell: React.FC = () => {
  const { dockRef } = useWorkspace();
  
  return (
    <div className="workspace-shell">
      <WorkspaceDock ref={dockRef} /* ... */ />
    </div>
  );
};
```

In your Launcher:

```typescript
import { useWorkspace } from "../workspace/WorkspaceContext";

export const Launcher: React.FC = () => {
  const { dockRef } = useWorkspace();
  
  const handleLaunch = (app: AppDefinition) => {
    dockRef.current?.openApp(app.id, { title: app.title });
  };
  
  // ... rest of launcher
};
```

#### Option B: Prop Drilling (Simple)

Pass the dock ref through props:

```typescript
// In parent component
const dockRef = useRef<WorkspaceDockHandle | null>(null);

<Launcher onLaunch={(app) => {
  dockRef.current?.openApp(app.id, { title: app.title });
}} />
```

### Step 4: Opening Apps Programmatically

```typescript
// Open app in active tabset
dockRef.current?.openApp("order-ticket", { title: "Order Ticket" });

// Open app as floating window
dockRef.current?.openApp("news", { title: "News", float: true });
```

## Layout Persistence

Layouts are automatically saved to `ILayoutManager` when:
1. User drags tabs to split views
2. User closes/opens tabs
3. User resizes panels
4. User pops out floating windows

The layout JSON structure is stored in `SavedLayout.data`:

```typescript
interface SavedLayout {
  id: string;
  name: string;
  data: FlexLayout.IJsonModel; // FlexLayout JSON structure
}
```

## FlexLayout Model Structure

The FlexLayout model JSON follows this structure:

```json
{
  "global": {
    "tabEnableClose": true,
    "tabEnableRename": false,
    "tabSetEnableMaximize": true
  },
  "borders": [],
  "layout": {
    "type": "row",
    "children": [
      {
        "type": "tabset",
        "children": [
          {
            "type": "tab",
            "name": "Order Ticket",
            "component": "order-ticket"
          }
        ]
      }
    ]
  }
}
```

- **`layout.type`**: `"row"` or `"tabset"`
- **`tab.component`**: The app ID from `appRegistry`
- **`tab.name`**: Display name shown in tab

## Customization

### Custom Styles

FlexLayout includes default styles. To customize:

```typescript
// Import dark theme instead of light
import "flexlayout-react/style/dark.css";

// Or create custom CSS overrides
```

### Global FlexLayout Settings

Modify the `global` section in `defaultModel` within `WorkspaceDock.tsx`:

```typescript
const defaultModel: FlexLayout.IJsonModel = {
  global: {
    tabEnableClose: true,           // Allow closing tabs
    tabEnableRename: false,          // Disable tab renaming
    tabSetEnableMaximize: true,      // Allow maximizing tabsets
    tabSetEnableTabStrip: true,      // Show tab strip
    borderSize: 200,                 // Size of border panels
    // ... more options in FlexLayout docs
  },
  // ...
};
```

### Adding New Apps

1. Create your app component in `src/apps/`
2. Add it to `appRegistry.ts`
3. Ensure the app ID matches in both the registry and when calling `openApp()`

```typescript
// src/apps/BlotterApp.tsx
export const BlotterApp: React.FC = () => {
  return <div>Blotter content</div>;
};

// src/workspace/appRegistry.ts
import { BlotterApp } from "../apps/BlotterApp";

export const defaultAppRegistry: AppComponentRegistry = {
  // ...
  "blotter": BlotterApp,
};

// Usage
dockRef.current?.openApp("blotter", { title: "Trade Blotter" });
```

## TypeScript Types

All major types are exported from the workspace module:

```typescript
import type {
  WorkspaceDockHandle,
  WorkspaceDockProps,
  OpenAppOptions,
  AppComponentRegistry,
} from "./workspace";
```

## Troubleshooting

### "App not registered" error
Make sure the app ID passed to `openApp()` exists in `appRegistry`.

### Layout not persisting
Check that `onLayoutChange` is being called and `saveCurrentLayout` is working. Add console logs if needed.

### FlexLayout types not found
Run `npm install flexlayout-react` and restart your TypeScript server.

### Tabs not opening
Verify:
1. `dockRef.current` is not null
2. App ID exists in registry
3. Check browser console for errors

## Further Reading

- [FlexLayout Documentation](https://github.com/caplin/FlexLayout)
- [FlexLayout Demos](https://rawgit.com/caplin/FlexLayout/demos/demos/index.html)
