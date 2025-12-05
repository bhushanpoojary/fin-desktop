# Shell Module

The Shell module provides the main application shell components for managing the app lifecycle, initialization, and splash screen.

## Components

### AppShell

Main application shell that orchestrates the initialization sequence and splash screen display.

**Features:**
- Displays splash screen during initialization
- Manages layout manager workspace loading
- Initializes desktop API / event bus
- Smooth transitions between splash and main workspace
- Error handling with reload capability
- Customizable splash component

**Usage:**

```tsx
import { AppShell } from './shell';
import { DefaultBranding } from './core/defaults/DefaultBranding';

function App() {
  return (
    <AppShell
      branding={new DefaultBranding()}
      onInitComplete={() => console.log('App ready!')}
      onInitError={(err) => console.error('Init failed:', err)}
    />
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `branding` | `IProductBranding` | `DefaultBranding` | Product branding configuration |
| `layoutManager` | `ILayoutManager` | Auto-created | Layout manager instance |
| `splashComponent` | `ComponentType` | `SplashScreen` | Custom splash screen component |
| `onInitComplete` | `() => void` | - | Callback when initialization completes |
| `onInitError` | `(error: Error) => void` | - | Callback when initialization fails |

### SplashScreen

Branded splash screen component displayed during app initialization.

**Features:**
- Full-screen overlay with centered content
- Displays logo, product name, and tagline
- Animated status text
- Loading spinner
- Fade-in/fade-out animations
- Responsive design
- Uses branding colors for gradient background

**Usage:**

```tsx
import { SplashScreen } from './shell';
import { DefaultBranding } from './core/defaults/DefaultBranding';

function MyCustomShell() {
  const [isLoading, setIsLoading] = useState(true);
  const branding = new DefaultBranding();

  return (
    <>
      <SplashScreen
        branding={branding}
        statusText="Loading workspace..."
        isVisible={isLoading}
      />
      {!isLoading && <MainApp />}
    </>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `branding` | `IProductBranding` | Required | Product branding configuration |
| `statusText` | `string` | `'Initializing...'` | Status message to display |
| `className` | `string` | `''` | Additional CSS classes |
| `isVisible` | `boolean` | `true` | Controls fade-in/fade-out animation |

## Customization

### Custom Branding

Provide your own branding implementation:

```tsx
import { AppShell } from './shell';
import { CustomBranding } from './extensions/CustomBranding';

function App() {
  return <AppShell branding={new CustomBranding()} />;
}
```

### Custom Splash Screen

Replace the splash screen entirely:

```tsx
import { AppShell } from './shell';
import type { IProductBranding } from './core/interfaces/IProductBranding';

const MySplash: React.FC<{ branding: IProductBranding; statusText?: string }> = 
  ({ branding, statusText }) => (
    <div className="my-custom-splash">
      <h1>{branding.getProductName()}</h1>
      <p>{statusText}</p>
    </div>
  );

function App() {
  return <AppShell splashComponent={MySplash} />;
}
```

### Custom Initialization Logic

Extend AppShell for custom initialization workflows:

```tsx
import { AppShell } from './shell';
import type { AppShellProps } from './shell';

function MyAppShell(props: AppShellProps) {
  const handleInitComplete = () => {
    // Custom post-initialization logic
    console.log('Running custom initialization...');
    props.onInitComplete?.();
  };

  return <AppShell {...props} onInitComplete={handleInitComplete} />;
}
```

### Custom Styling

Override splash screen styles by importing your own CSS after the default:

```tsx
import './shell/SplashScreen.css';
import './my-custom-splash.css'; // Your overrides
```

Or provide a custom `className`:

```tsx
<SplashScreen
  branding={branding}
  statusText="Loading..."
  className="my-custom-splash"
/>
```

## Integration with Main App

To integrate AppShell into your main application:

1. **Update main.tsx:**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './shell';
import { DefaultBranding } from './core/defaults/DefaultBranding';
import './index.css';
import './theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell
      branding={new DefaultBranding()}
      onInitComplete={() => console.log('✅ App initialized')}
    />
  </StrictMode>
);
```

2. **For development/testing:**

You can still use URL parameters to bypass the shell:

```tsx
const params = new URLSearchParams(window.location.search);
const skipShell = params.get('skipShell');

const app = skipShell 
  ? <WorkspaceShell /> 
  : <AppShell branding={new DefaultBranding()} />;
```

## Architecture Notes

### Initialization Sequence

1. **Layout Manager Loading**
   - Loads saved workspace layout from storage
   - Falls back to default if none exists
   - Sets `isLayoutReady` when complete

2. **Desktop API Initialization**
   - Verifies `window.desktopApi` availability
   - Initializes event bus / FDC3 layer
   - Sets `isDesktopApiReady` when complete
   - Gracefully handles browser mode (no Electron)

3. **Transition**
   - Both ready → triggers fade-out animation
   - Waits for fade-out (500ms) → renders WorkspaceShell
   - Calls `onInitComplete` callback

### Error Handling

- Layout errors are logged but allow app to continue with default layout
- Desktop API errors allow browser mode fallback
- Critical errors show an error UI with reload button

### Performance

- Parallel initialization of layout and desktop API
- Minimal splash screen overhead (~500ms transition)
- No blocking operations on the main thread

## Future Enhancements

### ISplashProvider Interface

For fully pluggable splash behavior:

```tsx
interface ISplashProvider {
  renderSplash(branding: IProductBranding, statusText: string): React.ReactNode;
  onInitStart?(): void;
  onInitComplete?(): void;
}
```

### Preload Strategy

Add resource preloading during splash:

```tsx
interface PreloadConfig {
  scripts?: string[];
  stylesheets?: string[];
  fonts?: string[];
}
```

## Testing

### Manual Testing

1. **Normal flow:** `npm run dev` → should show splash → transitions to workspace
2. **Slow network:** Throttle network to see extended splash
3. **Error handling:** Disable desktopApi to test error state
4. **Responsive:** Test on different screen sizes

### Unit Testing

```tsx
import { render, waitFor } from '@testing-library/react';
import { AppShell } from './AppShell';

test('shows splash then workspace', async () => {
  const onComplete = jest.fn();
  const { queryByText } = render(
    <AppShell onInitComplete={onComplete} />
  );
  
  // Splash visible initially
  expect(queryByText(/Initializing/i)).toBeInTheDocument();
  
  // Workspace visible after init
  await waitFor(() => expect(onComplete).toHaveBeenCalled());
});
```

## See Also

- [IProductBranding Interface](../core/interfaces/IProductBranding.ts)
- [ILayoutManager Interface](../layout/ILayoutManager.ts)
- [WorkspaceShell Component](../workspace/WorkspaceShell.tsx)
- [DefaultBranding](../core/defaults/DefaultBranding.ts)
