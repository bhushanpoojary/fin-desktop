# Testing the Workspace Docking Feature

## Step 1: Install FlexLayout

First, install the required dependency:

```bash
npm install flexlayout-react
```

## Step 2: Update main.tsx to use the test app

Temporarily modify `src/main.tsx` to render the workspace dock test app:

```typescript
// Add this import at the top
import WorkspaceDockTestApp from './workspace/WorkspaceDockTestApp'

// Then change the default component to:
if (entry === 'workspace') {
  AppComponent = <WorkspaceDockTestApp />  // Changed from <WorkspaceApp />
} else if (entry === 'app' && appId) {
  AppComponent = <AppHost appId={appId} />
} else {
  AppComponent = <WorkspaceDockTestApp />  // Changed from <WorkspaceApp />
}
```

**OR** you can directly replace the main.tsx content with the workspace test:

## Step 3: Start the dev server

```bash
npm run dev
```

## Step 4: Test the Features

Once the app loads, you'll see:
- **Left sidebar**: Launcher with all available apps
- **Right area**: Workspace dock (starts with a "Welcome" tab)

### Features to Test:

#### 1. **Opening Apps**
- Click any app in the launcher (e.g., "Order Ticket", "Instrument Source")
- The app should open as a new tab in the workspace

#### 2. **Multiple Tabs**
- Open several apps
- Click tabs to switch between them
- Close tabs using the X button

#### 3. **Split Views (Horizontal)**
- Drag a tab to the **bottom edge** of the workspace
- A blue drop zone will appear
- Release to create a horizontal split

#### 4. **Split Views (Vertical)**
- Drag a tab to the **right edge** of the workspace
- A blue drop zone will appear
- Release to create a vertical split

#### 5. **Reorder Tabs**
- Drag a tab left or right within the same tab bar
- Reorder tabs as needed

#### 6. **Floating Windows**
- Drag a tab outside the main window area
- OR: Modify the test app to open with `float: true`:
  ```typescript
  dockRef.current?.openApp(app.id, {
    title: app.title,
    float: true,  // Change this to true
  });
  ```

#### 7. **Layout Persistence**
- Open several apps and arrange them in splits
- Click "Save Layout" button at the top
- Refresh the page - your layout should restore!

#### 8. **Maximize Tabset**
- Click the maximize icon in the tab bar header
- The tabset will fill the entire workspace
- Click again to restore

## Troubleshooting

### "Cannot find module 'flexlayout-react'"
Run: `npm install flexlayout-react`

### Tabs not opening
Check the browser console for errors. Make sure all apps are registered in `src/workspace/appRegistry.ts`

### Layout not saving
Verify that `ILayoutManager` is properly configured in your project

### Apps showing "App not registered"
The app ID might not match. Check:
1. The ID used in `demo-apps.json` (in `public/config/`)
2. The ID in `src/workspace/appRegistry.ts`

Common app IDs:
- `instrument-source`
- `instrument-target`
- `fdc3-events-log`
- `order-ticket`
- `news`
- `live-market`

## Quick Test Without Modifying main.tsx

Alternatively, create a test route:

1. Add a new entry point in your router or create a test HTML file
2. Import and render `WorkspaceDockTestApp`
3. Navigate to that route

## Expected Behavior

✅ Apps open in tabs
✅ Drag tabs to split horizontally/vertically
✅ Drag tabs to reorder
✅ Close tabs
✅ Maximize/restore tabsets
✅ Layout persists after page refresh
✅ FDC3 context sharing works between docked apps

## Next Steps After Testing

Once you've verified everything works:

1. Integrate into your main `WorkspaceApp` component
2. Remove the test app or keep it for demos
3. Customize styling to match your design system
4. Add additional apps to the registry as needed

## Advanced Testing

### Test FDC3 Context Sharing
1. Open "Instrument Source" app
2. Open "Instrument Target" app in a split
3. Select an instrument in the source app
4. Verify the target app receives and displays the context

### Test with Layout Manager
1. Create multiple layout arrangements
2. Save them with different names
3. Switch between layouts
4. Verify each layout restores correctly
