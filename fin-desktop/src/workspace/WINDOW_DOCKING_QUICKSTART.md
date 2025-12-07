# Window Docking Quick Start

Get the window docking system running in 5 minutes.

## 🚀 Installation

The window docking system is built-in. No additional dependencies required.

## 📦 Import Components

```typescript
import { 
  Workspace, 
  useWorkspaceWindows,
  WindowDockingDemo 
} from './workspace';
```

## 🎯 Quick Examples

### 1. Run the Demo

**Fastest way to see it in action:**

```typescript
import { WindowDockingDemo } from './workspace/WindowDockingDemo';

function App() {
  return <WindowDockingDemo />;
}
```

### 2. Basic Workspace

```typescript
import { Workspace } from './workspace';

function App() {
  const initialWindows = [
    { id: 'win1', x: 100, y: 100, width: 400, height: 300 },
    { id: 'win2', x: 550, y: 150, width: 400, height: 300 },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Workspace initialWindows={initialWindows} />
    </div>
  );
}
```

### 3. Dynamic Windows

```typescript
import { Workspace, useWorkspaceWindows } from './workspace';

function App() {
  const { windows, addWindow, removeWindow } = useWorkspaceWindows([
    { id: 'win1', x: 100, y: 100, width: 400, height: 300 },
  ]);

  const handleAdd = () => {
    addWindow({
      id: `win-${Date.now()}`,
      x: Math.random() * 400,
      y: Math.random() * 300,
      width: 400,
      height: 300,
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button onClick={handleAdd}>Add Window</button>
      <Workspace 
        initialWindows={windows}
        renderWindowContent={(id) => (
          <div>
            <h3>Window {id}</h3>
            <button onClick={() => removeWindow(id)}>Close</button>
          </div>
        )}
      />
    </div>
  );
}
```

### 4. Custom Content

```typescript
import { Workspace } from './workspace';

function App() {
  const renderContent = (windowId: string) => {
    // Render different content based on window ID
    if (windowId === 'charts') {
      return <ChartComponent />;
    }
    if (windowId === 'orders') {
      return <OrdersComponent />;
    }
    return <div>Default content for {windowId}</div>;
  };

  return (
    <Workspace
      initialWindows={[
        { id: 'charts', x: 50, y: 50, width: 500, height: 400 },
        { id: 'orders', x: 600, y: 50, width: 500, height: 400 },
      ]}
      renderWindowContent={renderContent}
      snapThreshold={20}
    />
  );
}
```

## 🎮 User Actions

Once running, users can:

1. **Drag** windows by the title bar
2. **Resize** from any edge or corner
3. **Snap to left edge** → Half-screen left
4. **Snap to right edge** → Half-screen right
5. **Snap to top edge** → Half-screen top
6. **Snap to bottom edge** → Half-screen bottom
7. **Snap to other windows** → Aligned side-by-side
8. **Center over windows** → Overlay dock

## ⚙️ Configuration

### Adjust Snap Distance

```typescript
<Workspace snapThreshold={24} /> // Default is 16px
```

### Set Min/Max Size

```typescript
<DesktopWindow
  layout={windowLayout}
  minWidth={300}
  minHeight={200}
>
  {content}
</DesktopWindow>
```

### Handle Layout Changes

```typescript
<Workspace
  initialWindows={windows}
  onWindowsChange={(newWindows) => {
    console.log('Layout changed:', newWindows);
    // Save to localStorage, database, etc.
    localStorage.setItem('layout', JSON.stringify(newWindows));
  }}
/>
```

## 🎨 Styling

The system uses CSS variables. Customize in your global CSS:

```css
:root {
  --theme-primary: #667eea;
  --theme-bg-primary: #1a1a1a;
  --theme-bg-secondary: #2a2a2a;
  --theme-border-primary: #333;
  --theme-text-primary: #ffffff;
  --theme-text-secondary: #999999;
}
```

## 🐛 Troubleshooting

### Windows don't snap
- Check `snapThreshold` value (try increasing to 20-30)
- Ensure workspace has defined dimensions
- Verify workspace is positioned correctly

### Poor performance
- Reduce number of windows (recommend < 10)
- Disable transitions during drag
- Use `React.memo` on window content

### Windows overlap strangely
- Check initial positions don't overlap too much
- Verify workspace bounds are correct
- Use `useWorkspaceWindows` hook for state management

## 📚 Next Steps

- Read the [full documentation](./WINDOW_DOCKING_README.md)
- Check out [API reference](./WINDOW_DOCKING_README.md#api-reference)
- Explore [customization options](./WINDOW_DOCKING_README.md#customization)
- Review the [demo source](./WindowDockingDemo.tsx)

## 💡 Tips

- Start with 2-3 windows to understand behavior
- Use consistent window sizes for better UX
- Test at different screen sizes
- Consider persistence for production use
- Add keyboard shortcuts for power users

---

**Ready to go!** 🎉

Try the demo first, then integrate into your app.
