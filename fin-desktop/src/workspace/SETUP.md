# Quick Start Guide - Workspace Docking

## Installation

Run this command to install FlexLayout:

```bash
npm install flexlayout-react
```

**Do NOT run this command yet** - it's provided for reference when you're ready to test the implementation.

## What Was Implemented

✅ **App Registry** (`src/workspace/appRegistry.ts`)
   - Maps app IDs to React components
   - Includes: InstrumentSourceApp, InstrumentTargetApp, Fdc3EventsLogScreen, OrderTicketApp, NewsApp, LiveMarketApp

✅ **WorkspaceDock Component** (`src/workspace/WorkspaceDock.tsx`)
   - Tab groups, drag-to-dock, split views, floating windows
   - Imperative API via ref: `openApp(appId, options)`
   - Auto-renders registered apps

✅ **WorkspaceShell Component** (`src/workspace/WorkspaceShell.tsx`)
   - Integrates WorkspaceDock with ILayoutManager
   - Auto-saves layout changes (debounced)
   - Shows active layout name and manual save button

✅ **Context API** (`src/workspace/WorkspaceContext.tsx`)
   - WorkspaceProvider and useWorkspace hook
   - Share dockRef across components

✅ **Complete Documentation** (`src/workspace/README.md`)

## Quick Integration

### Option 1: Using Context API (Recommended)

```typescript
// 1. Wrap your app with WorkspaceProvider
import { WorkspaceProvider, useWorkspace, WorkspaceShell } from "./workspace";

function App() {
  return (
    <WorkspaceProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <LauncherSidebar />
        <WorkspaceShell />
      </div>
    </WorkspaceProvider>
  );
}

// 2. In your Launcher component, use the hook
function LauncherSidebar() {
  const { dockRef } = useWorkspace();
  
  const handleLaunch = (app: AppDefinition) => {
    dockRef.current?.openApp(app.id, { title: app.title });
  };
  
  return <Launcher onLaunch={handleLaunch} />;
}
```

### Option 2: Using Props

```typescript
import { WorkspaceShell } from "./workspace";
import type { WorkspaceDockHandle } from "./workspace";

function App() {
  const dockRef = useRef<WorkspaceDockHandle | null>(null);
  
  const handleLaunch = (app: AppDefinition) => {
    dockRef.current?.openApp(app.id, { title: app.title });
  };
  
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Launcher onLaunch={handleLaunch} />
      <WorkspaceShell dockRef={dockRef} />
    </div>
  );
}
```

## Opening Apps

```typescript
// Basic usage
dockRef.current?.openApp("order-ticket", { title: "Order Ticket" });

// Open as floating window
dockRef.current?.openApp("news", { title: "News", float: true });
```

## Adding New Apps

1. Create your app component in `src/apps/`
2. Add to `src/workspace/appRegistry.ts`:

```typescript
import MyNewApp from "../apps/MyNewApp";

export const defaultAppRegistry: AppComponentRegistry = {
  // ... existing apps
  "my-new-app": MyNewApp,
};
```

3. Launch it: `dockRef.current?.openApp("my-new-app", { title: "My App" })`

## Layout Persistence

Layouts are automatically saved to `ILayoutManager` with the following structure:

```typescript
interface SavedLayout {
  name: string;
  data: FlexLayout.IJsonModel; // Complete FlexLayout model
}
```

Changes are auto-saved when:
- Tabs are dragged/dropped
- Views are split
- Windows are floated
- Tabs are closed

## Next Steps

1. Run `npm install flexlayout-react`
2. Choose integration approach (Context API or Props)
3. Update your main App component to use WorkspaceShell
4. Connect Launcher to use `dockRef.current?.openApp()`
5. Test opening apps, dragging tabs, splitting views

## File Structure

```
src/workspace/
  ├── index.ts                    # Main exports
  ├── appRegistry.ts              # App ID → Component mapping
  ├── WorkspaceDock.tsx           # Core FlexLayout wrapper
  ├── WorkspaceShell.tsx          # Layout manager integration
  ├── WorkspaceContext.tsx        # Context API for sharing dockRef
  ├── README.md                   # Detailed documentation
  ├── INTEGRATION_EXAMPLE.tsx     # Code examples
  └── SETUP.md                    # This file
```

## Features Available Out of the Box

- ✅ Tab groups
- ✅ Drag tabs to split horizontally/vertically
- ✅ Drag tabs to reorder
- ✅ Close tabs
- ✅ Maximize/restore tabsets
- ✅ Float tabs as separate windows
- ✅ Persistent layouts via ILayoutManager
- ✅ TypeScript strict mode compatible

## Troubleshooting

**Error: Cannot find module 'flexlayout-react'**
→ Run `npm install flexlayout-react`

**Error: App not registered**
→ Check `appRegistry.ts` has your app ID

**Layout not saving**
→ Verify `useActiveLayout()` is working and `ILayoutManager` is properly configured

See `README.md` for complete documentation.
