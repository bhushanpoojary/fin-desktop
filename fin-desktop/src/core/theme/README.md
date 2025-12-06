# Theme Engine Documentation

Complete theming system for FinDesktop with dynamic theme switching and CSS variable integration.

## Overview

The FinDesktop theme engine provides:
- ✅ Dynamic theme switching at runtime
- ✅ Persistent theme selection (localStorage)
- ✅ Automatic CSS variable synchronization
- ✅ Multiple built-in themes (light, dark, terminal, finance green, etc.)
- ✅ Easy custom theme creation
- ✅ Density control (sd/hd/uhd)
- ✅ Full TypeScript support

## Quick Start

### 1. Wrap Your App with ThemeProvider

```tsx
import { ThemeProvider } from './core/theme/ThemeManager';
import { finDesktopConfig } from './config/FinDesktopConfig';

function App() {
  return (
    <ThemeProvider 
      themes={finDesktopConfig.themes} 
      initialThemeName="dark"
    >
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Add Theme Switcher to Your UI

```tsx
import { ThemeSwitcher } from './ui/ThemeSwitcher';

function AppHeader() {
  return (
    <header>
      <h1>FinDesktop</h1>
      <ThemeSwitcher />
    </header>
  );
}
```

### 3. Use CSS Variables in Components

```css
.my-component {
  background-color: var(--fd-bg);
  color: var(--fd-text);
  border: 1px solid var(--fd-border);
  border-radius: var(--fd-radius);
  padding: calc(1rem * var(--fd-density-spacing));
}

.button-primary {
  background-color: var(--fd-primary);
  color: white;
}
```

## File Structure

```
src/
├── core/
│   └── theme/
│       ├── ThemeTypes.ts           # Type definitions
│       ├── ThemeManager.tsx        # React context & provider
│       ├── theme-examples.css      # Example CSS usage
│       └── README.md               # This file
├── ui/
│   └── ThemeSwitcher.tsx          # Theme switcher component
├── extensions/
│   └── themes.config.ts           # Custom theme definitions
└── config/
    └── FinDesktopConfig.ts        # Main config (includes themes)
```

## Built-in Themes

### Light Mode
- Clean professional light theme
- White background, dark text
- Blue primary, purple accent
- Density: hd (balanced)

### Dark Mode (Default)
- Modern dark theme with good contrast
- Near-black background, light text
- Blue primary, purple accent
- Density: hd (balanced)

### Terminal
- Classic Bloomberg-style terminal
- Pure black background, green text
- Monospace font (JetBrains Mono)
- Density: sd (compact)
- Sharp corners (borderRadius: 0)

### Finance Green
- Sophisticated emerald theme
- Dark green-tinted background
- Green primary, excellent for financial data
- Density: hd

### Blue Professional
- Corporate blue theme
- Blue-tinted dark background
- Professional appearance
- Density: hd

### High Contrast
- Maximum contrast for accessibility
- Pure black/white
- Large touch targets
- Density: uhd (spacious)

## Creating Custom Themes

### Step 1: Define Theme in extensions/themes.config.ts

```typescript
export const customThemes: ThemeRegistry = {
  // ... existing themes
  
  myCustomTheme: {
    name: 'myCustomTheme',
    displayName: 'My Custom Theme',
    palette: {
      background: '#1a1b26',
      surface: '#24283b',
      primary: '#7aa2f7',
      accent: '#bb9af7',
      text: '#c0caf5',
      textSecondary: '#565f89',
      danger: '#f7768e',
      success: '#9ece6a',
      warning: '#e0af68',
      info: '#7dcfff',
      border: '#3b4261',
    },
    density: 'hd',
    borderRadius: 6,
    fontFamily: 'Inter, sans-serif',
    metadata: {
      description: 'My awesome custom theme',
      tags: ['dark', 'custom'],
    },
  },
};
```

### Step 2: Theme is Automatically Available

No additional registration needed! The theme will appear in the ThemeSwitcher automatically.

## CSS Variables Reference

### Colors
- `--fd-bg` - Primary background
- `--fd-surface` - Surface/card background
- `--fd-primary` - Primary action color
- `--fd-accent` - Accent/highlight color
- `--fd-text` - Primary text
- `--fd-text-secondary` - Secondary text
- `--fd-danger` - Error/danger color
- `--fd-success` - Success color
- `--fd-warning` - Warning color
- `--fd-info` - Info color
- `--fd-border` - Border color

### Shape & Spacing
- `--fd-radius` - Border radius (e.g., "4px")
- `--fd-density` - Density level ("sd", "hd", "uhd")
- `--fd-density-spacing` - Spacing multiplier (0.75, 1.0, 1.25)

### Typography
- `--fd-font-family` - Font family

## Using the Theme Hook

```tsx
import { useTheme } from './core/theme/ThemeManager';

