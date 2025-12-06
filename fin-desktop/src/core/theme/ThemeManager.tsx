/**
 * Theme Manager - React Context and Provider for Theme Management
 * 
 * This module provides theme management functionality including:
 * - React context for accessing current theme
 * - Theme switching with persistence
 * - Automatic CSS variable synchronization
 * - localStorage integration
 * 
 * ## Configuration
 * 
 * Themes are registered in FinDesktopConfig via extensions/themes.config.ts:
 * 
 * ```typescript
 * // extensions/themes.config.ts
 * import type { ThemeRegistry } from '../core/theme/ThemeTypes';
 * 
 * export const customThemes: ThemeRegistry = {
 *   light: {
 *     name: "light",
 *     displayName: "Light Mode",
 *     palette: {
 *       background: "#ffffff",
 *       surface: "#f5f5f5",
 *       primary: "#3b82f6",
 *       accent: "#8b5cf6",
 *       text: "#171717",
 *       danger: "#ef4444",
 *       success: "#10b981",
 *       border: "#e5e5e5",
 *     },
 *     density: "hd",
 *     borderRadius: 4,
 *   },
 *   dark: {
 *     name: "dark",
 *     displayName: "Dark Mode",
 *     palette: {
 *       background: "#0a0a0a",
 *       surface: "#1a1a1a",
 *       primary: "#3b82f6",
 *       accent: "#8b5cf6",
 *       text: "#e5e5e5",
 *       danger: "#ef4444",
 *       success: "#10b981",
 *       border: "#262626",
 *     },
 *     density: "hd",
 *     borderRadius: 4,
 *   },
 * };
 * 
 * // FinDesktopConfig.ts
 * export const finDesktopConfig = {
 *   // ... other config
 *   themes: customThemes,
 * };
 * ```
 * 
 * ## Component Usage
 * 
 * Internal UI components should use CSS variables instead of hard-coded colors:
 * 
 * ```css
 * .my-component {
 *   background-color: var(--fd-bg);
 *   color: var(--fd-text);
 *   border: 1px solid var(--fd-border);
 *   border-radius: var(--fd-radius);
 * }
 * 
 * .button-primary {
 *   background-color: var(--fd-primary);
 *   color: white;
 * }
 * 
 * .card {
 *   background-color: var(--fd-surface);
 *   padding: calc(1rem * var(--fd-density-spacing));
 * }
 * ```
 * 
 * ```tsx
 * // In React components with inline styles or styled-components:
 * const Card = styled.div`
 *   background: var(--fd-surface);
 *   border: 1px solid var(--fd-border);
 *   border-radius: var(--fd-radius);
 *   padding: calc(1rem * var(--fd-density-spacing));
 * `;
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Theme, ThemeRegistry, ThemeDensity } from './ThemeTypes';
import { CSS_VARIABLES, DENSITY_SPACING } from './ThemeTypes';

/**
 * Theme context value shape
 */
interface ThemeContextValue {
  /**
   * Currently active theme
   */
  theme: Theme;

  /**
   * Switch to a different theme by name
   * @param themeName - Name of the theme to activate
   */
  setTheme: (themeName: string) => void;

  /**
   * List of all available themes
   */
  availableThemes: Theme[];

  /**
   * Theme registry (all themes keyed by name)
   */
  themeRegistry: ThemeRegistry;
}

/**
 * Theme context - provides theme state to all components
 */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  /**
   * Child components that will have access to theme context
   */
  children: React.ReactNode;

  /**
   * Initial theme name to use on mount
   * If not provided, will try to restore from localStorage or use first available theme
   */
  initialThemeName?: string;

  /**
   * Theme registry containing all available themes
   * Typically comes from FinDesktopConfig.themes
   */
  themes: ThemeRegistry;

  /**
   * localStorage key for persisting theme preference
   * @default "finDesktop.theme"
   */
  storageKey?: string;
}

/**
 * Default theme (fallback if no themes are provided)
 */
const DEFAULT_THEME: Theme = {
  name: 'default',
  displayName: 'Default',
  palette: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    primary: '#3b82f6',
    accent: '#8b5cf6',
    text: '#e5e5e5',
    danger: '#ef4444',
    success: '#10b981',
    border: '#262626',
  },
  density: 'hd',
  borderRadius: 4,
};

/**
 * Apply theme to CSS variables on document root
 * 
 * This function synchronizes the theme object with CSS custom properties
 * so that all components can use var(--fd-*) to access theme values.
 * 
 * @param theme - Theme to apply
 */
