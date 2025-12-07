# Window Docking System

A complete window docking implementation for FinDesktop with magnetic snapping, visual feedback, and smooth UX.

## 🎯 Overview

The window docking system provides a desktop-like experience within the browser workspace, allowing users to:

- **Drag windows** freely within the workspace
- **Resize windows** from edges and corners
- **Snap to edges** (left, right, top, bottom) for half-screen layouts
- **Snap to other windows** for side-by-side or stacked arrangements
- **See visual feedback** with ghost previews showing where windows will dock
- **Magnetic alignment** within a configurable threshold (default 16px)

## 📁 Architecture

### Core Components

```
src/workspace/
├── DockingManager.ts      # Pure docking logic (no React/DOM)
├── DockingOverlay.tsx     # Visual feedback component
├── DesktopWindow.tsx      # Draggable/resizable window component
├── Workspace.tsx          # Container managing all windows
└── WindowDockingDemo.tsx  # Demo application
```

### Component Hierarchy

```
Workspace
├── DesktopWindow (multiple instances)
│   ├── Title bar (drag handle)
│   ├── Content area
│   └── Resize handles (8 directions)
└── DockingOverlay (ghost preview)
```

## 🔧 API Reference

### DockingManager

**Pure computation module** - no side effects, fully testable.

#### `computeDockingPreview()`

```typescript
function computeDockingPreview(
  draggingWindow: WindowLayout,
  otherWindows: WindowLayout[],
  workspaceRect: WorkspaceRect,
  snapThreshold: number = 16
): DockingResult | null
```

**Purpose:** Calculate where a window should dock based on its position.

**Returns:**
- `DockingResult` if docking should occur
- `null` if no docking target is found

**Example:**
```typescript
const preview = computeDockingPreview(
  { id: 'win1', x: 10, y: 20, width: 400, height: 300 },
  [{ id: 'win2', x: 500, y: 20, width: 400, height: 300 }],
  { x: 0, y: 0, width: 1200, height: 800 },
  16
);

if (preview) {
  console.log(`Dock to ${preview.dockPosition}`);
  // Apply preview.x, preview.y, preview.width, preview.height
}
```

#### Types

```typescript
interface WindowLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive?: boolean;
}

interface DockingResult {
  x: number;
  y: number;
  width: number;
  height: number;
  dockTargetId?: string;
  dockPosition?: 'left' | 'right' | 'top' | 'bottom' | 'center';
}

interface WorkspaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

### DesktopWindow

**React component** for individual draggable/resizable windows.

#### Props

```typescript
interface DesktopWindowProps {
  layout: WindowLayout;
  onDrag?: (id: string, x: number, y: number) => void;
  onDragEnd?: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onClick?: (id: string) => void;
  title?: string;
  children?: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}
```

#### Example

```typescript
<DesktopWindow
  layout={{ id: 'win1', x: 100, y: 100, width: 400, height: 300 }}
  title="My Window"
  onDrag={(id, x, y) => updatePosition(id, x, y)}
  onDragEnd={(id) => applyDocking(id)}
  onResize={(id, w, h) => updateSize(id, w, h)}
>
  <div>Window content here</div>
</DesktopWindow>
```

#### Features

- ✅ Drag from title bar
- ✅ Resize from 8 handles (corners + edges)
- ✅ Active state highlighting
- ✅ Minimize/maximize/close buttons
- ✅ Smooth animations
- ✅ Respects min width/height

---

### DockingOverlay

**React component** for visual docking feedback.

#### Props

```typescript
interface DockingOverlayProps {
  preview: DockingResult | null;
  workspaceRect: DOMRect | null;
}
```

#### Example

```typescript
<DockingOverlay 
  preview={dockingPreview} 
  workspaceRect={workspaceRect} 
/>
```

#### Visual Design

- **Blue** ghost: Left/right edge snapping
- **Green** ghost: Top/bottom edge snapping
- **Purple** ghost: Center (tabbed) docking
- **Label**: Shows dock position ("Dock Left", etc.)
- **Animation**: Smooth fade-in and transitions

---

### Workspace

**Main container** managing multiple windows with docking integration.

#### Props

```typescript
interface WorkspaceProps {
  initialWindows?: WindowLayout[];
  onWindowsChange?: (windows: WindowLayout[]) => void;
  snapThreshold?: number;
  renderWindowContent?: (windowId: string) => React.ReactNode;
}
```

#### Example

```typescript
<Workspace
  initialWindows={[
    { id: 'w1', x: 50, y: 50, width: 400, height: 300 },
    { id: 'w2', x: 500, y: 100, width: 350, height: 250 },
  ]}
  snapThreshold={16}
  renderWindowContent={(id) => <MyAppComponent windowId={id} />}
  onWindowsChange={(windows) => saveLayout(windows)}
/>
```

#### State Management

The workspace manages:
- Window positions and sizes
- Active window tracking
- Docking preview state
- Drag state

---

### useWorkspaceWindows Hook

**Custom hook** for programmatic window management.

```typescript
const {
  windows,
  addWindow,
  removeWindow,
  updateWindow,
  activateWindow,
  setWindows,
} = useWorkspaceWindows(initialWindows);
```

#### API

```typescript
// Add a new window
addWindow({
  id: 'new-window',
  x: 100,
  y: 100,
  width: 400,
  height: 300,
});

// Remove a window
removeWindow('window-id');

// Update window properties
updateWindow('window-id', { x: 200, y: 150 });

// Activate (bring to front)
activateWindow('window-id');

// Replace all windows
setWindows([...newWindowList]);
```

---

## 🎮 Usage Examples

### Basic Usage

```typescript
import { Workspace } from './workspace';

