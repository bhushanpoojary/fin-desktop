# Quick Start: Splash Screen + AppShell

Get up and running with the splash screen and app shell in 5 minutes.

## 1. Basic Setup (2 minutes)

### Install (Already done - part of the codebase)
```bash
# No installation needed - files are in src/shell/
```

### Update main.tsx
```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './shell';
import { DefaultBranding } from './core/defaults/DefaultBranding';
import { Fdc3Provider } from './fdc3/Fdc3Context';
import { LogStoreProvider } from './logging/LogStoreContext';
import './index.css';
import './theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fdc3Provider>
      <LogStoreProvider>
        <AppShell branding={new DefaultBranding()} />
      </LogStoreProvider>
    </Fdc3Provider>
  </StrictMode>
);
```

### Run
```bash
npm run dev
```

**That's it!** You should now see a splash screen on startup.

---

## 2. Customize Branding (2 minutes)

### Edit your branding
```tsx
// src/extensions/CustomBranding.ts (already exists)
export class CustomBranding implements IProductBranding {
  getProductName(): string {
    return 'My Financial Desktop';
  }

  getLogoUrl(): string {
    return '/my-logo.svg';  // Your logo
  }

  getTagline(): string {
    return 'Trade. Analyze. Win.';
  }

  getBrandColors(): BrandColors {
    return {
      primary: '#1e40af',    // Your primary color
      secondary: '#6b7280',
      accent: '#f59e0b',     // Your accent color
      background: '#ffffff',
    };
  }
  
  // ... implement other methods
}
```

### Use it
```tsx
// src/main.tsx
import { CustomBranding } from './extensions/CustomBranding';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell branding={new CustomBranding()} />  {/* ← Use your branding */}
  </StrictMode>
);
```

---

## 3. Add Callbacks (1 minute)

```tsx
// src/main.tsx
<AppShell
  branding={new DefaultBranding()}
  onInitComplete={() => {
    console.log('✅ App ready!');
    // Track analytics, etc.
  }}
  onInitError={(error) => {
    console.error('❌ Init failed:', error);
    // Send to error tracking service
  }}
/>
```

---

## Common Tasks

### Skip Splash for Development
Add `?skipSplash=true` to the URL:
```
http://localhost:5173/?skipSplash=true
```

Or programmatically:
```tsx
const skipSplash = new URLSearchParams(window.location.search).get('skipSplash');

if (skipSplash) {
  // Render workspace directly
} else {
  // Use AppShell
}
```

### Change Status Text Timing
The status text auto-updates based on what's loading:
- "Initializing application..." (both pending)
- "Loading workspace layout..." (layout pending)
- "Connecting to desktop bus..." (API pending)
- "Ready!" (both complete)

No configuration needed - it's automatic!

### Customize Splash Appearance

**Option 1: CSS Override**
```css
/* Your custom CSS file */
.splash-screen {
  /* Override background */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.splash-logo {
  width: 150px !important;  /* Larger logo */
}
```

**Option 2: Custom Component**
```tsx
const MySplash = ({ branding, statusText }) => (
  <div className="my-custom-splash">
    <h1>{branding.getProductName()}</h1>
    <p>{statusText}</p>
  </div>
);

<AppShell splashComponent={MySplash} />
```

### Change Animation Speed
Edit `src/shell/SplashScreen.css`:
```css
.splash-screen {
  transition: opacity 1s ease-in-out;  /* Change from 0.5s to 1s */
}
```

### Add Logo/Assets
1. Place your logo in `public/` folder: `public/my-logo.svg`
2. Update branding:
   ```tsx
   getLogoUrl(): string {
     return '/my-logo.svg';
   }
   ```

---

## Troubleshooting

### "Desktop API not available"
This is normal in browser mode. The app will work without Electron features.

To suppress the warning:
```tsx
// AppShell handles this gracefully - no action needed
```

### Splash Never Disappears
Check browser console for errors. Common causes:
- Layout manager threw an error
- Desktop API failed to initialize
- React error during render

Reload the page - the error UI should appear.

### Logo Doesn't Load
1. Check the path in `getLogoUrl()`
2. Ensure logo exists in `public/` folder
3. Check browser console for 404 errors

### Splash Appears Too Fast
This is intentional! Fast is good. If you want to slow it down for testing:
```tsx
// Add artificial delay (TESTING ONLY)
useEffect(() => {
  const timer = setTimeout(() => {
    setIsLayoutReady(true);
  }, 3000);  // 3 second delay
  return () => clearTimeout(timer);
}, []);
```

---

## Next Steps

1. ✅ **You're done!** The splash screen is working.
2. 📖 Read [README.md](./README.md) for advanced features
3. 🎨 Customize the branding in `/extensions`
4. 🧪 Review [example-integration.tsx](./example-integration.tsx) for more examples
5. 📚 Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details

---

## Need Help?

- **Not working?** Check the browser console for errors
- **Want to customize?** See [README.md](./README.md) customization section
- **Questions?** Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

**Enjoy your new splash screen! 🚀**
