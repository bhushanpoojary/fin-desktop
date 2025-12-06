/**
 * Theme Engine - Public API
 * 
 * Central export point for the FinDesktop theme system.
 */

// Core types
export type {
  Theme,
  ThemePalette,
  ThemeDensity,
  ThemeRegistry,
  ThemeName,
  CSSVariableName,
} from './ThemeTypes';

export {
  CSS_VARIABLES,
  DENSITY_SPACING,
} from './ThemeTypes';

// Theme management
export {
  ThemeProvider,
  useTheme,
  useCurrentTheme,
} from './ThemeManager';

export type {
  ThemeContextValue,
  ThemeProviderProps,
} from './ThemeManager';

/**
 * Usage Example:
 * 
 * ```typescript
 * import { ThemeProvider, useTheme, type Theme } from './core/theme';
 * import { finDesktopConfig } from './config/FinDesktopConfig';
 * 
 * // In your root App component:
 * function App() {
 *   return (
 *     <ThemeProvider themes={finDesktopConfig.themes} initialThemeName="dark">
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * 
 * // In any child component:
 * function MyComponent() {
 *   const { theme, setTheme, availableThemes } = useTheme();
 *   
 *   return (
 *     <div style={{ background: theme.palette.background }}>
 *       <h1>Current: {theme.name}</h1>
 *       <button onClick={() => setTheme('light')}>Switch to Light</button>
 *     </div>
 *   );
 * }
 * ```
 */
