# Theme Customization Guide

This application uses a Bloomberg-inspired dark theme with CSS variables for easy customization.

## Theme System

All theme variables are defined in `src/theme.css` using CSS custom properties (variables). This allows you to easily override the theme to match your organization's brand.

## How to Customize

### Option 1: Override in Your Own CSS File

Create a custom CSS file (e.g., `custom-theme.css`) and import it after the default theme:

```css
/* custom-theme.css */
:root {
  /* Change primary color from orange to blue */
  --theme-primary: #0066cc;
  --theme-primary-dark: #0052a3;
  --theme-primary-light: #3399ff;
  
  /* Make backgrounds lighter */
  --theme-bg-primary: #1a1a2e;
  --theme-bg-secondary: #2a2a3e;
  
  /* Adjust font sizes */
  --theme-font-size-base: 14px;
}
```

Then import it in `main.tsx`:
```typescript
import './theme.css'
import './custom-theme.css'  // Your overrides
```

### Option 2: Modify theme.css Directly

Edit `src/theme.css` and change the variable values directly.

## Available Theme Variables

### Color Palette
```css
--theme-primary: #ff8c00;           /* Main accent color (orange) */
--theme-primary-dark: #ff6600;      /* Darker shade */
--theme-primary-light: #ffaa33;     /* Lighter shade */

--theme-success: #00a86b;           /* Green for buy/positive */
--theme-danger: #dc143c;            /* Red for sell/negative */
--theme-warning: #ffa500;           /* Warning color */
--theme-info: #4a9eff;              /* Info color */
```

### Background Colors
```css
--theme-bg-primary: #0a0a0a;        /* Darkest - main background */
--theme-bg-secondary: #1a1a1a;      /* Dark - cards, panels */
--theme-bg-tertiary: #2a2a2a;       /* Medium - hover states */
```

### Border Colors
```css
--theme-border-primary: #2a2a2a;
--theme-border-secondary: #3a3a3a;
--theme-border-focus: var(--theme-primary);
```

### Text Colors
```css
--theme-text-primary: #ffffff;      /* Main text */
--theme-text-secondary: #888888;    /* Secondary text */
--theme-text-tertiary: #666666;     /* Tertiary text */
--theme-text-disabled: #444444;     /* Disabled state */
```

### Typography
```css
--theme-font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
--theme-font-size-xs: 9px;
--theme-font-size-sm: 10px;
--theme-font-size-md: 11px;
--theme-font-size-base: 12px;
--theme-font-size-lg: 13px;
--theme-font-size-xl: 14px;
--theme-font-size-2xl: 16px;

--theme-font-weight-normal: 400;
--theme-font-weight-medium: 600;
--theme-font-weight-bold: 700;
```

### Spacing
```css
--theme-spacing-xs: 4px;
--theme-spacing-sm: 8px;
--theme-spacing-md: 12px;
--theme-spacing-lg: 16px;
--theme-spacing-xl: 20px;
```

### Border Radius
```css
--theme-radius-none: 0;
--theme-radius-sm: 2px;
--theme-radius-md: 4px;
```

### Transitions
```css
--theme-transition-fast: 0.15s ease;
--theme-transition-normal: 0.2s ease;
```

### Shadows
```css
--theme-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
--theme-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
--theme-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
```

## Using Theme Variables in Components

### In JSX Inline Styles
```tsx
<div style={{
  backgroundColor: 'var(--theme-bg-secondary)',
  color: 'var(--theme-text-primary)',
  padding: 'var(--theme-spacing-md)',
  borderRadius: 'var(--theme-radius-sm)'
}}>
  Content
</div>
```

### In CSS Files
```css
.my-component {
  background-color: var(--theme-bg-secondary);
  color: var(--theme-text-primary);
  padding: var(--theme-spacing-md);
  border-radius: var(--theme-radius-sm);
}
```

## Pre-built Style Classes

The theme includes some utility classes:

### Buttons
```tsx
<button className="btn-primary">Primary Button</button>
<button className="btn-buy">Buy</button>
<button className="btn-sell">Sell</button>
```

### Inputs
```tsx
<input className="input-dark" placeholder="Enter value" />
```

### Labels
```tsx
<label className="label-primary">Field Name</label>
```

## DataGrid Theming

The DataGrid component from `react-open-source-grid` is automatically themed with dark mode. You can also use these themes:

```tsx
<DataGrid 
  theme="dark"  // Recommended for this theme
  // Other available themes:
  // 'quartz', 'alpine', 'material', 
  // 'nord', 'dracula', 'solarized-dark', 
  // 'monokai', 'one-dark'
/>
```

## Example: Light Theme Override

If you prefer a light theme, create `light-theme.css`:

```css
:root {
  --theme-primary: #0066cc;
  --theme-bg-primary: #ffffff;
  --theme-bg-secondary: #f5f5f5;
  --theme-bg-tertiary: #e0e0e0;
  --theme-border-primary: #d0d0d0;
  --theme-border-secondary: #c0c0c0;
  --theme-text-primary: #1a1a1a;
  --theme-text-secondary: #666666;
  --theme-text-tertiary: #888888;
}
```

## Example: Corporate Blue Theme

```css
:root {
  --theme-primary: #0052cc;
  --theme-primary-dark: #003d99;
  --theme-primary-light: #3385ff;
  --theme-success: #36b37e;
  --theme-danger: #de350b;
}
```

## Tips

1. **Test Your Changes**: After modifying theme variables, test all components to ensure proper contrast and readability.

2. **Maintain Consistency**: Keep color relationships consistent (e.g., if you lighten `--theme-bg-primary`, also lighten `--theme-bg-secondary`).

3. **Accessibility**: Ensure sufficient contrast between text and background colors (WCAG AA minimum: 4.5:1 for normal text).

4. **Use Browser DevTools**: Use browser inspect tools to preview variable changes in real-time before committing.

5. **Dark Mode Considerations**: If creating a light theme, remember to adjust DataGrid theme from "dark" to an appropriate light theme.
