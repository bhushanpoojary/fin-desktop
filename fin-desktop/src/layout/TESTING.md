# Layout Manager Testing Guide

## ✅ Yes! The screen opens in the last saved state after launching

The layout manager automatically:
- **Saves layouts to localStorage** as JSON
- **Restores the active layout** when the app launches
- **Persists across browser refreshes** and app restarts

## How to Test

### Step 1: Open the Layout Demo
1. Run `npm run dev`
2. Open the workspace window
3. Click the **"🎨 Layout Demo"** button in the top-right corner

### Step 2: Create and Save a Layout
1. Adjust the simulated window controls:
   - Move the X/Y position sliders
   - Change the width/height
   - Pick a different color
2. Click **"💾 Save Current Layout"**
3. Give it a name (e.g., "Blue Layout")

### Step 3: Create Another Layout
1. Change the window settings again (different position, size, color)
2. Click **"💾 Save Current Layout"**
3. Give it a different name (e.g., "Red Layout")

### Step 4: Test Persistence (REFRESH THE PAGE)
1. **Press F5 or Ctrl+R to reload the page**
2. Click "🎨 Layout Demo" again
3. **The last active layout will be restored automatically!** ✨
   - Position, size, and color should match what you saved

### Step 5: Test Layout Switching
1. In the "All Saved Layouts" section, click **"Switch"** on a different layout
2. The simulated window state updates instantly to match that layout
3. Refresh the page again - the newly selected layout is now active!

## How It Works

```typescript
// The useActiveLayout hook automatically loads on mount:
const { activeLayout, isLoading, saveCurrentLayout } = useActiveLayout();

// On mount, it loads from localStorage:
// - Reads: finDesktop.layoutStore.v1
// - Restores: the active layout's data
// - Updates: your UI with the saved state
```

## Inspect the Data

1. Open **Chrome DevTools** (F12)
2. Go to **Application** tab
3. Expand **Local Storage** → `http://localhost:5173` (or your dev URL)
4. Find key: **`finDesktop.layoutStore.v1`**
5. You'll see JSON like:
```json
{
  "layouts": [
    {
      "id": "layout-1733432123456-1",
      "name": "Blue Layout",
      "data": {
        "position": { "x": 150, "y": 200 },
        "size": { "width": 900, "height": 700 },
        "color": "#3b82f6"
      },
      "createdAt": "2025-12-05T10:15:23.456Z",
      "updatedAt": "2025-12-05T10:15:23.456Z"
    }
  ],
  "activeLayoutId": "layout-1733432123456-1"
}
```

## Real-World Usage

In your actual workspace, you would:

```typescript
import { useActiveLayout } from '../layout';

function WorkspaceShell() {
  const { activeLayout, isLoading, saveCurrentLayout } = useActiveLayout();

  useEffect(() => {
    if (activeLayout?.data) {
      // Pass to your docking library (GoldenLayout, FlexLayout, etc.)
      goldenLayout.loadConfig(activeLayout.data);
    }
  }, [activeLayout]);

  const handleSave = () => {
    const currentConfig = goldenLayout.getConfig();
    saveCurrentLayout("My Workspace", currentConfig);
  };

  return <DockingLibrary config={activeLayout?.data} />;
}
```

## Key Features

✅ **Auto-restore on launch** - Last active layout loads automatically  
✅ **Multiple layouts** - Save different workspace configurations  
✅ **Instant switching** - Switch between layouts without refresh  
✅ **Persistent** - Survives browser refresh and app restart  
✅ **Type-safe** - Full TypeScript support with strict types  
✅ **Library-agnostic** - Works with any docking library (data is `unknown`)  
✅ **Pluggable** - Easy to swap localStorage for API/server storage later

## Next Steps

To integrate with a real docking library:

1. Install your docking library (e.g., `golden-layout`, `rc-dock`, `flexlayout-react`)
2. Use `useActiveLayout()` in your workspace component
3. Pass `activeLayout?.data` to the docking library's config
4. When the layout changes, call `saveCurrentLayout(name, dockingLib.getConfig())`

The architecture is ready - just plug in your docking library! 🚀