function MyComponent() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div>
      <h2>Current theme: {theme.name}</h2>
      
      <div style={{ 
        background: theme.palette.primary,
        color: 'white',
        padding: '1rem',
      }}>
        Primary color preview
      </div>

      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>

      <ul>
        {availableThemes.map(t => (
          <li key={t.name}>{t.displayName || t.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Density Levels

### SD (Standard Definition) - Compact
- Spacing multiplier: 0.75
- High information density
- Ideal for traders, power users
- Example: Terminal theme

### HD (High Definition) - Balanced
- Spacing multiplier: 1.0
- Comfortable spacing
- Default for most themes
- Good for general use

### UHD (Ultra High Definition) - Spacious
- Spacing multiplier: 1.25
- Large touch targets
- Better for accessibility
- Example: High Contrast theme

## Example: Responsive Padding with Density

```css
.card {
  /* Base padding scales with density */
  padding: calc(1rem * var(--fd-density-spacing));
}

/* Result:
   sd (0.75): padding = 0.75rem
   hd (1.0):  padding = 1rem
   uhd (1.25): padding = 1.25rem
*/
```

## Theme Switcher Variants

### Dropdown (Default)
```tsx
<ThemeSwitcher variant="dropdown" />
```

### Button Group
```tsx
<ThemeSwitcher variant="buttons" />
```

### Compact (Icon + Text)
```tsx
<CompactThemeSwitcher />
```

## Best Practices

### 1. Always Use CSS Variables
❌ **Don't:**
```css
.button {
  background-color: #3b82f6; /* Hard-coded */
}
```

✅ **Do:**
```css
.button {
  background-color: var(--fd-primary); /* Theme-aware */
}
```

### 2. Respect Density Spacing
❌ **Don't:**
```css
.card {
  padding: 16px; /* Fixed */
}
```

✅ **Do:**
```css
.card {
  padding: calc(1rem * var(--fd-density-spacing)); /* Scales */
}
```

### 3. Provide Fallbacks for Optional Colors
```css
.text-secondary {
  color: var(--fd-text-secondary, var(--fd-text));
}
```

### 4. Use Theme Metadata
```typescript
const traderThemes = availableThemes.filter(t => 
  t.metadata?.tags?.includes('trader')
);
```

## Accessibility

### High Contrast Theme
Built-in high contrast theme for users with visual impairments:
- Pure black/white colors
- Maximum contrast ratios
- Spacious density (uhd)

### Focus Indicators
All themes automatically support focus indicators:
```css
:focus-visible {
  outline: 2px solid var(--fd-primary);
  outline-offset: 2px;
}
```

### Color Contrast Testing
Test your custom themes for WCAG AA compliance:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

## Advanced Usage

### Dynamic Theme Creation
```typescript
const createDynamicTheme = (baseColor: string): Theme => ({
  name: 'dynamic',
  displayName: 'Dynamic',
  palette: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    primary: baseColor,
    // ... derive other colors
  },
  density: 'hd',
  borderRadius: 4,
});
```

### Theme Interpolation
```typescript
// Interpolate between two themes
const interpolateThemes = (
  theme1: Theme, 
  theme2: Theme, 
  t: number
): Theme => {
  // Implementation for smooth theme transitions
};
```

### Per-Component Theme Override
```tsx
function SpecialCard() {
  const { theme } = useTheme();
  
  return (
    <div style={{
      // Override specific colors while keeping others
      '--fd-primary': '#ff0000',
    } as React.CSSProperties}>
      <button>This button is always red</button>
    </div>
  );
}
```

## Troubleshooting

### Theme Not Persisting
Check localStorage is available:
```typescript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available');
}
```

### CSS Variables Not Updating
Ensure ThemeProvider is at the root:
```tsx
// ✅ Correct
<ThemeProvider themes={themes}>
  <App />
</ThemeProvider>

// ❌ Wrong
<App>
  <ThemeProvider themes={themes}>
    {/* ... */}
  </ThemeProvider>
</App>
```

### Theme Not Found Error
Check theme name matches registry:
```typescript
console.log('Available themes:', Object.keys(finDesktopConfig.themes));
```

## Testing

### Unit Testing with Themes
```tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from './core/theme/ThemeManager';

const mockThemes = {
  test: {
    name: 'test',
    palette: { /* ... */ },
    density: 'hd',
    borderRadius: 4,
  },
};

test('component renders with theme', () => {
  render(
    <ThemeProvider themes={mockThemes}>
      <MyComponent />
    </ThemeProvider>
  );
});
```

## Migration from Old Theming

If you have an existing theme system:

1. Convert color constants to Theme objects
2. Replace hard-coded colors with CSS variables
3. Wrap app with ThemeProvider
4. Test all components with different themes

## Performance

- ✅ CSS variables are hardware-accelerated
- ✅ Theme changes don't require React re-renders
- ✅ localStorage is accessed once on mount
- ✅ No runtime CSS-in-JS overhead

## Browser Support

- ✅ Chrome/Edge 49+
- ✅ Firefox 31+
- ✅ Safari 9.1+
- ✅ All modern browsers support CSS custom properties

## Future Enhancements

- [ ] Theme preview/comparison view
- [ ] Color picker for runtime theme customization
- [ ] Theme import/export
- [ ] Automatic dark mode detection
- [ ] Smooth theme transitions
- [ ] Theme scheduling (auto-switch based on time)

## Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Support

For issues or questions about theming:
1. Check this documentation
2. Review theme-examples.css for usage patterns
3. Inspect CSS variables in browser DevTools
4. Check console for ThemeManager logs
