# 🎨 Theme Engine Testing Guide

## Quick Start

### Option 1: Dedicated Test Page (Recommended)
The easiest way to test all theme features:

```bash
npm run dev
```

Then open: **http://localhost:5173/?test=theme**

This gives you:
- ✅ All 6 themes with visual previews
- ✅ Complete color palette showcase
- ✅ Component examples (buttons, cards, forms, alerts)
- ✅ Density comparisons (SD/HD/UHD)
- ✅ All 3 ThemeSwitcher variants
- ✅ Interactive theme switching with click-to-apply

---

## Test Page Features

### 🎨 Color Palette Section
- Visual swatches for all theme colors
- Shows both hex values and CSS variable names
- Background, Surface, Primary, Accent, Text, Danger, Success, Border

### 🧩 Component Showcase
Test how your components look in different themes:
- **Buttons**: Primary, Secondary, Danger, Success
- **Cards**: Standard and accent-bordered cards
- **Forms**: Text inputs and selects
- **Alerts**: Info, Success, Warning, Danger
- **Badges**: Various states and colors

### 📏 Density Demo
Compare spacing across all 3 density levels:
- **SD (Compact)**: 0.75x spacing - Dense layouts for power users
- **HD (Balanced)**: 1.0x spacing - Default comfortable layout
- **UHD (Spacious)**: 1.25x spacing - Accessibility-friendly

### 🔄 Theme Switcher Variants
Try all 3 switcher components:
- **Dropdown**: Space-efficient select menu
- **Button Group**: Visual theme preview buttons
- **Compact**: Icon + text for toolbars

### 🖼️ Theme Gallery
Click any theme card to instantly switch themes:
- Visual color preview with 4 key colors
- Density and border radius info
- Active theme highlighted
- Descriptions for context

---

## Integration Examples

### Example 1: Add to Main App Shell
To use themes in your main app, wrap with `ThemeProvider`:

**src/shell/AppShell.tsx**
```tsx
import { ThemeProvider } from '../core/theme/ThemeManager';
import { finDesktopConfig } from '../config/FinDesktopConfig';
import { CompactThemeSwitcher } from '../ui/ThemeSwitcher';
import '../ui/ThemeSwitcher.css';

export function AppShell() {
  return (
    <ThemeProvider 
      themes={finDesktopConfig.themes!} 
      initialThemeName="dark"
    >
      <div className="app-shell">
        <header className="app-header">
          <h1>FinDesktop</h1>
          <CompactThemeSwitcher />
        </header>
        
        {/* Your existing app content */}
        <WorkspaceShell />
      </div>
    </ThemeProvider>
  );
}
```

### Example 2: Add to Launcher
Quick theme switching in the launcher:

**src/main-workspace/App.tsx**
```tsx
import { ThemeProvider, useTheme } from '../core/theme/ThemeManager';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { finDesktopConfig } from '../config/FinDesktopConfig';

function LauncherContent() {
  const { theme } = useTheme();
  
  return (
    <div className="launcher">
      <header>
        <h2>App Launcher</h2>
        <ThemeSwitcher variant="dropdown" />
      </header>
      
      <p>Current theme: {theme.displayName}</p>
      {/* Your launcher content */}
    </div>
  );
}

export default function WorkspaceApp() {
  return (
    <ThemeProvider themes={finDesktopConfig.themes!}>
      <LauncherContent />
    </ThemeProvider>
  );
}
```

### Example 3: Custom Component Using Theme
Access current theme in any component:

```tsx
import { useTheme } from '../core/theme/ThemeManager';

function MyCustomCard() {
  const { theme } = useTheme();
  
  return (
    <div 
      className="custom-card"
      style={{
        background: theme.palette.surface,
        borderColor: theme.palette.border,
        padding: `calc(${theme.density === 'uhd' ? '1.25' : '1'}rem)`,
        borderRadius: `${theme.borderRadius}px`
      }}
    >
      <h3 style={{ color: theme.palette.text }}>
        Card Title
      </h3>
      <p style={{ color: theme.palette.textMuted }}>
        This card adapts to the active theme.
      </p>
    </div>
  );
}
```