function MyApp() {
  return (
    <Workspace
      initialWindows={[
        { id: 'win1', x: 100, y: 100, width: 400, height: 300 },
      ]}
    />
  );
}
```

### With Custom Content

```typescript
function MyApp() {
  const renderContent = (windowId: string) => {
    return <MyCustomComponent id={windowId} />;
  };

  return (
    <Workspace
      renderWindowContent={renderContent}
      snapThreshold={20} // Larger snap distance
    />
  );
}
```

### Dynamic Window Management

```typescript
function MyApp() {
  const { windows, addWindow, removeWindow } = useWorkspaceWindows();

  const handleAddWindow = () => {
    addWindow({
      id: `win-${Date.now()}`,
      x: Math.random() * 400,
      y: Math.random() * 300,
      width: 400,
      height: 300,
    });
  };

  return (
    <>
      <button onClick={handleAddWindow}>Add Window</button>
      <Workspace 
        initialWindows={windows}
        onWindowsChange={(newWindows) => {
          // Save to persistence layer
          saveLayout(newWindows);
        }}
      />
    </>
  );
}
```

---

## 🎨 Docking Behavior

### Edge Snapping

When a window is dragged within `snapThreshold` pixels of a workspace edge:

| Edge   | Behavior                        | Preview Color |
|--------|---------------------------------|---------------|
| Left   | Snap to left half (50% width)   | Blue          |
| Right  | Snap to right half (50% width)  | Blue          |
| Top    | Snap to top half (50% height)   | Green         |
| Bottom | Snap to bottom half (50% height)| Green         |

### Window-to-Window Snapping

When a window is dragged near another window:

- **Left/Right**: Aligns heights, positions side-by-side
- **Top/Bottom**: Aligns widths, positions stacked
- **Center**: Overlays when centers align and 70%+ overlap

### Priority

1. **Workspace edges** (checked first)
2. **Window-to-window** (checked second)
3. Best match selected by closest distance

---

## 🎭 Visual Feedback

### Ghost Preview

- **Semi-transparent rectangle** showing dock target
- **Colored border** indicating dock type
- **Label** showing action ("Dock Left", etc.)
- **Smooth transitions** (0.15s ease-out)

### Window States

| State      | Visual                              |
|------------|-------------------------------------|
| Active     | Blue border, elevated shadow        |
| Inactive   | Gray border, subtle shadow          |
| Dragging   | Cursor: grabbing, no transitions    |
| Resizing   | Directional cursor, no transitions  |

---

## ⚡ Performance

### Optimizations

1. **Pure computation**: DockingManager has no side effects
2. **Minimal re-renders**: Only updates during drag/resize
3. **Request animation frame**: Could be added for throttling (optional)
4. **CSS transitions disabled during drag**: Prevents jank

### Recommendations

- Use `snapThreshold` of 12-20px for best UX
- Limit to ~10 concurrent windows for smooth performance
- Consider virtualization for 20+ windows

---

## 🧪 Testing

### Unit Tests (DockingManager)

```typescript
import { computeDockingPreview } from './DockingManager';

test('snaps to left edge', () => {
  const result = computeDockingPreview(
    { id: 'w1', x: 5, y: 100, width: 400, height: 300 },
    [],
    { x: 0, y: 0, width: 1200, height: 800 },
    16
  );

  expect(result).toEqual({
    x: 0,
    y: 0,
    width: 600,
    height: 800,
    dockPosition: 'left',
  });
});
```

### Integration Tests

- Test drag-and-drop flows
- Test window overlap detection
- Test edge cases (multiple windows, small workspace)

---

## 🎨 Customization

### Theming

The system uses CSS variables for colors:

```css
--theme-primary: #667eea;
--theme-bg-primary: #1a1a1a;
--theme-bg-secondary: #2a2a2a;
--theme-border-primary: #333;
--theme-text-primary: #fff;
--theme-text-secondary: #999;
```

### Snap Threshold

Adjust via prop:

```typescript
<Workspace snapThreshold={24} /> // More forgiving snapping
```

### Overlay Colors

Modify `DockingOverlay.tsx` color functions:

```typescript
const getOverlayColor = (position?: string): string => {
  // Custom color logic
};
```

---

## 🚀 Demo Application

Run the demo:

```typescript
import { WindowDockingDemo } from './workspace/WindowDockingDemo';

function App() {
  return <WindowDockingDemo />;
}
```

The demo includes:
- Pre-configured windows
- "Add Window" button
- "Clear All" button
- Interactive instructions
- Visual feedback
- Debug info (dev mode only)

---

## 🔮 Future Enhancements

Potential improvements:

- [ ] **Tab groups**: Merge windows into tabbed containers
- [ ] **Persistence**: Auto-save layouts to localStorage
- [ ] **Keyboard shortcuts**: Alt+Arrow for snapping
- [ ] **Touch support**: Mobile/tablet gestures
- [ ] **Window stacking**: Z-index management
- [ ] **Animations**: Smooth dock transitions
- [ ] **Min/Max/Close**: Fully functional window controls
- [ ] **Multi-monitor**: Detect and use screen bounds
- [ ] **Snap guides**: Show alignment lines
- [ ] **Grid snapping**: Optional pixel grid alignment

---

## 📚 Related Documentation

- [Workspace README](./README.md) - FlexLayout docking system
- [LayoutManager](../core/components/LayoutManager.ts) - Layout persistence
- [WorkspaceDock](./WorkspaceDock.tsx) - Tab-based docking

---

## 🤝 Contributing

When extending this system:

1. Keep `DockingManager.ts` **pure** (no React, no DOM)
2. Add tests for new docking behaviors
3. Update types in all relevant files
4. Document new props and behaviors
5. Test with various screen sizes

---

## 📝 License

Part of the FinDesktop project.
