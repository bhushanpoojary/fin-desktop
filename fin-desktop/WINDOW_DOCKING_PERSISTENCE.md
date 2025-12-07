# Window Docking - URL Rendering & Persistence Guide

## Overview

The window docking system now supports:
1. **URL Rendering** - Display websites/apps via iframes
2. **localStorage Persistence** - Instant save/restore on refresh
3. **Workspace Integration** - Save windows with workspace layouts

---

## 1. URL Rendering

### Basic Usage

Add a `url` property to any window:

```typescript
const windowWithUrl: WindowLayout = {
  id: 'browser-1',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  url: 'https://example.com',
  title: 'Example Website',
};
```

The window will automatically render the URL in an iframe.

### Custom Content vs URLs

```typescript
// URL window - renders iframe
{ id: 'w1', url: 'https://google.com', ... }

// Custom content window - uses renderWindowContent
{ id: 'w2', appId: 'custom-app', ... }
```

### Example: Open Multiple Websites

```typescript
const handleAddWebsite = () => {
  const urls = [
    'https://google.com',
    'https://github.com',
    'https://stackoverflow.com',
  ];
  
  urls.forEach((url, i) => {
    addWindow({
      id: `web-${Date.now()}-${i}`,
      x: 50 + i * 30,
      y: 50 + i * 30,
      width: 900,
      height: 600,
      url,
      title: url.split('/')[2], // Extract domain
    });
  });
};
```

---

## 2. localStorage Persistence

### Automatic Behavior

Windows are **automatically saved** to localStorage on every change:
- Adding windows
- Moving windows
- Resizing windows
- Closing windows
- Changing active window

### Storage Key

Default: `'findesktop-docked-windows'`

### Manual Access

```typescript
// Get saved windows
const saved = localStorage.getItem('findesktop-docked-windows');
const windows = JSON.parse(saved || '[]');

// Clear saved windows
localStorage.removeItem('findesktop-docked-windows');
```

### Load Behavior

On mount, windows are loaded in this order:
1. Try localStorage
2. Fall back to default windows if localStorage empty/error

---

## 3. Workspace Integration

### How It Works

Windows are saved alongside FlexLayout tabs in your workspace layouts using the `useDockedWindowsPersistence` hook.

### Layout Data Structure

```typescript
interface ExtendedLayoutData {
  flexLayout?: unknown;        // FlexLayout tabs/splits
  dockedWindows?: WindowLayout[]; // Your docked windows
}
```

### Auto-Save

Windows auto-save to the active workspace layout with **1 second debounce**:
- Prevents excessive saves during drag operations
- Saves to the same layout as your FlexLayout tabs

### Manual Save

```typescript
const { saveDockedWindows } = useDockedWindowsPersistence(windows);

// Manually save to workspace
await saveDockedWindows(windows);
```

### Usage in Custom Components

```typescript
import { useDockedWindowsPersistence } from '@/workspace';

function MyDockedWorkspace() {
  const [windows, setWindows] = useState<WindowLayout[]>([]);
  
  // Auto-saves with 1s debounce
  const { loadDockedWindows, saveDockedWindows, isSaving } = 
    useDockedWindowsPersistence(windows, {
      autoSave: true,
      debounceMs: 1000,
    });

  // Load on mount
  useEffect(() => {
    loadDockedWindows().then(loaded => {
      if (loaded.length > 0) {
        setWindows(loaded);
      }
    });
  }, []);

  return (
    <div>
      {isSaving && <span>Saving...</span>}
      <Workspace windows={windows} onWindowsChange={setWindows} />
    </div>
  );
}
```

---

## 4. Complete Example

### Open App with URL from Launcher

```typescript
// In appRegistry.ts or similar
function BrowserApp({ url }: { url?: string }) {
  const [windows, setWindows] = useState<WindowLayout[]>([
    {
      id: 'browser-1',
      x: 100,
      y: 100,
      width: 1000,
      height: 700,
      url: url || 'https://www.example.com',
      title: 'Browser',
    },
  ]);

  useDockedWindowsPersistence(windows);

  return (
    <Workspace
      windows={windows}
      onWindowsChange={setWindows}
      renderWindowContent={(id) => {
        const win = windows.find(w => w.id === id);
        if (win?.url) {
          return <iframe src={win.url} style={{ width: '100%', height: '100%' }} />;
        }
        return <div>No URL</div>;
      }}
    />
  );
}
```