function applyThemeToCssVariables(theme: Theme): void {
  const root = document.documentElement.style;

  // Apply palette colors
  root.setProperty(CSS_VARIABLES.background, theme.palette.background);
  root.setProperty(CSS_VARIABLES.surface, theme.palette.surface);
  root.setProperty(CSS_VARIABLES.primary, theme.palette.primary);
  root.setProperty(CSS_VARIABLES.accent, theme.palette.accent);
  root.setProperty(CSS_VARIABLES.text, theme.palette.text);
  root.setProperty(CSS_VARIABLES.danger, theme.palette.danger);
  root.setProperty(CSS_VARIABLES.success, theme.palette.success);

  // Optional colors (with fallbacks)
  if (theme.palette.border) {
    root.setProperty(CSS_VARIABLES.border, theme.palette.border);
  } else {
    // Derive border color from surface if not provided
    root.setProperty(CSS_VARIABLES.border, theme.palette.surface);
  }

  if (theme.palette.warning) {
    root.setProperty(CSS_VARIABLES.warning, theme.palette.warning);
  }

  if (theme.palette.info) {
    root.setProperty(CSS_VARIABLES.info, theme.palette.info);
  }

  if (theme.palette.textSecondary) {
    root.setProperty(CSS_VARIABLES.textSecondary, theme.palette.textSecondary);
  } else {
    // Derive secondary text color if not provided
    root.setProperty(CSS_VARIABLES.textSecondary, theme.palette.text);
  }

  // Apply shape
  root.setProperty(CSS_VARIABLES.borderRadius, `${theme.borderRadius}px`);

  // Apply density
  root.setProperty(CSS_VARIABLES.density, theme.density);
  
  // Apply density spacing multiplier for padding/margin calculations
  const spacingMultiplier = DENSITY_SPACING[theme.density as ThemeDensity] || 1.0;
  root.setProperty('--fd-density-spacing', spacingMultiplier.toString());

  // Apply font family if specified
  if (theme.fontFamily) {
    root.setProperty(CSS_VARIABLES.fontFamily, theme.fontFamily);
  }

  // Add theme name as data attribute for debugging
  document.documentElement.setAttribute('data-theme', theme.name);
  
  console.log(`[ThemeManager] Applied theme: ${theme.displayName || theme.name}`);
}

/**
 * Theme Provider Component
 * 
 * Wrap your application with this provider to enable theme management.
 * 
 * @example
 * ```tsx
 * import { ThemeProvider } from './core/theme/ThemeManager';
 * import { finDesktopConfig } from './config/FinDesktopConfig';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider themes={finDesktopConfig.themes} initialThemeName="dark">
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({
  children,
  initialThemeName,
  themes,
  storageKey = 'finDesktop.theme',
}: ThemeProviderProps) {
  // Convert registry to array for easier iteration
  const availableThemes = Object.values(themes);

  // Determine initial theme
  const getInitialTheme = (): Theme => {
    // 1. Try to restore from localStorage
    try {
      const savedThemeName = localStorage.getItem(storageKey);
      if (savedThemeName && themes[savedThemeName]) {
        console.log(`[ThemeManager] Restored theme from localStorage: ${savedThemeName}`);
        return themes[savedThemeName];
      }
    } catch (error) {
      console.warn('[ThemeManager] Failed to read from localStorage:', error);
    }

    // 2. Use provided initial theme
    if (initialThemeName && themes[initialThemeName]) {
      return themes[initialThemeName];
    }

    // 3. Use first available theme
    if (availableThemes.length > 0) {
      return availableThemes[0];
    }

    // 4. Fallback to default theme
    console.warn('[ThemeManager] No themes available, using default theme');
    return DEFAULT_THEME;
  };

  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);

  /**
   * Switch to a different theme
   */
  const setTheme = useCallback(
    (themeName: string) => {
      const newTheme = themes[themeName];

      if (!newTheme) {
        console.error(`[ThemeManager] Theme not found: ${themeName}`);
        return;
      }

      // Update state
      setCurrentTheme(newTheme);

      // Persist to localStorage
      try {
        localStorage.setItem(storageKey, themeName);
        console.log(`[ThemeManager] Theme persisted: ${themeName}`);
      } catch (error) {
        console.warn('[ThemeManager] Failed to persist theme to localStorage:', error);
      }
    },
    [themes, storageKey]
  );

  /**
   * Apply theme to CSS variables whenever it changes
   */
  useEffect(() => {
    applyThemeToCssVariables(currentTheme);
  }, [currentTheme]);

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    console.log('[ThemeManager] Initialized with themes:', Object.keys(themes));
  }, [themes]);

  const contextValue: ThemeContextValue = {
    theme: currentTheme,
    setTheme,
    availableThemes,
    themeRegistry: themes,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * 
 * Must be used within a ThemeProvider.
 * 
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, availableThemes } = useTheme();
 * 
 *   return (
 *     <div style={{ background: theme.palette.background }}>
 *       <h1>Current theme: {theme.name}</h1>
 *       <button onClick={() => setTheme('dark')}>Switch to Dark</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Wrap your app with <ThemeProvider themes={...}> to enable theming.'
    );
  }

  return context;
}

/**
 * Hook to access current theme only (for components that just need to read theme)
 * 
 * @returns Current theme
 * @throws Error if used outside ThemeProvider
 */
export function useCurrentTheme(): Theme {
  const { theme } = useTheme();
  return theme;
}

/**
 * Export types for external use
 */
export type { ThemeContextValue, ThemeProviderProps };