---

## Available Themes

| Theme | Description | Best For |
|-------|-------------|----------|
| **Light** | Professional light mode | Day work, bright environments |
| **Dark** | Default dark mode | Default experience, reduced eye strain |
| **Terminal** | Bloomberg-style green-on-black | Financial traders, terminal emulation |
| **Finance Green** | Emerald-tinted dark | Finance apps, professional dark UI |
| **Blue Professional** | Corporate blue theme | Enterprise apps, professional contexts |
| **High Contrast** | Black/white accessibility | Users with vision impairments |

---

## Testing Checklist

- [ ] Load test page: `http://localhost:5173/?test=theme`
- [ ] Verify all 6 themes load
- [ ] Switch between themes using dropdown
- [ ] Check color palette displays correctly
- [ ] Test all button variants
- [ ] Verify cards and forms render properly
- [ ] Compare density levels (SD/HD/UHD)
- [ ] Check theme persistence (refresh page)
- [ ] Test compact switcher in toolbar
- [ ] Verify CSS variables update on theme change
- [ ] Check border radius changes per theme
- [ ] Test theme switching in your actual app

---

## CSS Variable Reference

All themes expose these CSS variables for consistent styling:

```css
--fd-bg           /* Background color */
--fd-surface      /* Card/panel background */
--fd-primary      /* Primary brand color */
--fd-accent       /* Accent/highlight color */
--fd-text         /* Main text color */
--fd-text-muted   /* Secondary/muted text */
--fd-danger       /* Error/danger color */
--fd-success      /* Success/positive color */
--fd-border       /* Border color */
--fd-shadow       /* Box shadow color */
--fd-radius       /* Border radius (px) */
--fd-spacing      /* Base spacing unit (8px * density) */
```

Use in your CSS:

```css
.my-component {
  background: var(--fd-surface);
  color: var(--fd-text);
  border: 1px solid var(--fd-border);
  border-radius: var(--fd-radius);
  padding: calc(var(--fd-spacing) * 2);
}
```

---

## Troubleshooting

### Theme not applying?
1. Ensure `ThemeProvider` wraps your component tree
2. Check `finDesktopConfig.themes` is defined
3. Verify you imported `ThemeSwitcher.css`

### Colors not updating?
1. Make sure you're using CSS variables (`var(--fd-*)`)
2. Check browser DevTools → Elements → Styles for `:root` variables
3. Clear localStorage: `localStorage.removeItem('finDesktop.theme')`

### ThemeSwitcher not showing?
1. Import the CSS: `import '../ui/ThemeSwitcher.css'`
2. Ensure component is inside `ThemeProvider`
3. Check console for errors

---

## Next Steps

1. **Test the theme page**: Open `http://localhost:5173/?test=theme`
2. **Integrate into your app**: Add `ThemeProvider` to your main component
3. **Customize themes**: Edit `src/extensions/themes.config.ts`
4. **Create new themes**: Add to the `customThemes` array
5. **Style your components**: Use CSS variables for theme-aware styling

---

## Files Created

- `src/workspace/ThemeTestApp.tsx` - Complete test application
- `src/workspace/ThemeTest.css` - Test page styles
- `src/main.tsx` - Updated with `?test=theme` route

## Files From Previous Implementation

- `src/core/theme/ThemeTypes.ts` - Type definitions
- `src/core/theme/ThemeManager.tsx` - React context provider
- `src/ui/ThemeSwitcher.tsx` - UI components
- `src/ui/ThemeSwitcher.css` - Component styles
- `src/extensions/themes.config.ts` - 6 pre-built themes
- `src/config/FinDesktopConfig.ts` - Config integration

---

**Happy theming! 🎨**