### Multi-App Workspace

```typescript
function MultiAppWorkspace() {
  const [windows, setWindows] = useState<WindowLayout[]>([
    {
      id: 'news',
      url: 'https://news.ycombinator.com',
      title: 'Hacker News',
      x: 0, y: 0, width: 600, height: 500,
    },
    {
      id: 'github',
      url: 'https://github.com',
      title: 'GitHub',
      x: 620, y: 0, width: 600, height: 500,
    },
    {
      id: 'custom',
      appId: 'my-custom-app',
      title: 'Custom App',
      x: 0, y: 520, width: 1220, height: 400,
    },
  ]);

  // Both localStorage AND workspace persistence
  useDockedWindowsPersistence(windows);

  return (
    <Workspace
      windows={windows}
      onWindowsChange={setWindows}
      renderWindowContent={(id) => {
        const win = windows.find(w => w.id === id);
        
        // URL rendering
        if (win?.url) {
          return <iframe src={win.url} style={{ width: '100%', height: '100%' }} />;
        }
        
        // Custom app rendering
        if (win?.appId) {
          return <MyCustomApp appId={win.appId} />;
        }
        
        return <div>Default content</div>;
      }}
    />
  );
}
```

---

## 5. Testing Persistence

### Test localStorage

1. Open Window Docking Demo
2. Add several windows
3. Arrange them
4. Refresh page (F5)
5. ✅ Windows should restore to same positions

### Test Workspace Integration

1. Open Window Docking Demo
2. Add/arrange windows
3. Click "💾 Save to Workspace" button
4. Open a different workspace layout
5. Return to original layout
6. ✅ Windows should restore

### Clear All Data

```javascript
// In browser console
localStorage.removeItem('findesktop-docked-windows');
localStorage.removeItem('fin-desktop-layouts'); // Clear workspace layouts too
location.reload();
```

---

## 6. API Reference

### WindowLayout Interface

```typescript
interface WindowLayout {
  id: string;           // Unique identifier
  x: number;            // X position
  y: number;            // Y position  
  width: number;        // Width in pixels
  height: number;       // Height in pixels
  isActive?: boolean;   // Is window active/focused
  url?: string;         // Optional URL to render in iframe
  title?: string;       // Optional custom title
  appId?: string;       // Optional app component ID
}
```

### useDockedWindowsPersistence Hook

```typescript
function useDockedWindowsPersistence(
  windows: WindowLayout[],
  options?: {
    autoSave?: boolean;    // Default: true
    debounceMs?: number;   // Default: 1000
  }
): {
  loadDockedWindows: () => Promise<WindowLayout[]>;
  saveDockedWindows: (windows: WindowLayout[]) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
}
```

### Helper Functions

```typescript
// Extract windows from layout data
extractDockedWindows(layoutData: unknown): WindowLayout[]

// Merge windows into layout data
mergeDockedWindows(
  layoutData: unknown,
  dockedWindows: WindowLayout[]
): ExtendedLayoutData
```

---

## 7. Best Practices

### URLs
- ✅ Use HTTPS URLs when possible
- ✅ Handle iframe sandbox restrictions
- ✅ Test cross-origin policies (some sites block iframes)
- ⚠️ Add loading states for slow-loading URLs

### Persistence
- ✅ Let auto-save handle most cases (1s debounce)
- ✅ Use manual save for "Save Layout" buttons
- ✅ Test with localStorage disabled (private browsing)
- ⚠️ Don't store sensitive data in window state

### Performance
- ✅ Limit number of iframe windows (< 10 recommended)
- ✅ Use lazy loading for hidden windows
- ✅ Consider unloading iframes when minimized
- ⚠️ Monitor memory usage with many windows

---

## 8. Troubleshooting

### Windows not restoring after refresh
- Check browser console for localStorage errors
- Verify localStorage is enabled (not private browsing)
- Check storage quota (localStorage max ~5-10MB)

### iframe shows blank/blocked
- Check browser console for CSP errors
- Some sites (Google, Facebook) block iframe embedding
- Use `sandbox` attribute if needed

### Workspace save not working
- Ensure active layout exists
- Check `isSaving` state in UI
- Verify LayoutManager is configured correctly

### Performance issues
- Reduce number of concurrent iframe windows
- Increase debounce delay (2000ms+)
- Consider virtualizing off-screen windows
