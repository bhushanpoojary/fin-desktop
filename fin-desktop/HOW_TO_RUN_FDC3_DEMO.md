# How to Run the FDC3 Phase 1 Demo

## Method 1: Via URL Parameter (Easiest)

Add a URL parameter check to your `App.tsx`:

```typescript
import { DemoWorkspace } from './shell/DemoWorkspace';

function App() {
  // Check if we should show the FDC3 demo
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('demo') === 'fdc3') {
    return <DemoWorkspace />;
  }

  // Normal app flow
  return (
    <div className="app-shell">
      <Launcher onLaunch={handleLaunch} />
    </div>
  );
}
```

Then visit: `http://localhost:5173/?demo=fdc3`

---

## Method 2: Launch Individual Apps from Workspace

The FDC3 apps are already registered. Open them from the launcher:

1. Open the workspace/launcher
2. Search for "FDC3 Phase 1" category
3. Launch these apps:
   - **Simple Instrument Source (FDC3)**
   - **Simple Instrument Target (FDC3)**
   - **FDC3 Event Log (Phase 1)**

---

## Method 3: Import Directly in App.tsx

Replace your current `App.tsx` content temporarily:

```typescript
import { DemoWorkspace } from './shell/DemoWorkspace';
import './App.css';

function App() {
  return <DemoWorkspace />;
}

export default App;
```

---

## Method 4: Add a Route

If you're using React Router:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoWorkspace } from './shell/DemoWorkspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/fdc3-demo" element={<DemoWorkspace />} />
        <Route path="/" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Then visit: `http://localhost:5173/fdc3-demo`

---

## Method 5: Create a Demo Button

Add a demo mode toggle to your launcher:

```typescript
import { useState } from 'react';
import { DemoWorkspace } from './shell/DemoWorkspace';
import { Launcher } from './features/launcher/Launcher';

function App() {
  const [showFdc3Demo, setShowFdc3Demo] = useState(false);

  if (showFdc3Demo) {
    return (
      <div>
        <button 
          onClick={() => setShowFdc3Demo(false)}
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            zIndex: 1000,
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Exit FDC3 Demo
        </button>
        <DemoWorkspace />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <button 
        onClick={() => setShowFdc3Demo(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        🚀 Launch FDC3 Demo
      </button>
      <Launcher onLaunch={handleLaunch} />
    </div>
  );
}
```

---

## Recommended: Method 1 (URL Parameter)

This is the cleanest approach for demo purposes:

**File: `src/App.tsx`**

```typescript
import { useDesktopApi } from './shared/hooks/useDesktopApi';
import { Launcher } from './features/launcher/Launcher';
import { DemoWorkspace } from './shell/DemoWorkspace';
import type { AppDefinition } from './config/types';
import './App.css';

function App() {
  const { openApp } = useDesktopApi();

  // Check for FDC3 demo mode
  const searchParams = new URLSearchParams(window.location.search);
  const demoMode = searchParams.get('demo');

  if (demoMode === 'fdc3') {
    return <DemoWorkspace />;
  }

  const handleLaunch = (app: AppDefinition) => {
    console.log("Launching app:", app.id, app);
    openApp(app.id);
  };

  return (
    <div className="app-shell">
      <Launcher onLaunch={handleLaunch} />
    </div>
  );
}

export default App;
```

**Usage:**
```
http://localhost:5173/?demo=fdc3
```

---

## Quick Test

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open one of these URLs:
   - `http://localhost:5173/?demo=fdc3` (if using Method 1)
   - `http://localhost:5173/fdc3-demo` (if using Method 4)

3. You should see the 3-panel FDC3 demo workspace

4. Click an instrument in the left panel and watch it appear in the center panel and event log

---

## Need Help?

See these files:
- `FDC3_QUICKSTART.md` - Quick start guide
- `FDC3_PHASE1_README.md` - Full documentation
- `FDC3_PHASE1_SUMMARY.md` - Implementation summary
- `src/FDC3_INTEGRATION_EXAMPLES.tsx` - Code examples
